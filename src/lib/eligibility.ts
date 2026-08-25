import { EligibilityStatus, StudentProfile } from "./types";

export interface EligibilityResult {
  status: EligibilityStatus;
  isEligible: boolean;
  reason: string;
  diff: number; // user CGPA - cutoff
  branchMatch: boolean;
  backlogMatch: boolean;
}

export function evaluateEligibility(
  company: {
    minCgpa?: number | null;
    allowedBranches?: string[];
    maxBacklogs?: number;
  },
  student: StudentProfile
): EligibilityResult {
  const branch = student.branch.toUpperCase();
  const allowed = (company.allowedBranches || []).map((b) => b.toUpperCase());
  const branchMatch =
    allowed.length === 0 ||
    allowed.includes("ALL") ||
    allowed.includes("CIRCUITAL") && ["CSE", "ISE", "ECE", "EEE"].includes(branch) ||
    allowed.includes(branch);

  const backlogMatch = student.activeBacklogs <= (company.maxBacklogs ?? 0);

  if (!company.minCgpa) {
    if (!branchMatch) {
      return {
        status: "INELIGIBLE",
        isEligible: false,
        reason: `Branch mismatch (${student.branch} not in [${allowed.join(", ")}])`,
        diff: 0,
        branchMatch: false,
        backlogMatch,
      };
    }
    return {
      status: "NOT_SPECIFIED",
      isEligible: true,
      reason: "No CGPA cutoff specified (Branch & Backlog rules pass)",
      diff: 0,
      branchMatch: true,
      backlogMatch,
    };
  }

  const diff = Math.round((student.cgpa - company.minCgpa) * 100) / 100;

  if (!branchMatch) {
    return {
      status: "INELIGIBLE",
      isEligible: false,
      reason: `Branch ${student.branch} is not eligible for this drive. Allowed: [${allowed.join(", ")}]`,
      diff,
      branchMatch: false,
      backlogMatch,
    };
  }

  if (!backlogMatch) {
    return {
      status: "INELIGIBLE",
      isEligible: false,
      reason: `Drive requires maximum ${company.maxBacklogs} backlogs (You have ${student.activeBacklogs})`,
      diff,
      branchMatch: true,
      backlogMatch: false,
    };
  }

  if (student.cgpa >= company.minCgpa) {
    return {
      status: "ELIGIBLE",
      isEligible: true,
      reason: `Your CGPA (${student.cgpa.toFixed(2)}) meets the minimum cutoff of ${company.minCgpa.toFixed(2)} (+${diff >= 0 ? diff.toFixed(2) : ""})`,
      diff,
      branchMatch: true,
      backlogMatch: true,
    };
  } else if (company.minCgpa - student.cgpa <= 0.15) {
    return {
      status: "BORDERLINE",
      isEligible: false,
      reason: `Borderline: Your CGPA (${student.cgpa.toFixed(2)}) is slightly below the cutoff (${company.minCgpa.toFixed(2)}) by ${Math.abs(diff).toFixed(2)} pts`,
      diff,
      branchMatch: true,
      backlogMatch: true,
    };
  } else {
    return {
      status: "INELIGIBLE",
      isEligible: false,
      reason: `Ineligible: Your CGPA (${student.cgpa.toFixed(2)}) is below the required cutoff of ${company.minCgpa.toFixed(2)} (${diff.toFixed(2)} pts)`,
      diff,
      branchMatch: true,
      backlogMatch: true,
    };
  }
}
