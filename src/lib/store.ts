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
  Category,
} from "./types";
import { resolveCanonicalEntity } from "./companyResolver";
import { parseEmailWithGemini, fallbackHeuristicParser } from "./gemini";
import { SAMPLE_PES_EMAILS } from "./sampleEmails";

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

// Seed initial state with sample emails so the site is never blank
function createInitialState(): {
  profile: StudentProfile;
  drives: CompanyDrive[];
  logs: IngestionLogEntry[];
} {
  const store = {
    profile: { ...DEFAULT_STUDENT_PROFILE },
    drives: [] as CompanyDrive[],
    logs: [] as IngestionLogEntry[],
  };

  // Seed sample drives synchronously using heuristic parser
  const now = Date.now();
  for (const email of SAMPLE_PES_EMAILS) {
    const extraction = fallbackHeuristicParser(email.subject, email.sender, email.body, email.receivedAt);
    const canonicalInfo = resolveCanonicalEntity(
      extraction.companyName || extraction.canonicalName,
      email.subject,
      email.body
    );

    const canonicalName = canonicalInfo.canonicalName;
    const displayName = extraction.companyName || canonicalInfo.name;
    const category: Category = email.expectedCategory || canonicalInfo.category || "COMPANY";

    let parentDrive = store.drives.find(
      (d) => d.canonicalName.toLowerCase() === canonicalName.toLowerCase()
    );

    const isPastDeadline = extraction.deadline && new Date(extraction.deadline).getTime() < now;
    const initialStatus: DriveStatus = isPastDeadline ? "EXPIRED" : "ACTIVE";

    if (!parentDrive) {
      parentDrive = {
        id: `drive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: displayName,
        canonicalName,
        category,
        logoUrl: `https://logo.clearbit.com/${canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        role: extraction.role || (category === "HACKATHON" ? "Open Hackathon Track" : "Campus Opportunity"),
        ctc: extraction.ctc || (category === "HACKATHON" ? "Cash Prizes & Awards" : "Competitive"),
        stipend: extraction.stipend || null,
        tier: (category === "HACKATHON" ? "COMPETITION" : (category === "WORKSHOP" ? "LEARNING" : (extraction.ctc && parseInt(extraction.ctc) >= 15 ? "TIER_1" : "TIER_2"))) as Tier,
        minCgpa: extraction.minCgpa && extraction.minCgpa > 0 ? extraction.minCgpa : null,
        allowedBranches: extraction.allowedBranches.length > 0 ? extraction.allowedBranches : ["ALL"],
        maxBacklogs: extraction.maxBacklogs ?? 0,
        status: initialStatus,
        currentStage: extraction.eventType,
        latestDeadline: extraction.deadline || null,
        criteriaInfo: extraction.minCgpa && extraction.minCgpa > 0 ? `Cutoff: ${extraction.minCgpa} CGPA` : "Open to all students",
        events: [],
        actions: [],
      };
      store.drives.push(parentDrive);
    } else {
      parentDrive.currentStage = extraction.eventType;
      if (extraction.deadline) {
        parentDrive.latestDeadline = extraction.deadline;
      }
    }

    const eventId = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const mailIndex = parentDrive.events.length + 1;
    const newEvent: PlacementEvent = {
      id: eventId,
      companyId: parentDrive.id,
      mailIndex: email.mailIndex || mailIndex,
      eventType: extraction.eventType,
      subject: email.subject,
      senderEmail: email.sender,
      receivedAt: email.receivedAt,
      deadline: extraction.deadline || null,
      actionUrl: extraction.actionUrl || null,
      actionPortal: extraction.actionPortal,
      formUrl: extraction.formUrl || null,
      isPesuAcademy: extraction.isPesuAcademy || false,
      pesuAcademyDirective: extraction.pesuAcademyDirective || null,
      excelAttachment: email.excelAttachment || extraction.excelAttachment || null,
      highlights: extraction.highlights || [],
      shortlistCount: extraction.shortlistCount || null,
      shortlistSnippet: extraction.shortlistSnippet || null,
      instructions: extraction.instructions || null,
      summary: extraction.summary,
      rawBody: email.body,
      gmailMessageId: email.id,
      llmConfidence: extraction.confidenceScore || 0.95,
    };
    parentDrive.events.push(newEvent);

    if (extraction.actionRequired && extraction.actionTitle) {
      const actionItem: ActionItem = {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        companyId: parentDrive.id,
        eventId: newEvent.id,
        title: extraction.actionTitle,
        portalType: extraction.actionPortal,
        link: extraction.actionUrl || null,
        deadline: extraction.deadline || null,
        isCompleted: Boolean(isPastDeadline),
        priority: extraction.deadline && (new Date(extraction.deadline).getTime() - now < 24 * 3600 * 1000) ? 1 : 2,
      };
      parentDrive.actions.push(actionItem);
    }
  }

  return store;
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
    const now = Date.now();

    return this.state.drives.map((drive) => {
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

  public resetDemo(): void {
    this.state = createInitialState();
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
    
    // 1. LLM / Heuristic Structured Extraction
    const extraction = await parseEmailWithGemini({
      subject: email.subject,
      sender: email.sender,
      body: email.body,
      receivedAt,
    });

    const canonicalInfo = resolveCanonicalEntity(
      extraction.companyName || extraction.canonicalName,
      email.subject,
      email.body
    );
    const canonicalName = canonicalInfo.canonicalName;
    const displayName = extraction.companyName || canonicalInfo.name;
    const category: Category = extraction.category || canonicalInfo.category || "COMPANY";

    // 2. Find or Create Parent Entity Node
    let parentDrive = this.state.drives.find(
      (d) => d.canonicalName.toLowerCase() === canonicalName.toLowerCase()
    );

    const isPastDeadline = extraction.deadline && new Date(extraction.deadline).getTime() < now;
    const initialStatus: DriveStatus = isPastDeadline ? "EXPIRED" : "ACTIVE";

    if (!parentDrive) {
      parentDrive = {
        id: `drive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: displayName,
        canonicalName,
        category,
        logoUrl: `https://logo.clearbit.com/${canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        role: extraction.role || (category === "HACKATHON" ? "Open Hackathon Track" : (category === "WORKSHOP" ? "Technical Workshop" : "Software Engineer")),
        ctc: extraction.ctc || (category === "HACKATHON" ? "Cash Prizes & Awards" : "Competitive"),
        stipend: extraction.stipend || null,
        tier: (category === "HACKATHON" ? "COMPETITION" : (category === "WORKSHOP" ? "LEARNING" : (extraction.ctc && parseInt(extraction.ctc) >= 15 ? "TIER_1" : "TIER_2"))) as Tier,
        minCgpa: extraction.minCgpa && extraction.minCgpa > 0 ? extraction.minCgpa : null,
        allowedBranches: extraction.allowedBranches.length > 0 ? extraction.allowedBranches : ["ALL"],
        maxBacklogs: extraction.maxBacklogs ?? 0,
        status: initialStatus,
        currentStage: extraction.eventType,
        latestDeadline: extraction.deadline || null,
        criteriaInfo: extraction.minCgpa && extraction.minCgpa > 0 ? `Cutoff: ${extraction.minCgpa} CGPA` : "Open to all students",
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
      } else if (extraction.eventType === "OFFER_ANNOUNCEMENT" || extraction.eventType === "RESULTS_ANNOUNCEMENT") {
        parentDrive.status = "OFFERED";
      } else if (parentDrive.status === "ACTIVE" && isPastDeadline) {
        parentDrive.status = "EXPIRED";
      }
    }

    // 3. Create Child Lifecycle Event Node with mail tree index
    const eventId = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const mailIndex = parentDrive.events.length + 1;
    const newEvent: PlacementEvent = {
      id: eventId,
      companyId: parentDrive.id,
      mailIndex,
      eventType: extraction.eventType,
      subject: email.subject,
      senderEmail: email.sender,
      receivedAt,
      deadline: extraction.deadline || null,
      actionUrl: extraction.actionUrl || null,
      actionPortal: extraction.actionPortal,
      formUrl: extraction.formUrl || null,
      isPesuAcademy: extraction.isPesuAcademy || false,
      pesuAcademyDirective: extraction.pesuAcademyDirective || null,
      excelAttachment: extraction.excelAttachment || null,
      highlights: extraction.highlights || [],
      shortlistCount: extraction.shortlistCount || null,
      shortlistSnippet: extraction.shortlistSnippet || null,
      instructions: extraction.instructions || null,
      summary: extraction.summary,
      rawBody: email.body,
      gmailMessageId: email.gmailMessageId || `msg_${Date.now()}`,
      llmConfidence: extraction.confidenceScore || 0.95,
    };

    parentDrive.events.push(newEvent);

    // 4. Create Action Item
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
        isCompleted: Boolean(isActionExpired),
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
      category,
      detectedEvent: extraction.eventType,
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
    };
    this.state.logs.push(log);

    const enrichedDrive = this.getDriveById(parentDrive.id)!;
    return { drive: enrichedDrive, event: newEvent, log };
  }
}

// Global instance for Next.js server runtime
const globalStore = global as unknown as { __placementStore?: PlacementStore };

export const placementStore = globalStore.__placementStore || new PlacementStore();
if (process.env.NODE_ENV !== "production") {
  globalStore.__placementStore = placementStore;
}


