"use client";

import React, { useState } from "react";
import { CompanyDrive, PlacementEvent, DriveStatus } from "@/lib/types";
import { CompanyCard } from "./CompanyCard";
import { Inbox, ArrowUpDown } from "lucide-react";

interface CompanyTreeProps {
  drives: CompanyDrive[];
  onToggleAction: (actionId: string) => void;
  onUpdateStatus: (driveId: string, status: DriveStatus) => void;
  onViewEventDetails: (event: PlacementEvent, drive: CompanyDrive) => void;
}

export const CompanyTree: React.FC<CompanyTreeProps> = ({
  drives,
  onToggleAction,
  onUpdateStatus,
  onViewEventDetails,
}) => {
  const [sortBy, setSortBy] = useState<"urgent" | "events" | "name">("urgent");

  const sortedDrives = [...drives].sort((a, b) => {
    if (sortBy === "urgent") {
      const aTime = a.latestDeadline ? new Date(a.latestDeadline).getTime() : Infinity;
      const bTime = b.latestDeadline ? new Date(b.latestDeadline).getTime() : Infinity;
      return aTime - bTime;
    }
    if (sortBy === "events") {
      return b.events.length - a.events.length;
    }
    return a.name.localeCompare(b.name);
  });

  if (drives.length === 0) {
    return (
      <div className="clean-card rounded-2xl p-12 text-center text-slate-500 my-6 bg-white border border-slate-200 shadow-sm">
        <Inbox className="w-10 h-10 mx-auto mb-3 text-slate-400" />
        <h3 className="text-base font-bold text-slate-800">No items match your filter</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Try resetting the category filter or use the Gmail Sync tab to ingest your latest emails.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-8">
      {/* Section Header & Sort */}
      <div className="flex items-center justify-between gap-2 px-1 text-xs">
        <span className="font-bold text-slate-700">
          Tracked Items ({drives.length})
        </span>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Sort by:
          </span>
          <button
            onClick={() => setSortBy("urgent")}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              sortBy === "urgent"
                ? "bg-slate-200 text-slate-900 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Deadlines
          </button>
          <button
            onClick={() => setSortBy("events")}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              sortBy === "events"
                ? "bg-slate-200 text-slate-900 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Updates
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              sortBy === "name"
                ? "bg-slate-200 text-slate-900 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Name
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {sortedDrives.map((drive, idx) => (
          <CompanyCard
            key={drive.id}
            drive={drive}
            onToggleAction={onToggleAction}
            onUpdateStatus={onUpdateStatus}
            onViewEventDetails={onViewEventDetails}
            defaultExpanded={idx === 0}
          />
        ))}
      </div>
    </div>
  );
};

