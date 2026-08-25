"use client";

import React from "react";
import {
  X,
  ExternalLink,
  Smartphone,
  Clock,
  Mail,
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-3 bg-gray-950/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">
                {drive.name}
              </h3>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-gray-800 text-gray-300">
                {event.eventType.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate max-w-md mt-0.5">
              {event.subject}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 text-xs">
          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-[11px]">
            <div>
              <span className="text-gray-500 block">Sender:</span>
              <span className="text-gray-300 font-mono">{event.senderEmail}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Received:</span>
              <span className="text-gray-300 font-mono">
                {new Date(event.receivedAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">LLM Confidence:</span>
              <span className="text-emerald-400 font-mono font-medium">
                {(event.llmConfidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* AI Extracted Summary */}
          <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 space-y-1">
            <span className="font-semibold text-blue-300 text-[11px] block">
              Extracted Summary:
            </span>
            <p className="text-gray-300 leading-relaxed">
              {event.summary}
            </p>
          </div>

          {/* Action Links & Deadline */}
          {(event.actionUrl || event.deadline) && (
            <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-lg bg-gray-950 border border-gray-800">
              {event.actionUrl && (
                <a
                  href={event.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 transition-colors text-xs"
                >
                  {event.actionPortal === "PESU_ACADEMY" ? (
                    <Smartphone className="w-3.5 h-3.5" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5" />
                  )}
                  <span>Open Portal</span>
                </a>
              )}

              {event.deadline && (
                <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Deadline: {new Date(event.deadline).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Full Raw Email */}
          <div>
            <span className="text-[11px] font-semibold text-gray-400 block mb-1">
              Raw Email Body:
            </span>
            <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 text-gray-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {event.rawBody}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-gray-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
