"use client";

import React from "react";
import { Search, X, Clock, Layers, Building2, Trophy, BookOpen, Bell } from "lucide-react";
import { FilterState, EventType, DriveStatus, Category } from "@/lib/types";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalResults,
}) => {
  const update = (partial: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...partial });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "ALL" ||
    filters.stage !== "ALL" ||
    filters.status !== "ALL" ||
    filters.urgentOnly;

  const resetFilters = () => {
    onFilterChange({
      search: "",
      category: "ALL",
      stage: "ALL",
      urgentOnly: false,
      status: "ALL",
    });
  };

  const categories: { id: "ALL" | Category; label: string; icon: React.ReactNode }[] = [
    { id: "ALL", label: "All Items", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "COMPANY", label: "Companies", icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: "HACKATHON", label: "Hackathons", icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: "WORKSHOP", label: "Workshops", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "NOTICE", label: "Notices", icon: <Bell className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="clean-card p-4 mb-5 space-y-3.5 bg-white">
      {/* Category Pills Row */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Category:</span>
        {categories.map((cat) => {
          const isActive = filters.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => update({ category: cat.id })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, hackathon name, role, or topic..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Urgent Deadlines Toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => update({ urgentOnly: !filters.urgentOnly })}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
              filters.urgentOnly
                ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Due &lt; 24h</span>
          </button>

          {/* Stage Dropdown */}
          <select
            value={filters.stage}
            onChange={(e) => update({ stage: e.target.value as "ALL" | EventType })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-medium"
          >
            <option value="ALL">All Stages</option>
            <option value="APP_REGISTRATION">Registration (App)</option>
            <option value="REGISTRATION_FORM">Registration (Form)</option>
            <option value="HACKATHON_REGISTRATION">Hackathon Register</option>
            <option value="PROBLEM_STATEMENT">Problem Statement</option>
            <option value="SUBMISSION_DEADLINE">Submission Due</option>
            <option value="ASSESSMENT_LINK">Assessment / OT</option>
            <option value="SHORTLIST_RELEASED">Shortlist</option>
            <option value="INTERVIEW_SCHEDULE">Interview</option>
            <option value="OFFER_ANNOUNCEMENT">Offer / Winners</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={filters.status}
            onChange={(e) => update({ status: e.target.value as "ALL" | DriveStatus })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="OFFERED">Offered / Won</option>
            <option value="EXPIRED">Expired / Closed</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold hover:underline transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1">
        <span>Showing {totalResults} result{totalResults === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
};

