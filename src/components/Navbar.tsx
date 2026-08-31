"use client";

import React from "react";
import {
  GraduationCap,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Layers,
  Inbox,
  Sparkles,
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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-slate-900 tracking-tight">
                PES Campus Tracker
              </h1>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                @pes.edu Intelligence
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Companies • Hackathons • Workshops • Notices
            </p>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveView("drives")}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeView === "drives"
                ? "bg-white text-indigo-700 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Opportunities</span>
          </button>
          <button
            onClick={() => setActiveView("actions")}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeView === "actions"
                ? "bg-white text-indigo-700 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tasks</span>
          </button>
          <button
            onClick={() => setActiveView("simulator")}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeView === "simulator"
                ? "bg-white text-indigo-700 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Gmail Sync &amp; Simulator</span>
          </button>
        </nav>

        {/* Right: Profile & Sync */}
        <div className="flex items-center gap-2">
          {/* Profile Tag */}
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm text-xs text-slate-700 transition-all"
            title="Edit Profile"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">{profile.branch}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-mono">{profile.cgpa.toFixed(2)}</span>
            <Sliders className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {/* Sync Emails */}
          <button
            onClick={onSyncGmail}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all text-xs font-semibold flex items-center gap-1.5 disabled:opacity-75"
            title="Sync latest emails from PESU_TAGGED"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync Mails"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

