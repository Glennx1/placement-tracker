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
  FileSpreadsheet,
  Mail,
  FileText,
  Sparkles,
  Layers,
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
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const now = Date.now();
  const isPastDeadline = drive.latestDeadline && new Date(drive.latestDeadline).getTime() < now;
  const isExpired = drive.status === "EXPIRED" || (drive.status === "ACTIVE" && isPastDeadline);

  const getCategoryBadge = (category: Category) => {
    switch (category) {
      case "HACKATHON":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-purple-600" />
            <span>Hackathon</span>
          </span>
        );
      case "WORKSHOP":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Workshop</span>
          </span>
        );
      case "NOTICE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5 shadow-2xs">
            <Bell className="w-3.5 h-3.5 text-slate-500" />
            <span>Notice</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
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
    <div className={`clean-card clean-card-hover overflow-hidden bg-white border border-slate-200 shadow-sm rounded-2xl ${isExpired ? "opacity-85" : ""}`}>
      {/* Top Header - Company / Entity Row */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Details */}
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {getCategoryBadge(drive.category || "COMPANY")}
              <h3 className="font-extrabold text-lg text-slate-900 tracking-tight truncate">
                {drive.name}
              </h3>
              {getStatusBadge(drive.status)}
              <span className="text-xs text-indigo-700 font-mono font-bold bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                {drive.ctc}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-600 line-clamp-1">
              {drive.role}
            </p>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <span>{drive.criteriaInfo || (drive.minCgpa ? `Cutoff: ${drive.minCgpa.toFixed(2)} CGPA` : "Open to All")}</span>
              </span>

              <span className="text-slate-300">•</span>

              <span className="text-indigo-600 font-bold text-[11px] flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded">
                <Mail className="w-3 h-3" />
                {drive.events.length} Mail{drive.events.length === 1 ? "" : "s"} in Sequence ({drive.events.map((_, i) => `m${i+1}`).join(", ")})
              </span>

              {drive.latestDeadline && (
                <>
                  <span className="text-slate-300">•</span>
                  <span
                    className={`text-[11px] font-mono font-semibold flex items-center gap-1 px-2.5 py-0.5 rounded-md ${
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
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-400 font-semibold cursor-pointer shadow-2xs"
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
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-bold flex items-center gap-1.5"
            >
              <span>{isExpanded ? "Collapse Mails" : `View Mails (${drive.events.length})`}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chronological Mail Tree View - Structured directly like User Sketch (Image 2) */}
      {isExpanded && (
        <div className="bg-slate-50/60 p-4 sm:p-6 space-y-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Email Communication Tree (Chronological m1, m2, m3...)</span>
          </div>

          {/* Connected Vertical Tree Branch */}
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-300">
            {drive.events.map((event, idx) => {
              const mailTag = `m${event.mailIndex || idx + 1}`;
              const hasExcel = Boolean(event.excelAttachment);
              const hasPesuAcad = event.isPesuAcademy || event.actionPortal === "PESU_ACADEMY";

              return (
                <div key={event.id} className="relative group">
                  {/* Tree Node Dot */}
                  <div className="absolute -left-[27px] sm:-left-[31px] top-3.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow-xs flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  </div>

                  {/* Mail Card Body */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3">
                    {/* Mail Header with Node Label */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Node Tag: m1, m2, m3... */}
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white text-[11px] font-mono font-bold shadow-2xs">
                          {mailTag}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[10px] font-bold font-mono uppercase border border-indigo-100">
                          {event.eventType.replace(/_/g, " ")}
                        </span>

                        <h4 className="font-bold text-slate-900 text-sm">
                          {event.subject}
                        </h4>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono font-semibold">
                        {new Date(event.receivedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Email Summary Content Lines */}
                    <p className="text-slate-700 text-xs leading-relaxed font-medium">
                      {event.summary}
                    </p>

                    {/* IMPORTANT INFO: Attached Excel Sheet / Shortlist Box */}
                    {hasExcel && (
                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-emerald-900 font-bold">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Excel Sheet Attached: {event.excelAttachment?.filename}</span>
                          </div>
                          {event.excelAttachment?.candidateCount && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                              {event.excelAttachment.candidateCount} Candidates Shortlisted
                            </span>
                          )}
                        </div>

                        {event.excelAttachment?.previewSnippet && (
                          <div className="p-2 rounded-lg bg-white border border-emerald-100 font-mono text-[11px] text-emerald-800">
                            <strong>Shortlist Preview: </strong> {event.excelAttachment.previewSnippet}
                          </div>
                        )}
                      </div>
                    )}

                    {/* IMPORTANT INFO: PESU Academy Directive Box */}
                    {hasPesuAcad && (
                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-blue-900 font-bold">
                          <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span>
                            {event.pesuAcademyDirective || "📌 Action on PESU Academy: Login and register under Placement > Drives"}
                          </span>
                        </div>
                        <a
                          href="https://pesuacademy.com/Academy/s/placement"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 flex-shrink-0 shadow-2xs transition-colors"
                        >
                          <span>Open PESU Academy</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Action Links & Deadlines Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Action Link (Google Form, External Portal, HackerRank) */}
                        {event.actionUrl && (
                          <a
                            href={event.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3.5 py-1.5 rounded-xl text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                              isPastDeadline ? "bg-slate-500 hover:bg-slate-600" : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                          >
                            <span>
                              {event.formUrl
                                ? "Open Registration Form"
                                : event.actionPortal === "PESU_ACADEMY"
                                ? "PESU Academy Portal"
                                : event.actionPortal === "ASSESSMENT_PLATFORM"
                                ? "Start Online Assessment"
                                : "Open Form / Link"}
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {event.deadline && (
                          <span className={`text-[11px] font-mono font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                            isPastDeadline
                              ? "text-slate-500 bg-slate-100 line-through"
                              : "text-amber-800 bg-amber-50 border border-amber-200"
                          }`}>
                            <Clock className="w-3 h-3 text-amber-600" />
                            {isPastDeadline ? "Deadline was: " : "Deadline: "}
                            {new Date(event.deadline).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onViewEventDetails(event, drive)}
                        className="text-slate-500 hover:text-indigo-600 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Raw Mail</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drive Action Tasks */}
          {drive.actions.length > 0 && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Action Tasks Checklist
              </div>
              <div className="space-y-1.5">
                {drive.actions.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
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
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 flex-shrink-0"
                      >
                        <span>Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


