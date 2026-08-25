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
  | "APP_REGISTRATION"     // PESU Academy / In-App
  | "REGISTRATION_FORM"    // External Google Form / Portal
  | "ASSESSMENT_LINK"      // OT / HackerRank / Wheebox / Test slots
  | "SHORTLIST_RELEASED"   // Shortlist PDF / Candidate Table
  | "INTERVIEW_SCHEDULE"   // Interview slots / Panel links
  | "OFFER_ANNOUNCEMENT"   // Final Results & Offer Letters
  | "GENERAL_UPDATE";      // General announcement or schedule update

export type ActionPortalType =
  | "PESU_ACADEMY"
  | "GOOGLE_FORM"
  | "EXTERNAL_PORTAL"
  | "ASSESSMENT_PLATFORM"
  | "OFFLINE_CAMPUS"
  | "EMAIL_REPLY";

export type Tier = "TIER_1" | "TIER_2" | "TIER_3" | "MASS_HIRING";

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

export interface PlacementEvent {
  id: string;
  companyId: string;
  eventType: EventType;
  subject: string;
  senderEmail: string;
  receivedAt: string; // ISO string
  deadline?: string | null; // ISO string
  actionUrl?: string | null;
  actionPortal: ActionPortalType;
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
  
  // Computed client-side / enriched
  eligibility?: {
    status: EligibilityStatus;
    reason: string;
    diff: number; // user CGPA - cutoff
  };
}

export interface GeminiExtractionResult {
  isPlacementEmail: boolean;
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
  detectedEvent?: EventType;
  status: "SUCCESS" | "SKIPPED" | "FAILED";
  errorMessage?: string;
  timestamp: string;
}

export interface FilterState {
  search: string;
  eligibility: "ALL" | EligibilityStatus;
  stage: "ALL" | EventType;
  tier: "ALL" | Tier;
  urgentOnly: boolean;
  status: "ALL" | DriveStatus;
}
