import { Category } from "./types";

/**
 * Entity Resolution and Categorizer for PES University Emails
 * Categorizes and normalizes emails into buckets:
 * - COMPANY: Goldman Sachs, Cisco, Akamai, Microsoft, Amazon, etc.
 * - HACKATHON: Smart India Hackathon, SIH, PES HackNight, HackOverflow, Ideathon, Flipkart GRiD, HashCode, etc.
 * - WORKSHOP: AI/ML Workshop, Cloud Bootcamp, Guest Lectures, Resume Reviews, Tech Talks.
 * - NOTICE: Placement Policy, Exam Notices, Hall Tickets, General College Announcements.
 */

const HACKATHON_MAPPINGS: Record<string, string[]> = {
  "Smart India Hackathon (SIH)": ["sih", "smart india hackathon", "sih 2026", "sih 2025", "smart india"],
  "Flipkart GRiD": ["flipkart grid", "grid 6.0", "grid 5.0", "flipkart challenge"],
  "PES Inter-Campus HackNight": ["hacknight", "pes hacknight", "pes hackathon", "hackpes", "pes hacks"],
  "Google Solution Challenge": ["google solution challenge", "solution challenge", "gdsc solution challenge"],
  "TCS CodeVita": ["codevita", "tcs codevita"],
  "Tata Crucible Hackathon": ["tata crucible", "crucible hackathon"],
  "Devfolio Hackathon": ["devfolio", "ethindia", "hackout"],
  "PES AI Ideathon": ["ideathon", "ai ideathon", "pes ideathon", "innovation challenge", "datathon"],
};

const CANONICAL_MAPPINGS: Record<string, string[]> = {
  "Goldman Sachs": ["goldman", "goldman sachs", "gs", "gs india", "goldman sachs india", "gs drive"],
  "Cisco": ["cisco", "cisco systems", "cisco india", "cisco bangalore"],
  "Akamai": ["akamai", "akamai technologies", "akamai networks"],
  "Microsoft": ["microsoft", "msft", "microsoft india", "microsoft r&d"],
  "Amazon": ["amazon", "amazon web services", "aws", "amazon india", "amazon dev centre"],
  "Google": ["google", "google india", "alphabet"],
  "Atlassian": ["atlassian", "atlassian india"],
  "Morgan Stanley": ["morgan stanley", "ms"],
  "Texas Instruments": ["texas instruments", "ti", "texas instruments india"],
  "Qualcomm": ["qualcomm", "qualcomm india"],
  "Nvidia": ["nvidia", "nvidia graphics"],
  "Oracle": ["oracle", "oracle india", "ofss", "oracle fss"],
  "Intuit": ["intuit", "intuit india"],
  "Salesforce": ["salesforce", "salesforce india"],
  "Adobe": ["adobe", "adobe systems", "adobe india"],
  "Walmart Global Tech": ["walmart", "walmart global tech", "walmart labs", "walmart india"],
  "SAP Labs": ["sap", "sap labs", "sap india"],
  "Target Corporation": ["target", "target india", "target corporation"],
  "JP Morgan Chase": ["jp morgan", "jpmc", "jp morgan chase", "jpmorgan"],
  "Schneider Electric": ["schneider", "schneider electric"],
  "Mercedes-Benz R&D": ["mercedes", "mercedes benz", "mbrdi", "mercedes-benz"],
  "Siemens": ["siemens", "siemens eda", "siemens healthineers"],
  "Robert Bosch": ["bosch", "robert bosch", "rbdi"],
};

