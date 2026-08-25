"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  ExternalLink,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { CompanyDrive, ActionItem } from "@/lib/types";

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

  return (
    <div className="clean-card p-4 space-y-4 mb-6">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div>
          <h2 className="text-sm font-bold text-white">
            Action &amp; Registration Tasks
          </h2>
          <p className="text-xs text-gray-400">
            {pendingActions.length} pending task{pendingActions.length === 1 ? "" : "s"} across all company drives
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-0.5 bg-gray-900 rounded-md border border-gray-800 text-xs">
          <button
            onClick={() => setTab("pending")}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              tab === "pending"
                ? "bg-gray-800 text-white font-semibold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Pending ({pendingActions.length})
          </button>
          <button
            onClick={() => setTab("completed")}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              tab === "completed"
                ? "bg-gray-800 text-white font-semibold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Completed ({completedActions.length})
          </button>
        </div>
      </div>

      {currentList.length === 0 ? (
        <div className="py-8 text-center text-gray-500 text-xs">
          {tab === "pending"
            ? "No pending tasks. You are all caught up!"
            : "No completed tasks yet."}
        </div>
      ) : (
        <div className="space-y-2">
          {currentList.map(({ action, drive }) => (
            <div
              key={action.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-900/70 border border-gray-800 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  onClick={() => onToggleAction(action.id)}
                  className="text-gray-400 hover:text-white flex-shrink-0"
                >
                  {action.isCompleted ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white truncate">{drive.name}:</span>
                    <span className={`truncate ${action.isCompleted ? "line-through text-gray-500" : "text-gray-200"}`}>
                      {action.title}
                    </span>
                  </div>

                  {action.deadline && (
                    <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
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
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium flex items-center gap-1 flex-shrink-0"
                >
                  <span>Open Form</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
