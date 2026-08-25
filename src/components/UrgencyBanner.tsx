"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Clock, ExternalLink, CheckCircle } from "lucide-react";
import { CompanyDrive, ActionItem } from "@/lib/types";

interface UrgencyBannerProps {
  drives: CompanyDrive[];
  onToggleAction: (actionId: string) => void;
}

export const UrgencyBanner: React.FC<UrgencyBannerProps> = ({
  drives,
  onToggleAction,
}) => {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const urgentActions: { action: ActionItem; drive: CompanyDrive }[] = [];

  for (const drive of drives) {
    for (const action of drive.actions) {
      if (!action.isCompleted && action.deadline) {
        const diffMs = new Date(action.deadline).getTime() - now;
        if (diffMs > -2 * 3600 * 1000 && diffMs <= 24 * 3600 * 1000) {
          urgentActions.push({ action, drive });
        }
      }
    }
  }

  if (urgentActions.length === 0) return null;

  function formatTimeRemaining(deadlineStr: string) {
    const diffMs = new Date(deadlineStr).getTime() - now;
    if (diffMs < 0) return "Overdue";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${mins}m left`;
    return `${hours}h ${mins}m left`;
  }

  return (
    <div className="mb-5 rounded-lg border border-amber-900/50 bg-amber-950/20 p-3 text-xs">
      <div className="flex items-center gap-2 mb-2 text-amber-300 font-medium">
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <span>Action required within 24 hours ({urgentActions.length} pending)</span>
      </div>

      <div className="space-y-1.5">
        {urgentActions.map(({ action, drive }) => (
          <div
            key={action.id}
            className="flex items-center justify-between gap-3 p-2 rounded bg-gray-900/80 border border-gray-800 text-gray-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-white truncate">{drive.name}:</span>
              <span className="text-gray-300 truncate">{action.title}</span>
              {action.deadline && (
                <span className="text-[11px] text-amber-400 font-mono flex-shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeRemaining(action.deadline)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {action.link && (
                <a
                  href={action.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-blue-600/90 hover:bg-blue-500 text-white text-[11px] font-medium flex items-center gap-1"
                >
                  <span>Open Form</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              <button
                onClick={() => onToggleAction(action.id)}
                className="p-1 px-1.5 rounded bg-gray-800 hover:bg-emerald-700/80 text-gray-300 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                title="Mark completed"
              >
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>Mark Done</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
