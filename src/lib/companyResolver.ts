/**
 * Company Entity Resolution and Normalizer for College Placement Emails
 * Resolves variations like:
 * - "Goldman Sachs India Drive 2026", "GS Shortlist", "Goldman Sachs Bangalore" -> "Goldman Sachs"
 * - "Cisco Systems Campus Hiring", "Cisco Ideathon" -> "Cisco"
 * - "Akamai Technologies Bangalore", "Akamai SDE Drive" -> "Akamai"
 */

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

export function resolveCanonicalCompany(rawName: string): { name: string; canonicalName: string } {
  if (!rawName || !rawName.trim()) {
    return { name: "Unknown Company", canonicalName: "Unknown Company" };
  }

  const clean = rawName.trim();
  const lower = clean.toLowerCase();

  for (const [canonical, aliases] of Object.entries(CANONICAL_MAPPINGS)) {
    for (const alias of aliases) {
      // Check for exact word or word boundary match
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (lower === alias || regex.test(lower)) {
        return {
          name: clean,
          canonicalName: canonical,
        };
      }
    }
  }

  // Fallback: Clean suffix like "India", "Technologies", "Pvt Ltd", "Campus Drive"
  let simplified = clean
    .replace(/\b(Pvt\.?|Ltd\.?|Private Limited|Technologies|Systems|Solutions|India|Campus Drive|Hiring|Drive|2026|2025)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!simplified) simplified = clean;

  return {
    name: clean,
    canonicalName: simplified,
  };
}
