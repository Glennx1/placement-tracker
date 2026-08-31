"use client";

import React from "react";
import { CompanyDrive } from "@/lib/types";

interface StatsOverviewProps {
  drives: CompanyDrive[];
  userCgpa?: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ drives }) => {
  const totalItems = drives.length;
  const companiesCount = drives.filter((d) => d.category === "COMPANY").length;
  const hackathonsCount = drives.filter((d) => d.category === "HACKATHON").length;
  const workshopsCount = drives.filter((d) => d.category === "WORKSHOP" || d.category === "NOTICE").length;
  
  const pendingActionsCount = drives.reduce(
    (acc, d) => acc + d.actions.filter((a) => !a.isCompleted).length,
    0
  );
  
  const shortlistsAndOffers = drives.filter(
    (d) => d.status === "SHORTLISTED" || d.status === "INTERVIEW_SCHEDULED" || d.status === "OFFERED"
  ).length;

  const items = [
    { label: "Total Opportunities", value: totalItems, highlight: "text-slate-900", badge: "bg-slate-100 text-slate-700" },
    { label: "Company Drives", value: companiesCount, highlight: "text-blue-700", badge: "bg-blue-50 text-blue-700" },
    { label: "Hackathons", value: hackathonsCount, highlight: "text-purple-700", badge: "bg-purple-50 text-purple-700" },
    { label: "Workshops & Notices", value: workshopsCount, highlight: "text-amber-700", badge: "bg-amber-50 text-amber-700" },
    { label: "Pending Tasks", value: pendingActionsCount, highlight: "text-rose-700", badge: "bg-rose-50 text-rose-700" },
    { label: "Shortlists & Offers", value: shortlistsAndOffers, highlight: "text-emerald-700", badge: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="clean-card clean-card-hover p-3.5 bg-white flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 truncate">
              {item.label}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-black tracking-tight font-mono ${item.highlight}`}>
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

