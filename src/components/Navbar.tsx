"use client";

import React from "react";
import {
  GraduationCap,
  RefreshCw,
  Sliders,
  Mail,
  CheckCircle2,
  Layers,
  Inbox,
} from "lucide-react";
import { StudentProfile } from "@/lib/types";

interface NavbarProps {
  profile: StudentProfile;
  onOpenProfileModal: () => void;
  onOpenSimulator: () => void;
  onSyncGmail: () => void;
  isSyncing: boolean;
  activeView: "drives" | "actions" | "simulator";
  setActiveView: (view: "drives" | "actions" | "simulator") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onOpenProfileModal,
  onOpenSimulator,
  onSyncGmail,
  isSyncing,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0b0f17]/90 backdrop-blur-md border-b border-gray-800/80 px-4 sm:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm text-white tracking-tight">
                PES Placement Tracker
              </h1>
              <span className="text-[10px] font-medium text-gray-400 bg-gray-800/70 px-1.5 py-0.2 rounded border border-gray-700/50">
                @pes.edu
              </span>
            </div>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center p-0.5 bg-gray-900/90 rounded-lg border border-gray-800 text-xs">
          <button
            onClick={() => setActiveView("drives")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeView === "drives"
                ? "bg-gray-800 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Drives</span>
          </button>
          <button
            onClick={() => setActiveView("actions")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeView === "actions"
                ? "bg-gray-800 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Checklist</span>
          </button>
          <button
            onClick={() => setActiveView("simulator")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeView === "simulator"
                ? "bg-gray-800 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Email Ingestion &amp; Live Sync</span>
          </button>
        </nav>

        {/* Right: Profile & Sync */}
        <div className="flex items-center gap-2">
          {/* Profile Tag */}
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 transition-colors"
            title="Edit Profile & CGPA"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-medium text-white">{profile.cgpa.toFixed(2)} CGPA</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">{profile.branch}</span>
            <Sliders className="w-3 h-3 text-gray-400 ml-0.5" />
          </button>

          {/* Sync Emails */}
          <button
            onClick={onSyncGmail}
            disabled={isSyncing}
            className="p-1.5 px-2.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white transition-colors text-xs font-medium flex items-center gap-1.5"
            title="Check new emails"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
