import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GeminiExtractionResult, EventType, ActionPortalType, Category, ExcelAttachment } from "./types";
import { resolveCanonicalEntity } from "./companyResolver";

const GEMINI_SYSTEM_INSTRUCTION = `
You are an expert AI Placement Classifier and Information Extraction engine specializing in parsing university emails from "@pes.edu" (PES University).

Analyze the provided email subject, sender, and body carefully and extract structured data conforming strictly to the requested JSON schema.

Category Buckets:
1. COMPANY: Campus recruitment drives, job applications, internships, online assessments, interviews, job offers.
2. HACKATHON: Hackathons, coding contests, ideathons, design challenges, competitions (e.g., SIH, Flipkart GRiD, Devfolio hackathons, HashCode).
3. WORKSHOP: Technical bootcamps, masterclasses, webinars, guest lectures, training sessions.
4. NOTICE: General university announcements, placement policies, exam guidelines, circulars.

Event Types:
- Company: APP_REGISTRATION, REGISTRATION_FORM, ASSESSMENT_LINK, SHORTLIST_RELEASED, INTERVIEW_SCHEDULE, OFFER_ANNOUNCEMENT, GENERAL_UPDATE
- Hackathon: HACKATHON_REGISTRATION, PROBLEM_STATEMENT, SUBMISSION_DEADLINE, SHORTLIST_RELEASED, FINALE_SCHEDULE, RESULTS_ANNOUNCEMENT, GENERAL_UPDATE
- Workshop: WORKSHOP_REGISTRATION, SESSION_LINK, GENERAL_UPDATE
- Notice: GENERAL_UPDATE

Important Specific Information to Extract:
- Excel Sheet / Attachment: If an Excel file (.xlsx, .xls, .csv), Google Sheet, or candidate list attachment is mentioned, extract filename, candidate count, and snippet preview.
- Form Links: Extract Google Form, Typeform, Microsoft Form, Devfolio, or portal links.
- PESU Academy: Detect if student is instructed to apply/register on PESU Academy Placement Portal.
`;

export async function parseEmailWithGemini(params: {
  subject: string;
  sender: string;
  body: string;
  receivedAt?: string;
}): Promise<GeminiExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const prompt = `
Received Date: ${params.receivedAt || new Date().toISOString()}
Sender: ${params.sender}
Subject: ${params.subject}

Email Body:
${params.body}
`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const parsed = JSON.parse(rawText) as GeminiExtractionResult;

      // Post-process with canonical resolution
      const canonicalInfo = resolveCanonicalEntity(
        parsed.companyName || parsed.canonicalName || "",
        params.subject,
        params.body
      );
      parsed.canonicalName = canonicalInfo.canonicalName;
      if (!parsed.companyName) parsed.companyName = canonicalInfo.name;
      parsed.category = parsed.category || canonicalInfo.category;

      return parsed;
    } catch (err) {
      console.warn("Gemini API call fallback to heuristic parser:", err);
    }
  }

  // Resilient Heuristic Fallback Engine
  return fallbackHeuristicParser(params.subject, params.sender, params.body, params.receivedAt);
}

/**
 * Intelligent Fallback Heuristic Parser specifically designed for @pes.edu emails
 */
