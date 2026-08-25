import {
  CompanyDrive,
  PlacementEvent,
  ActionItem,
  StudentProfile,
  IngestionLogEntry,
  DriveStatus,
  EventType,
  ActionPortalType,
  Tier,
} from "./types";
import { evaluateEligibility } from "./eligibility";
import { resolveCanonicalCompany } from "./companyResolver";
import { parseEmailWithGemini } from "./gemini";

// Default Profile initialized with user's exact specification: CGPA: 7.62
export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: "pes-student-01",
  name: "Candidate",
  email: "candidate@pes.edu",
  usn: "PES2UG22CS001",
  branch: "CSE",
  cgpa: 7.62,
  batch: 2026,
  activeBacklogs: 0,
};

// Start with a clean slate
function createInitialState(): {
  profile: StudentProfile;
  drives: CompanyDrive[];
  logs: IngestionLogEntry[];
} {
  return {
    profile: { ...DEFAULT_STUDENT_PROFILE },
    drives: [],
    logs: [],
  };
}

// Global in-memory singleton store
class PlacementStore {
  private state: {
    profile: StudentProfile;
    drives: CompanyDrive[];
    logs: IngestionLogEntry[];
  };

  constructor() {
    this.state = createInitialState();
  }

  public getProfile(): StudentProfile {
    return { ...this.state.profile };
  }

  public updateProfile(updates: Partial<StudentProfile>): StudentProfile {
    this.state.profile = { ...this.state.profile, ...updates };
    return this.getProfile();
  }

  public getDrives(): CompanyDrive[] {
    const student = this.state.profile;
    const now = Date.now();

    return this.state.drives.map((drive) => {
      const eligibility = evaluateEligibility(drive, student);
      
      // Auto-expire drive if active but deadline has already passed
      let computedStatus = drive.status;
      if (
        computedStatus === "ACTIVE" &&
        drive.latestDeadline &&
        new Date(drive.latestDeadline).getTime() < now
      ) {
        computedStatus = "EXPIRED";
      }

      return {
        ...drive,
        status: computedStatus,
        eligibility,
      };
    });
  }

  public getDriveById(id: string): CompanyDrive | undefined {
    const drives = this.getDrives();
    return drives.find((d) => d.id === id);
  }

  public getLogs(): IngestionLogEntry[] {
    return [...this.state.logs].reverse();
  }

  public toggleActionItem(actionId: string): ActionItem | null {
    for (const drive of this.state.drives) {
      const action = drive.actions.find((a) => a.id === actionId);
      if (action) {
        action.isCompleted = !action.isCompleted;
        action.completedAt = action.isCompleted ? new Date().toISOString() : null;
        return { ...action };
      }
    }
    return null;
  }

  public updateDriveStatus(driveId: string, status: DriveStatus): CompanyDrive | null {
    const drive = this.state.drives.find((d) => d.id === driveId);
    if (drive) {
      drive.status = status;
      return this.getDriveById(driveId) || null;
    }
    return null;
  }

  public clearAllDrives(): void {
    this.state.drives = [];
    this.state.logs = [];
  }

