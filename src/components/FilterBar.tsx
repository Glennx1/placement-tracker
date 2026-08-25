"use client";

import React from "react";
import { Search, X, CheckCircle2, Clock } from "lucide-react";
import { FilterState, EventType, DriveStatus } from "@/lib/types";

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
    filters.eligibility !== "ALL" ||
    filters.stage !== "ALL" ||
    filters.status !== "ALL" ||
    filters.urgentOnly;

  const resetFilters = () => {
    onFilterChange({
      search: "",
      eligibility: "ALL",
      stage: "ALL",
      tier: "ALL",
      urgentOnly: false,
      status: "ALL",
    });
  };

  return (
    <div className="clean-card p-3 mb-5 space-y-2.5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, role, or test topic..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="w-full pl-8 pr-8 py-1.5 bg-gray-900 border border-gray-800 rounded-md text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-700"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Eligibility Toggle */}
          <button
            onClick={() =>
              update({
                eligibility: filters.eligibility === "ELIGIBLE" ? "ALL" : "ELIGIBLE",
              })
            }
            className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1 ${
              filters.eligibility === "ELIGIBLE"
                ? "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Eligible Only</span>
          </button>

          {/* Urgent Deadlines Toggle */}
          <button
            onClick={() => update({ urgentOnly: !filters.urgentOnly })}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1 ${
              filters.urgentOnly
                ? "bg-amber-950/60 border-amber-700 text-amber-300"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Due &lt; 24h</span>
          </button>

          {/* Stage Dropdown */}
          <select
            value={filters.stage}
            onChange={(e) => update({ stage: e.target.value as "ALL" | EventType })}
            className="px-2 py-1.5 bg-gray-900 border border-gray-800 rounded-md text-xs text-gray-300 focus:outline-none focus:border-gray-700"
          >
            <option value="ALL">All Stages</option>
            <option value="APP_REGISTRATION">Registration (App)</option>
            <option value="REGISTRATION_FORM">Registration (Form)</option>
            <option value="ASSESSMENT_LINK">Assessment / OT</option>
            <option value="SHORTLIST_RELEASED">Shortlist</option>
            <option value="INTERVIEW_SCHEDULE">Interview</option>
            <option value="OFFER_ANNOUNCEMENT">Offer</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={filters.status}
            onChange={(e) => update({ status: e.target.value as "ALL" | DriveStatus })}
            className="px-2 py-1.5 bg-gray-900 border border-gray-800 rounded-md text-xs text-gray-300 focus:outline-none focus:border-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="OFFERED">Offered</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
        <span>Showing {totalResults} drive{totalResults === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
};
