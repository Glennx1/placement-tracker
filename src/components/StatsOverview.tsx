"use client";

import React from "react";
import { CompanyDrive } from "@/lib/types";

interface StatsOverviewProps {
  drives: CompanyDrive[];
  userCgpa: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  drives,
  userCgpa,
}) => {
  const totalDrives = drives.length;
  const eligibleDrives = drives.filter(
    (d) => d.eligibility?.status === "ELIGIBLE" || d.eligibility?.status === "NOT_SPECIFIED"
  ).length;
  const ineligibleDrives = drives.filter(
    (d) => d.eligibility?.status === "INELIGIBLE" || d.eligibility?.status === "BORDERLINE"
  ).length;
  const appliedCount = drives.filter((d) =>
    ["APPLIED", "ASSESSMENT_COMPLETED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "OFFERED"].includes(d.status)
  ).length;
  const shortlistedCount = drives.filter(
    (d) => d.status === "SHORTLISTED" || d.status === "INTERVIEW_SCHEDULED"
  ).length;
  const offeredCount = drives.filter((d) => d.status === "OFFERED").length;

  const items = [
    { label: "Total Drives", value: totalDrives, highlight: "text-white" },
    { label: `Eligible (≤ ${userCgpa.toFixed(2)})`, value: eligibleDrives, highlight: "text-emerald-400" },
    { label: `Ineligible (> ${userCgpa.toFixed(2)})`, value: ineligibleDrives, highlight: "text-gray-400" },
    { label: "Applied / Active", value: appliedCount, highlight: "text-blue-400" },
    { label: "Shortlisted", value: shortlistedCount, highlight: "text-purple-400" },
    { label: "Offers Won", value: offeredCount, highlight: "text-yellow-400" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="clean-card p-3 text-center"
        >
          <div className={`text-xl font-bold font-mono ${item.highlight}`}>
            {item.value}
          </div>
          <div className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};