export function resolveCanonicalEntity(
  rawName: string,
  subject: string = "",
  body: string = ""
): { name: string; canonicalName: string; category: Category } {
  const combined = `${rawName} ${subject} ${body}`.toLowerCase();

  // 1. Detect Hackathon / Competition Bucket
  const isHackathonKeywords = [
    "hackathon", "ideathon", "datathon", "codeathon", "contest", "competition",
    "challenge", "smart india hackathon", "sih", "flipkart grid", "hacknight",
    "devfolio", "problem statement", "prize money", "cash prize", "hack "
  ];

  if (isHackathonKeywords.some((k) => combined.includes(k))) {
    for (const [canonical, aliases] of Object.entries(HACKATHON_MAPPINGS)) {
      for (const alias of aliases) {
        if (combined.includes(alias)) {
          return { name: canonical, canonicalName: canonical, category: "HACKATHON" };
        }
      }
    }

    // Try to extract hackathon name from subject or rawName
    const hackMatch = subject.match(/(?:Hackathon|Challenge|Contest|Competition|Ideathon|SIH)[\s:-]+([A-Za-z0-9\s&–-]+)/i)
      || rawName.match(/([A-Za-z0-9\s&–-]+(?:Hackathon|Challenge|Contest|Competition|Ideathon))/i);
    const hackName = hackMatch && hackMatch[1] ? hackMatch[1].trim() : (rawName || "Campus Hackathon");
    return {
      name: hackName,
      canonicalName: hackName,
      category: "HACKATHON",
    };
  }

  // 2. Detect Workshop / Seminar / Guest Lecture Bucket
  const isWorkshopKeywords = [
    "workshop", "bootcamp", "seminar", "webinar", "guest lecture", "tech talk",
    "masterclass", "training session", "hands-on session", "speaker series"
  ];

  if (isWorkshopKeywords.some((k) => combined.includes(k))) {
    const workshopMatch = subject.match(/(?:Workshop|Bootcamp|Seminar|Webinar|Masterclass|Session)[\s:-]+([A-Za-z0-9\s&–-]+)/i)
      || subject.match(/([A-Za-z0-9\s&–-]+(?:Workshop|Bootcamp|Masterclass|Webinar))/i);
    const wsName = workshopMatch && workshopMatch[1] ? workshopMatch[1].trim() : (rawName || "Technical Workshop");
    return {
      name: wsName,
      canonicalName: wsName,
      category: "WORKSHOP",
    };
  }

  // 3. Detect Placement Policy / Academic / General Notice Bucket
  const isNoticeKeywords = [
    "placement policy", "code of conduct", "hall ticket", "admit card",
    "exam schedule", "academic calendar", "rules and regulations", "circular",
    "important instructions for all students", "mandatory meeting", "all students briefing"
  ];

  if (isNoticeKeywords.some((k) => combined.includes(k)) && !combined.includes("recruitment") && !combined.includes("hiring")) {
    const noticeName = subject.replace(/^(?:Urgent|Notice|Important|Announcement)[\s:-]+/i, "").trim() || "Placement Notice";
    return {
      name: noticeName.substring(0, 50),
      canonicalName: noticeName.substring(0, 50),
      category: "NOTICE",
    };
  }

  // 4. Default to Company Drive
  const clean = (rawName || "").trim();
  const lower = clean.toLowerCase();

  for (const [canonical, aliases] of Object.entries(CANONICAL_MAPPINGS)) {
    for (const alias of aliases) {
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (lower === alias || regex.test(lower) || regex.test(subject.toLowerCase())) {
        return {
          name: canonical,
          canonicalName: canonical,
          category: "COMPANY",
        };
      }
    }
  }

  // Fallback: Clean suffix like "India", "Technologies", "Pvt Ltd", "Campus Drive"
  let simplified = clean
    .replace(/\b(Pvt\.?|Ltd\.?|Private Limited|Technologies|Systems|Solutions|India|Campus Drive|Hiring|Drive|2026|2025)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!simplified) simplified = clean || "Campus Opportunity";

  return {
    name: clean || simplified,
    canonicalName: simplified,
    category: "COMPANY",
  };
}

// Retain backwards-compatible alias
export function resolveCanonicalCompany(rawName: string): { name: string; canonicalName: string } {
  const res = resolveCanonicalEntity(rawName);
  return { name: res.name, canonicalName: res.canonicalName };
}

