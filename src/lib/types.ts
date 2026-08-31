export type Category = "COMPANY" | "HACKATHON" | "WORKSHOP" | "NOTICE";

export type DriveStatus =
  | "ACTIVE"
  | "APPLIED"
  | "ASSESSMENT_COMPLETED"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "REJECTED"
  | "OFFERED"
  | "EXPIRED";

export type EventType =
  // Company Placement Stages
  | "APP_REGISTRATION"     // PESU Academy / In-App
  | "REGISTRATION_FORM"    // External Google Form / Portal
  | "ASSESSMENT_LINK"      // OT / HackerRank / Wheebox / Test slots
  | "SHORTLIST_RELEASED"   // Shortlist PDF / Candidate Table / Excel
  | "INTERVIEW_SCHEDULE"   // Interview slots / Panel links
  | "OFFER_ANNOUNCEMENT"   // Final Results & Offer Letters
  // Hackathon & Contest Stages
  | "HACKATHON_REGISTRATION" // Team / Individual registration
  | "PROBLEM_STATEMENT"      // Track / PS release
  | "SUBMISSION_DEADLINE"    // Project / Prototype submission
  | "FINALE_SCHEDULE"        // Pitching / Presentation / Demo round
  | "RESULTS_ANNOUNCEMENT"   // Winners / Cash prize announcement
  // Workshop & Academic Stages
  | "WORKSHOP_REGISTRATION"  // Bootcamp / Seminar registration
  | "SESSION_LINK"           // Meet / Zoom link & joining info
  | "GENERAL_UPDATE";        // General announcement or schedule update

export type ActionPortalType =
  | "PESU_ACADEMY"
  | "GOOGLE_FORM"
  | "EXTERNAL_PORTAL"
  | "ASSESSMENT_PLATFORM"
  | "OFFLINE_CAMPUS"
  | "EMAIL_REPLY";

export type Tier = "TIER_1" | "TIER_2" | "TIER_3" | "MASS_HIRING" | "COMPETITION" | "LEARNING";

export type EligibilityStatus = "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE" | "NOT_SPECIFIED";

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  usn: string;
  branch: string;
  cgpa: number;
  batch: number;
  activeBacklogs: number;
}

export interface ActionItem {
  id: string;
  companyId: string;
  eventId?: string;
  title: string;
  portalType: ActionPortalType;
  link?: string | null;
  deadline?: string | null; // ISO string
  isCompleted: boolean;
  completedAt?: string | null;
  priority: number; // 1 = High/Urgent (<24h), 2 = Medium, 3 = Normal
}

export interface ExcelAttachment {
  filename: string;
  url?: string;
  candidateCount?: number;
  previewSnippet?: string;
  fileSize?: string;
}

export interface PlacementEvent {
  id: string;
  companyId: string;
  mailIndex?: number; // e.g. 1 for m1, 2 for m2, 3 for m3
  eventType: EventType;
  subject: string;
  senderEmail: string;
  receivedAt: string; // ISO string
  deadline?: string | null; // ISO string
  actionUrl?: string | null;
  actionPortal: ActionPortalType;
  
  // Specific important info
  formUrl?: string | null;
  isPesuAcademy?: boolean;
  pesuAcademyDirective?: string | null;
  excelAttachment?: ExcelAttachment | null;
  highlights?: string[];
  
  shortlistCount?: number | null;
  shortlistSnippet?: string | null;
  instructions?: string | null;
  summary: string;
  rawBody: string;
  gmailMessageId?: string;
  gmailThreadId?: string;
  llmConfidence: number;
  actions?: ActionItem[];
}

export interface CompanyDrive {
  id: string;
  name: string;
  canonicalName: string;
  category: Category;
  logoUrl?: string | null;
  role: string;
  ctc: string;
  stipend?: string | null;
  tier: Tier;
  minCgpa?: number | null;
  allowedBranches: string[];
  maxBacklogs: number;
  status: DriveStatus;
  currentStage: EventType;
  latestDeadline?: string | null;
  notes?: string | null;
  events: PlacementEvent[];
  actions: ActionItem[];
  
  // Optional metadata / criteria string (non-blocking)
  criteriaInfo?: string;
  // Computed client-side / enriched
  eligibility?: {
    status: EligibilityStatus;
    reason: string;
    diff: number;
  };
}

export interface GeminiExtractionResult {
  isPlacementEmail: boolean;
  category: Category;
  companyName: string;
  canonicalName: string;
  eventType: EventType;
  role: string;
  ctc?: string;
  stipend?: string;
  minCgpa?: number;
  allowedBranches: string[];
  maxBacklogs?: number;
  actionRequired: boolean;
  actionTitle?: string;
  actionPortal: ActionPortalType;
  actionUrl?: string;
  deadline?: string; // ISO 8601 string or null
  
  excelAttachment?: ExcelAttachment | null;
  formUrl?: string | null;
  isPesuAcademy?: boolean;
  pesuAcademyDirective?: string | null;
  highlights?: string[];

  shortlistCount?: number;
  shortlistSnippet?: string;
  instructions?: string;
  summary: string;
  confidenceScore: number;
}

export interface IngestionLogEntry {
  id: string;
  gmailMessageId?: string;
  sender: string;
  subject: string;
  parsedCompany?: string;
  category?: Category;
  detectedEvent?: EventType;
  status: "SUCCESS" | "SKIPPED" | "FAILED";
  errorMessage?: string;
  timestamp: string;
}

export interface FilterState {
  search: string;
  category: "ALL" | Category;
  stage: "ALL" | EventType;
  urgentOnly: boolean;
  status: "ALL" | DriveStatus;
}

