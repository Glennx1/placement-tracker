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
    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>Action Required within 24 Hours ({urgentActions.length} pending task{urgentActions.length === 1 ? "" : "s"})</span>
      </div>

      <div className="space-y-2">
        {urgentActions.map(({ action, drive }) => (
          <div
            key={action.id}
            className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border border-amber-200/80 shadow-xs text-slate-800"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-slate-900 truncate">{drive.name}:</span>
              <span className="text-slate-600 truncate">{action.title}</span>
              {action.deadline && (
                <span className="text-[11px] text-amber-700 font-semibold font-mono flex-shrink-0 flex items-center gap-1 bg-amber-100/70 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {formatTimeRemaining(action.deadline)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {action.link && (
                <a
                  href={action.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <span>Open Form</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={() => onToggleAction(action.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors text-[11px] font-medium flex items-center gap-1 border border-slate-200"
                title="Mark completed"
              >
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Mark Done</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

