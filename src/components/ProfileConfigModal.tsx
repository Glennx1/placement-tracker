"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Award } from "lucide-react";
import { StudentProfile } from "@/lib/types";

interface ProfileConfigModalProps {
  profile: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<StudentProfile>) => void;
}

export const ProfileConfigModal: React.FC<ProfileConfigModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [cgpa, setCgpa] = useState<number>(profile.cgpa);
  const [branch, setBranch] = useState<string>(profile.branch);
  const [usn, setUsn] = useState<string>(profile.usn);
  const [name, setName] = useState<string>(profile.name);
  const [activeBacklogs, setActiveBacklogs] = useState<number>(profile.activeBacklogs);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      cgpa,
      branch,
      usn,
      name,
      activeBacklogs,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-3 bg-gray-950/60">
          <div>
            <h3 className="font-bold text-sm text-white">
              Student Profile &amp; Eligibility
            </h3>
            <p className="text-xs text-gray-400">
              Update your CGPA to recalculate cutoff matches
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* CGPA Slider */}
          <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-200">
                Your CGPA:
              </label>
              <span className="font-mono text-sm font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950 rounded border border-emerald-800">
                {cgpa.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min="5.0"
              max="10.0"
              step="0.01"
              value={cgpa}
              onChange={(e) => setCgpa(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>5.00</span>
              <span className="text-emerald-400 font-semibold">7.62 (Default)</span>
              <span>10.00</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">
                Branch:
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-md text-xs text-gray-200 focus:outline-none focus:border-gray-700"
              >
                <option value="CSE">CSE</option>
                <option value="ISE">ISE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="AIML">AIML</option>
                <option value="MECH">MECH</option>
                <option value="BIOTECH">Biotech</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">
                USN:
              </label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-md text-xs text-gray-200 font-mono focus:outline-none focus:border-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">
                Candidate Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-md text-xs text-gray-200 focus:outline-none focus:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">
                Active Backlogs:
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={activeBacklogs}
                onChange={(e) => setActiveBacklogs(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-md text-xs text-gray-200 font-mono focus:outline-none focus:border-gray-700"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 border-t border-gray-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-750 text-gray-300 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save &amp; Recalculate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
