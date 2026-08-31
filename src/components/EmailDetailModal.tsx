"use client";

import React from "react";
import {
  X,
  ExternalLink,
  Smartphone,
  Clock,
  Mail,
  Sparkles,
  Building2,
} from "lucide-react";
import { PlacementEvent, CompanyDrive } from "@/lib/types";

interface EmailDetailModalProps {
  event: PlacementEvent | null;
  drive: CompanyDrive | null;
  onClose: () => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({
  event,
  drive,
  onClose,
}) => {
  if (!event || !drive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">
                {drive.name}
              </h3>
              <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {event.eventType.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-slate-600 truncate max-w-md mt-0.5 font-medium">
              {event.subject}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-500 font-medium block">Sender:</span>
              <span className="text-slate-800 font-mono font-semibold">{event.senderEmail}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Received Date:</span>
              <span className="text-slate-800 font-mono font-semibold">
                {new Date(event.receivedAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">AI Classifier Match:</span>
              <span className="text-emerald-700 font-mono font-bold">
                {(event.llmConfidence * 100).toFixed(0)}% Confidence
              </span>
            </div>
          </div>

          {/* AI Extracted Summary */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
            <span className="font-bold text-indigo-900 text-[11px] block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI Extracted Summary:
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {event.summary}
            </p>
          </div>

          {/* Attached Excel Sheet if present */}
          {event.excelAttachment && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-2">
                  📊 Attached Excel Sheet: {event.excelAttachment.filename}
                </span>
                {event.excelAttachment.candidateCount && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                    {event.excelAttachment.candidateCount} Candidates
                  </span>
                )}
              </div>
              {event.excelAttachment.previewSnippet && (
                <div className="p-2 rounded-lg bg-white border border-emerald-100 font-mono text-[11px] text-emerald-800">
                  <strong>Shortlist Preview: </strong> {event.excelAttachment.previewSnippet}
                </div>
              )}
            </div>
          )}

          {/* PESU Academy Directive if present */}
          {(event.isPesuAcademy || event.actionPortal === "PESU_ACADEMY") && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{event.pesuAcademyDirective || "Action Required on PESU Academy Placement Portal"}</span>
              </div>
              <a
                href="https://pesuacademy.com/Academy/s/placement"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
              >
                <span>Open PESU Academy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Action Links & Deadline */}
          {(event.actionUrl || event.deadline) && (
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              {event.actionUrl && (
                <a
                  href={event.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 transition-colors text-xs shadow-xs"
                >
                  {event.actionPortal === "PESU_ACADEMY" ? (
                    <Smartphone className="w-3.5 h-3.5" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5" />
                  )}
                  <span>{event.formUrl ? "Open Registration Form" : "Open Link / Form"}</span>
                </a>
              )}

              {event.deadline && (
                <div className="flex items-center gap-1 text-amber-800 font-mono font-semibold text-[11px] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Deadline: {new Date(event.deadline).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Full Raw Email */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Full Raw Email Content:
            </span>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-slate-800">
              {event.rawBody}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

