"use client";

import React, { useState } from "react";
import { CompanyDrive, PlacementEvent, DriveStatus } from "@/lib/types";
import { CompanyCard } from "./CompanyCard";
import { ArrowUpDown, Inbox } from "lucide-react";

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
      <div className="clean-card rounded-xl p-10 text-center text-gray-500 my-6">
        <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-300">No drives match your filters</h3>
        <p className="text-xs text-gray-500 mt-1">
          Adjust the filters above or use the Ingestion tab to test adding a new email.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-8">
      {/* Section Header & Sort */}
      <div className="flex items-center justify-between gap-2 px-1 text-xs">
        <span className="font-semibold text-gray-300">
          Company Drives ({drives.length})
        </span>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="text-[11px] text-gray-500">Sort:</span>
          <button
            onClick={() => setSortBy("urgent")}
            className={`px-2 py-0.5 rounded transition-colors ${
              sortBy === "urgent"
                ? "bg-gray-800 text-white font-medium"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Deadlines
          </button>
          <button
            onClick={() => setSortBy("events")}
            className={`px-2 py-0.5 rounded transition-colors ${
              sortBy === "events"
                ? "bg-gray-800 text-white font-medium"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Timeline Depth
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-2 py-0.5 rounded transition-colors ${
              sortBy === "name"
                ? "bg-gray-800 text-white font-medium"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Name
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5">
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
