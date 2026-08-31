"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  ExternalLink,
  Clock,
  Building2,
  Trophy,
  BookOpen,
  Bell,
} from "lucide-react";
import { CompanyDrive, ActionItem, Category } from "@/lib/types";

interface ActionChecklistProps {
  drives: CompanyDrive[];
  onToggleAction: (actionId: string) => void;
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({
  drives,
  onToggleAction,
}) => {
  const [tab, setTab] = useState<"pending" | "completed">("pending");

  const allActions: { action: ActionItem; drive: CompanyDrive }[] = [];
  for (const drive of drives) {
    for (const action of drive.actions) {
      allActions.push({ action, drive });
    }
  }

  const pendingActions = allActions.filter((item) => !item.action.isCompleted);
  const completedActions = allActions.filter((item) => item.action.isCompleted);

  const currentList = tab === "pending" ? pendingActions : completedActions;

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case "HACKATHON":
        return <Trophy className="w-3 h-3 text-purple-600" />;
      case "WORKSHOP":
        return <BookOpen className="w-3 h-3 text-amber-600" />;
      case "NOTICE":
        return <Bell className="w-3 h-3 text-slate-500" />;
      default:
        return <Building2 className="w-3 h-3 text-blue-600" />;
    }
  };

  return (
    <div className="clean-card p-5 space-y-4 mb-6 bg-white border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Action &amp; Registration Tasks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {pendingActions.length} pending task{pendingActions.length === 1 ? "" : "s"} across all opportunities
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setTab("pending")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              tab === "pending"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending ({pendingActions.length})
          </button>
          <button
            onClick={() => setTab("completed")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              tab === "completed"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({completedActions.length})
          </button>
        </div>
      </div>

      {currentList.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs font-medium">
          {tab === "pending"
            ? "🎉 No pending tasks. You are all caught up!"
            : "No completed tasks yet."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentList.map(({ action, drive }) => (
            <div
              key={action.id}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-xs transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => onToggleAction(action.id)}
                  className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                >
                  {action.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="p-1 rounded bg-white border border-slate-200">
                      {getCategoryIcon(drive.category || "COMPANY")}
                    </span>
                    <span className="font-bold text-slate-900 truncate">{drive.name}:</span>
                    <span className={`truncate ${action.isCompleted ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>
                      {action.title}
                    </span>
                  </div>

                  {action.deadline && (
                    <div className="text-[11px] text-amber-800 font-mono font-medium flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded w-fit border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Due: {new Date(action.deadline).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  )}
                </div>
              </div>

              {action.link && (
                <a
                  href={action.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold flex items-center gap-1 flex-shrink-0 shadow-xs transition-colors"
                >
                  <span>Open Form</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

