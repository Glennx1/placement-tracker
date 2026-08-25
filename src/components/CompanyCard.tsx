"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  Award,
  Eye,
  CheckSquare,
  Square,
} from "lucide-react";
import { CompanyDrive, PlacementEvent, DriveStatus } from "@/lib/types";

interface CompanyCardProps {
  drive: CompanyDrive;
  onToggleAction: (actionId: string) => void;
  onUpdateStatus: (driveId: string, status: DriveStatus) => void;
  onViewEventDetails: (event: PlacementEvent, drive: CompanyDrive) => void;
  defaultExpanded?: boolean;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  drive,
  onToggleAction,
  onUpdateStatus,
  onViewEventDetails,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const eligibility = drive.eligibility;
  const isEligible = eligibility?.status === "ELIGIBLE" || eligibility?.status === "NOT_SPECIFIED";
  const now = Date.now();
  const isPastDeadline = drive.latestDeadline && new Date(drive.latestDeadline).getTime() < now;
  const isExpired = drive.status === "EXPIRED" || (drive.status === "ACTIVE" && isPastDeadline);

  const getStatusBadge = (status: DriveStatus) => {
    if (isExpired) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-800 text-gray-400 border border-gray-700">Expired / Closed</span>;
    }

    switch (status) {
      case "OFFERED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">Offered 🎉</span>;
      case "SHORTLISTED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-950 text-purple-300 border border-purple-800">Shortlisted</span>;
      case "INTERVIEW_SCHEDULED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">Interview</span>;
      case "APPLIED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950 text-blue-300 border border-blue-800">Applied</span>;
      case "REJECTED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-950 text-red-300 border border-red-800">Rejected</span>;
      case "EXPIRED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-800 text-gray-400 border border-gray-700">Expired</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-800 text-gray-300 border border-gray-700">Active</span>;
    }
  };

  return (
    <div className={`clean-card clean-card-hover overflow-hidden ${isExpired ? "opacity-80" : ""}`}>
      {/* Main Company Row */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Company Details */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-tight">
                {drive.name}
              </h3>
              {getStatusBadge(drive.status)}
              <span className="text-[11px] text-gray-400 font-mono">
                {drive.ctc}
              </span>
            </div>

            <p className="text-xs text-gray-300">
              {drive.role}
            </p>

            {/* Meta Row: Eligibility & Cutoff */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                  isEligible
                    ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                    : "bg-red-950/40 border-red-800/60 text-red-300"
                }`}
              >
                {isEligible ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-red-400" />
                )}
                <span>
                  {drive.minCgpa ? `Cutoff: ${drive.minCgpa.toFixed(2)}` : "No Cutoff"}
                </span>
              </span>

              <span className="text-gray-500 text-[11px]">•</span>

              <span className="text-gray-400 text-[11px]">
                {drive.events.length} email update{drive.events.length === 1 ? "" : "s"}
              </span>

              {drive.latestDeadline && (
                <>
                  <span className="text-gray-500 text-[11px]">•</span>
                  <span
                    className={`text-[11px] font-mono flex items-center gap-1 ${
                      isPastDeadline ? "text-gray-500 line-through" : "text-amber-400/90"
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    {isPastDeadline ? "Closed " : "Due "}
                    {new Date(drive.latestDeadline).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <select
              value={drive.status}
              onChange={(e) => onUpdateStatus(drive.id, e.target.value as DriveStatus)}
              className="px-2 py-1 bg-gray-900 border border-gray-800 rounded-md text-xs text-gray-300 focus:outline-none focus:border-gray-700"
            >
              <option value="ACTIVE">Active</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW_SCHEDULED">Interview</option>
              <option value="OFFERED">Offered 🎉</option>
              <option value="EXPIRED">Expired / Closed</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 px-2.5 rounded-md bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-white transition-colors text-xs font-medium flex items-center gap-1"
            >
              <span>{isExpanded ? "Hide" : "Timeline"}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Timeline View */}
      {isExpanded && (
        <div className="border-t border-gray-800/80 bg-gray-950/40 p-4 space-y-4 text-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Email Lifecycle Timeline ({drive.events.length})
          </div>

          <div className="space-y-3 pl-2 border-l border-gray-800">
            {drive.events.map((event) => (
              <div key={event.id} className="relative pl-4 group">
                {/* Bullet */}
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-gray-950" />

                <div className="p-3 rounded-lg bg-gray-900/90 border border-gray-800/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 text-[10px] font-mono uppercase">
                        {event.eventType.replace(/_/g, " ")}
                      </span>
                      <span className="font-semibold text-white text-xs">
                        {event.subject}
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(event.receivedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <p className="text-gray-300 text-xs leading-relaxed">
                    {event.summary}
                  </p>

                  {/* Shortlist Snippet if present */}
                  {event.shortlistSnippet && (
                    <div className="p-2 rounded bg-purple-950/30 border border-purple-900/40 text-[11px] text-purple-300 font-mono">
                      <strong>Shortlisted: </strong> {event.shortlistSnippet}
                    </div>
                  )}

                  {/* Action Link & Inspector */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-800/60">
                    <div className="flex items-center gap-2">
                      {event.actionUrl && (
                        <a
                          href={event.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-2.5 py-1 rounded text-white text-[11px] font-medium flex items-center gap-1 ${
                            isPastDeadline ? "bg-gray-800 hover:bg-gray-700 text-gray-400" : "bg-blue-600 hover:bg-blue-500"
                          }`}
                        >
                          <span>
                            {event.actionPortal === "PESU_ACADEMY"
                              ? "PESU Academy"
                              : "Open Form / Link"}
                          </span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {event.deadline && (
                        <span className={`text-[11px] font-mono ${isPastDeadline ? "text-gray-500" : "text-amber-400"}`}>
                          {isPastDeadline ? "Deadline was: " : "Deadline: "}
                          {new Date(event.deadline).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onViewEventDetails(event, drive)}
                      className="text-gray-400 hover:text-gray-200 text-[11px] flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Email</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Tasks */}
          {drive.actions.length > 0 && (
            <div className="pt-2 border-t border-gray-800/60 space-y-1.5">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Drive Tasks
              </div>
              {drive.actions.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between gap-2 p-2 rounded bg-gray-900/60 border border-gray-800 text-xs"
                >
                  <button
                    onClick={() => onToggleAction(act.id)}
                    className="flex items-center gap-2 text-left min-w-0 flex-1"
                  >
                    {act.isCompleted ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    )}
                    <span className={act.isCompleted ? "line-through text-gray-500" : "text-gray-200"}>
                      {act.title}
                    </span>
                  </button>
                  {act.link && (
                    <a
                      href={act.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5 flex-shrink-0"
                    >
                      <span>Link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