  public async ingestRawEmail(email: {
    subject: string;
    sender: string;
    body: string;
    receivedAt?: string;
    gmailMessageId?: string;
  }): Promise<{ drive: CompanyDrive; event: PlacementEvent; log: IngestionLogEntry }> {
    const receivedAt = email.receivedAt || new Date().toISOString();
    const now = Date.now();
    
    // 1. LLM Structured Extraction
    const extraction = await parseEmailWithGemini({
      subject: email.subject,
      sender: email.sender,
      body: email.body,
      receivedAt,
    });

    const canonicalInfo = resolveCanonicalCompany(extraction.companyName || extraction.canonicalName);
    const canonicalName = canonicalInfo.canonicalName;
    const displayName = extraction.companyName || canonicalInfo.name;

    // 2. Find or Create Parent Company Drive Node
    let parentDrive = this.state.drives.find(
      (d) => d.canonicalName.toLowerCase() === canonicalName.toLowerCase()
    );

    // Check if initial status is expired due to past deadline
    const isPastDeadline = extraction.deadline && new Date(extraction.deadline).getTime() < now;
    const initialStatus: DriveStatus = isPastDeadline ? "EXPIRED" : "ACTIVE";

    if (!parentDrive) {
      parentDrive = {
        id: `drive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: displayName,
        canonicalName,
        logoUrl: `https://logo.clearbit.com/${canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        role: extraction.role || "Software Engineer",
        ctc: extraction.ctc || "Competitive",
        stipend: extraction.stipend || null,
        tier: (extraction.ctc && parseInt(extraction.ctc) >= 15 ? "TIER_1" : "TIER_2") as Tier,
        minCgpa: extraction.minCgpa && extraction.minCgpa > 0 ? extraction.minCgpa : 7.0,
        allowedBranches: extraction.allowedBranches.length > 0 ? extraction.allowedBranches : ["CSE", "ISE", "ECE"],
        maxBacklogs: extraction.maxBacklogs ?? 0,
        status: initialStatus,
        currentStage: extraction.eventType,
        latestDeadline: extraction.deadline || null,
        events: [],
        actions: [],
      };
      this.state.drives.unshift(parentDrive);
    } else {
      parentDrive.currentStage = extraction.eventType;
      if (extraction.deadline) {
        parentDrive.latestDeadline = extraction.deadline;
      }
      if (extraction.eventType === "SHORTLIST_RELEASED") {
        parentDrive.status = "SHORTLISTED";
      } else if (extraction.eventType === "OFFER_ANNOUNCEMENT") {
        parentDrive.status = "OFFERED";
      } else if (parentDrive.status === "ACTIVE" && isPastDeadline) {
        parentDrive.status = "EXPIRED";
      }
    }

    // 3. Create Child Lifecycle Event Node
    const eventId = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newEvent: PlacementEvent = {
      id: eventId,
      companyId: parentDrive.id,
      eventType: extraction.eventType,
      subject: email.subject,
      senderEmail: email.sender,
      receivedAt,
      deadline: extraction.deadline || null,
      actionUrl: extraction.actionUrl || null,
      actionPortal: extraction.actionPortal,
      shortlistCount: extraction.shortlistCount || null,
      shortlistSnippet: extraction.shortlistSnippet || null,
      instructions: extraction.instructions || null,
      summary: extraction.summary,
      rawBody: email.body,
      gmailMessageId: email.gmailMessageId || `msg_${Date.now()}`,
      llmConfidence: extraction.confidenceScore || 0.95,
    };

    parentDrive.events.push(newEvent);

    // 4. Create Action Item only if not already expired/past
    if (extraction.actionRequired && extraction.actionTitle) {
      const isActionExpired = extraction.deadline && new Date(extraction.deadline).getTime() < now;
      const actionItem: ActionItem = {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        companyId: parentDrive.id,
        eventId: newEvent.id,
        title: extraction.actionTitle,
        portalType: extraction.actionPortal,
        link: extraction.actionUrl || null,
        deadline: extraction.deadline || null,
        isCompleted: Boolean(isActionExpired), // Mark as done/expired if from the past
        priority: extraction.deadline && (new Date(extraction.deadline).getTime() - now < 24 * 3600 * 1000) ? 1 : 2,
      };
      parentDrive.actions.unshift(actionItem);
    }

    // 5. Ingestion Log Entry
    const log: IngestionLogEntry = {
      id: `log-${Date.now()}`,
      gmailMessageId: email.gmailMessageId,
      sender: email.sender,
      subject: email.subject,
      parsedCompany: canonicalName,
      detectedEvent: extraction.eventType,
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
    };
    this.state.logs.push(log);

    const enrichedDrive = this.getDriveById(parentDrive.id)!;
    return { drive: enrichedDrive, event: newEvent, log };
  }

  public resetDemo(): void {
    this.clearAllDrives();
  }
}

// Global instance for Next.js server runtime
const globalStore = global as unknown as { __placementStore?: PlacementStore };

export const placementStore = globalStore.__placementStore || new PlacementStore();
if (process.env.NODE_ENV !== "production") {
  globalStore.__placementStore = placementStore;
}
