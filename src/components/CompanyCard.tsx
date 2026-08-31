"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Eye,
  CheckSquare,
  Square,
  Building2,
  Trophy,
  BookOpen,
  Bell,
} from "lucide-react";
import { CompanyDrive, PlacementEvent, DriveStatus, Category } from "@/lib/types";

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

  const now = Date.now();
  const isPastDeadline = drive.latestDeadline && new Date(drive.latestDeadline).getTime() < now;
  const isExpired = drive.status === "EXPIRED" || (drive.status === "ACTIVE" && isPastDeadline);

  const getCategoryBadge = (category: Category) => {
    switch (category) {
      case "HACKATHON":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-purple-600" />
            <span>Hackathon</span>
          </span>
        );
      case "WORKSHOP":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-amber-600" />
            <span>Workshop</span>
          </span>
        );
      case "NOTICE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
            <Bell className="w-3 h-3 text-slate-500" />
            <span>Notice</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-blue-600" />
            <span>Company</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: DriveStatus) => {
    if (isExpired) {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Closed / Expired</span>;
    }

    switch (status) {
      case "OFFERED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Offered / Won 🎉</span>;
      case "SHORTLISTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-300">Shortlisted</span>;
      case "INTERVIEW_SCHEDULED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">Interview</span>;
      case "APPLIED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">Applied</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">Rejected</span>;
      case "EXPIRED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Expired</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>;
    }
  };

  return (
    <div className={`clean-card clean-card-hover overflow-hidden bg-white ${isExpired ? "opacity-75" : ""}`}>
      {/* Main Row */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Details */}
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {getCategoryBadge(drive.category || "COMPANY")}
              <h3 className="font-bold text-base text-slate-900 tracking-tight truncate">
                {drive.name}
              </h3>
              {getStatusBadge(drive.status)}
              <span className="text-xs text-slate-600 font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded">
                {drive.ctc}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-600 line-clamp-1">
              {drive.role}
            </p>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {/* Cutoff / Criteria Badge (Informative, non-blocking) */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <span>{drive.criteriaInfo || (drive.minCgpa ? `Cutoff: ${drive.minCgpa.toFixed(2)} CGPA` : "Open to All")}</span>
              </span>

              <span className="text-slate-300">•</span>

              <span className="text-slate-500 text-[11px] font-medium">
                {drive.events.length} email update{drive.events.length === 1 ? "" : "s"}
              </span>

              {drive.latestDeadline && (
                <>
                  <span className="text-slate-300">•</span>
                  <span
                    className={`text-[11px] font-mono font-semibold flex items-center gap-1 px-2 py-0.5 rounded ${
                      isPastDeadline
                        ? "text-slate-500 bg-slate-100 line-through"
                        : "text-amber-800 bg-amber-50 border border-amber-200"
                    }`}
                  >
                    <Clock className="w-3 h-3 text-amber-600" />
                    {isPastDeadline ? "Closed " : "Due "}
                    {new Date(drive.latestDeadline).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
            <select
              value={drive.status}
              onChange={(e) => onUpdateStatus(drive.id, e.target.value as DriveStatus)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-400 font-medium cursor-pointer"
            >
              <option value="ACTIVE">Active</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW_SCHEDULED">Interview</option>
              <option value="OFFERED">Offered / Won 🎉</option>
              <option value="EXPIRED">Expired / Closed</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-semibold flex items-center gap-1"
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
        <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5 space-y-4 text-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Email &amp; Event Stream ({drive.events.length})
          </div>

          <div className="space-y-3 pl-2 border-l-2 border-slate-200">
            {drive.events.map((event) => (
              <div key={event.id} className="relative pl-4 group">
                {/* Timeline Bullet */}
                <div className="absolute -left-[9px] top-2 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold font-mono uppercase border border-indigo-100">
                        {event.eventType.replace(/_/g, " ")}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {event.subject}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono font-medium">
                      {new Date(event.receivedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    {event.summary}
                  </p>

                  {/* Shortlist / Result Snippet if present */}
                  {event.shortlistSnippet && (
                    <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-[11px] text-purple-900 font-mono">
                      <strong>Results / Shortlist: </strong> {event.shortlistSnippet}
                    </div>
                  )}

                  {/* Action Link & Inspector */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {event.actionUrl && (
                        <a
                          href={event.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1 rounded-lg text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors ${
                            isPastDeadline ? "bg-slate-500 hover:bg-slate-600 text-white" : "bg-indigo-600 hover:bg-indigo-700"
                          }`}
                        >
                          <span>
                            {event.actionPortal === "PESU_ACADEMY"
                              ? "PESU Academy Portal"
                              : "Open Link / Form"}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {event.deadline && (
                        <span className={`text-[11px] font-mono font-medium ${isPastDeadline ? "text-slate-500" : "text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"}`}>
                          {isPastDeadline ? "Deadline was: " : "Deadline: "}
                          {new Date(event.deadline).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onViewEventDetails(event, drive)}
                      className="text-slate-500 hover:text-indigo-600 text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Raw Email</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Tasks Checklist */}
          {drive.actions.length > 0 && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Action Tasks
              </div>
              {drive.actions.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs shadow-xs"
                >
                  <button
                    onClick={() => onToggleAction(act.id)}
                    className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                  >
                    {act.isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={act.isCompleted ? "line-through text-slate-400 font-normal" : "text-slate-800 font-semibold"}>
                      {act.title}
                    </span>
                  </button>
                  {act.link && (
                    <a
                      href={act.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 flex-shrink-0"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
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