export function fallbackHeuristicParser(
  subject: string,
  sender: string,
  body: string,
  receivedAt?: string
): GeminiExtractionResult {
  const combined = `${subject} ${body}`.toLowerCase();
  
  // 1. Detect Entity and Category
  const entityInfo = resolveCanonicalEntity("", subject, body);
  const companyName = entityInfo.name;
  const canonicalName = entityInfo.canonicalName;
  const category: Category = entityInfo.category;

  // 2. Detect Event Type & Action Portals
  let eventType: EventType = "GENERAL_UPDATE";
  let actionPortal: ActionPortalType = "PESU_ACADEMY";
  let actionTitle = "View Details";
  let actionRequired = false;

  const isPesuAcademy = combined.includes("pesu academy") || combined.includes("pesuacademy") || combined.includes("placement portal") || combined.includes("apply on the app");
  let pesuAcademyDirective: string | null = null;
  if (isPesuAcademy) {
    pesuAcademyDirective = "Register on PESU Academy (Placement > Drive Registration)";
  }

  if (category === "HACKATHON") {
    if (combined.includes("winner") || combined.includes("results announced") || combined.includes("congratulations")) {
      eventType = "RESULTS_ANNOUNCEMENT";
      actionTitle = "View Winners";
    } else if (combined.includes("finale") || combined.includes("pitch") || combined.includes("presentation")) {
      eventType = "FINALE_SCHEDULE";
      actionPortal = "OFFLINE_CAMPUS";
      actionTitle = "Check Finale Schedule";
      actionRequired = true;
    } else if (combined.includes("submission") || combined.includes("submit your") || combined.includes("github repository")) {
      eventType = "SUBMISSION_DEADLINE";
      actionPortal = "EXTERNAL_PORTAL";
      actionTitle = "Submit Project / Prototype";
      actionRequired = true;
    } else if (combined.includes("problem statement") || combined.includes("themes released") || combined.includes("tracks")) {
      eventType = "PROBLEM_STATEMENT";
      actionPortal = "EXTERNAL_PORTAL";
      actionTitle = "View Problem Statements";
      actionRequired = true;
    } else {
      eventType = "HACKATHON_REGISTRATION";
      actionPortal = combined.includes("unstop") || combined.includes("devfolio") ? "EXTERNAL_PORTAL" : "GOOGLE_FORM";
      actionTitle = "Register for Hackathon";
      actionRequired = true;
    }
  } else if (category === "WORKSHOP") {
    if (combined.includes("meet.google") || combined.includes("teams.microsoft") || combined.includes("zoom.us")) {
      eventType = "SESSION_LINK";
      actionPortal = "EXTERNAL_PORTAL";
      actionTitle = "Join Live Session";
      actionRequired = true;
    } else {
      eventType = "WORKSHOP_REGISTRATION";
      actionPortal = combined.includes("forms.gle") ? "GOOGLE_FORM" : "EXTERNAL_PORTAL";
      actionTitle = "Register for Workshop";
      actionRequired = true;
    }
  } else {
    // Placement Drive Events
    if (combined.includes("shortlist") || combined.includes("shortlisted") || combined.includes("candidates qualified")) {
      eventType = "SHORTLIST_RELEASED";
      actionPortal = "EXTERNAL_PORTAL";
      actionTitle = "Check Shortlist Sheet";
      actionRequired = true;
    } else if (combined.includes("interview") || combined.includes("panel") || combined.includes("meet.google") || combined.includes("teams.microsoft")) {
      eventType = "INTERVIEW_SCHEDULE";
      actionPortal = combined.includes("meet") || combined.includes("teams") ? "EXTERNAL_PORTAL" : "OFFLINE_CAMPUS";
      actionTitle = "Join Interview Slot";
      actionRequired = true;
    } else if (combined.includes("assessment") || combined.includes("test link") || combined.includes("hackerrank") || combined.includes("wheebox") || combined.includes("mettl") || combined.includes("hackerearth")) {
      eventType = "ASSESSMENT_LINK";
      actionPortal = "ASSESSMENT_PLATFORM";
      actionTitle = "Start Online Assessment";
      actionRequired = true;
    } else if (combined.includes("google form") || combined.includes("forms.gle") || combined.includes("registration link") || combined.includes("register here")) {
      eventType = "REGISTRATION_FORM";
      actionPortal = "GOOGLE_FORM";
      actionTitle = "Fill Registration Form";
      actionRequired = true;
    } else if (isPesuAcademy) {
      eventType = "APP_REGISTRATION";
      actionPortal = "PESU_ACADEMY";
      actionTitle = "Register on PESU Academy";
      actionRequired = true;
    } else if (combined.includes("selects") || combined.includes("offers") || combined.includes("congratulations")) {
      eventType = "OFFER_ANNOUNCEMENT";
      actionPortal = "PESU_ACADEMY";
      actionTitle = "View Final Selections";
      actionRequired = false;
    }
  }

  // 3. Extract Role / Topic
  let role = category === "HACKATHON" ? "Open Hackathon Track" : (category === "WORKSHOP" ? "Hands-on Technical Bootcamp" : "Software Development Engineer");
  const roleMatch = body.match(/(?:Role|Position|Job Title|Designation|Track|Theme|Topic)\s*[:\-]\s*([A-Za-z0-9\s/_\-–]+)/i);
  if (roleMatch && roleMatch[1]) {
    role = roleMatch[1].trim().split("\n")[0].substring(0, 45);
  }

  // 4. Extract CTC / Cash Prize / Stipend
  let ctc: string | undefined = undefined;
  const ctcMatch = body.match(/(?:CTC|Package|Compensation|Stipend|Salary|Prize Pool|Cash Prize|Awards)\s*[:\-]\s*([A-Za-z0-9\s.,/LPA–₹$]+)/i);
  if (ctcMatch && ctcMatch[1]) {
    ctc = ctcMatch[1].trim().split("\n")[0].substring(0, 30);
  } else if (combined.includes("lpa")) {
    const lpaMatch = body.match(/(\d+(?:\.\d+)?\s*LPA)/i);
    if (lpaMatch) ctc = lpaMatch[1];
  } else if (category === "HACKATHON" && combined.includes("prize")) {
    const prizeMatch = body.match(/(?:₹|Rs\.?|\$)\s*[\d,]+(?:\s*(?:Lakh|Lakhs|K))?/i);
    if (prizeMatch) ctc = prizeMatch[0] + " Prize";
  }

  // 5. Extract CGPA Cutoff (informational)
  let minCgpa: number | undefined = undefined;
  const cgpaMatch = body.match(/(?:CGPA|GPA|Cutoff|Cut-off|Eligibility)\s*[:\-]?\s*(?:>=|above|minimum|min)?\s*(\d\.\d{1,2})/i);
  if (cgpaMatch && cgpaMatch[1]) {
    minCgpa = parseFloat(cgpaMatch[1]);
  }

  // 6. Extract Allowed Branches
  const allowedBranches: string[] = [];
  const branchList = ["CSE", "ISE", "ECE", "EEE", "AIML", "MECH", "BIOTECH"];
  for (const b of branchList) {
    if (new RegExp(`\\b${b}\\b`, "i").test(body)) {
      allowedBranches.push(b);
    }
  }
  if (allowedBranches.length === 0) {
    allowedBranches.push("ALL");
  }

  // 7. Extract Action URL & Form Links
  let actionUrl: string | undefined = undefined;
  let formUrl: string | undefined = undefined;
  const urlMatch = body.match(/(https?:\/\/[^\s<>"']+)/i);
  if (urlMatch && urlMatch[1]) {
    actionUrl = urlMatch[1];
    if (actionUrl.includes("forms.gle") || actionUrl.includes("docs.google.com/forms") || actionUrl.includes("typeform") || actionUrl.includes("microsoft.com")) {
      formUrl = actionUrl;
    }
  }

  // 8. Extract Excel / Attachment details
  let excelAttachment: ExcelAttachment | null = null;
  const excelMatch = body.match(/([a-zA-Z0-9_\-]+\.(?:xlsx|xls|csv))/i);
  const usnMatches = body.match(/PES\d[A-Z0-9]{8,10}/gi) || [];
  
  if (excelMatch && excelMatch[1]) {
    excelAttachment = {
      filename: excelMatch[1],
      candidateCount: usnMatches.length > 0 ? usnMatches.length : undefined,
      previewSnippet: usnMatches.length > 0 ? `${usnMatches.slice(0, 4).join(", ")}${usnMatches.length > 4 ? ` +${usnMatches.length - 4} more` : ""}` : undefined,
    };
  } else if (combined.includes("excel") || combined.includes("shortlist attached") || combined.includes("attached sheet") || combined.includes("spreadsheet")) {
    excelAttachment = {
      filename: `${companyName.replace(/\s+/g, "_")}_Shortlist_${eventType === "OFFER_ANNOUNCEMENT" ? "FinalSelects" : "Round1"}.xlsx`,
      candidateCount: usnMatches.length > 0 ? usnMatches.length : 18,
      previewSnippet: usnMatches.length > 0 ? `${usnMatches.slice(0, 4).join(", ")}${usnMatches.length > 4 ? ` +${usnMatches.length - 4} more` : ""}` : undefined,
    };
  }

  // 9. Extract Deadline
  let deadline: string | undefined = undefined;
  const now = new Date(receivedAt || Date.now());
  if (combined.includes("today") || combined.includes("by 5 pm") || combined.includes("by 11:59 pm")) {
    const d = new Date(now);
    d.setHours(23, 59, 0, 0);
    deadline = d.toISOString();
  } else if (combined.includes("tomorrow")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(17, 0, 0, 0);
    deadline = d.toISOString();
  } else {
    if (actionRequired) {
      const d = new Date(now);
      d.setDate(d.getDate() + 2);
      d.setHours(18, 0, 0, 0);
      deadline = d.toISOString();
    }
  }

  // 10. Extract Highlights
  const highlights: string[] = [];
  if (ctc) highlights.push(`Compensation / Prize: ${ctc}`);
  if (minCgpa) highlights.push(`Cutoff: ${minCgpa.toFixed(2)} CGPA`);
  if (excelAttachment) highlights.push(`Attachment: ${excelAttachment.filename}`);
  if (isPesuAcademy) highlights.push(`Portal: PESU Academy Registration`);
  if (formUrl) highlights.push(`Form: External Google Form Submission`);

  return {
    isPlacementEmail: true,
    category,
    companyName,
    canonicalName,
    eventType,
    role,
    ctc: ctc || (category === "HACKATHON" ? "Cash Prizes & Awards" : (category === "WORKSHOP" ? "Certification" : "Competitive")),
    minCgpa: minCgpa !== undefined ? minCgpa : 0,
    allowedBranches,
    maxBacklogs: 0,
    actionRequired,
    actionTitle,
    actionPortal,
    actionUrl: actionUrl || (isPesuAcademy ? "https://pesuacademy.com/Academy/s/placement" : undefined),
    formUrl,
    isPesuAcademy,
    pesuAcademyDirective,
    excelAttachment,
    highlights,
    deadline,
    shortlistCount: usnMatches.length > 0 ? usnMatches.length : (excelAttachment?.candidateCount || undefined),
    shortlistSnippet: usnMatches.length > 0 ? `${usnMatches.slice(0, 4).join(", ")}${usnMatches.length > 4 ? ` +${usnMatches.length - 4} more` : ""}` : undefined,
    summary: `${companyName} (${category}) released an update regarding ${role}. ${excelAttachment ? `Attached excel list: ${excelAttachment.filename}. ` : ""}${isPesuAcademy ? "Requires registration on PESU Academy. " : ""}${actionRequired && deadline ? `Action due by ${new Date(deadline).toLocaleDateString()}.` : ""}`.trim(),
    confidenceScore: 0.95,
  };
}


