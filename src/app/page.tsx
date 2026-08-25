"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { StatsOverview } from "@/components/StatsOverview";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { FilterBar } from "@/components/FilterBar";
import { CompanyTree } from "@/components/CompanyTree";
import { ActionChecklist } from "@/components/ActionChecklist";
import { IngestionSimulator } from "@/components/IngestionSimulator";
import { EmailDetailModal } from "@/components/EmailDetailModal";
import { ProfileConfigModal } from "@/components/ProfileConfigModal";
import {
  CompanyDrive,
  PlacementEvent,
  StudentProfile,
  FilterState,
  DriveStatus,
  IngestionLogEntry,
} from "@/lib/types";
import { DEFAULT_STUDENT_PROFILE } from "@/lib/store";
import { RefreshCw, CheckCircle } from "lucide-react";

export default function PlacementTrackerDashboard() {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE);
  const [drives, setDrives] = useState<CompanyDrive[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Active view: 'drives' | 'actions' | 'simulator'
  const [activeView, setActiveView] = useState<"drives" | "actions" | "simulator">("drives");

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [selectedEventModal, setSelectedEventModal] = useState<{
    event: PlacementEvent;
    drive: CompanyDrive;
  } | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    eligibility: "ALL",
    stage: "ALL",
    tier: "ALL",
    urgentOnly: false,
    status: "ALL",
  });

  // Fetch initial data
  const fetchData = async () => {
    try {
      const res = await fetch("/api/companies");
      const json = await res.json();
      if (json.success) {
        setDrives(json.data.drives);
        setProfile(json.data.profile);
      }
    } catch (err) {
      console.error("Failed to load drives:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered drives calculation
  const filteredDrives = useMemo(() => {
    return drives.filter((drive) => {
      // 1. Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = drive.name.toLowerCase().includes(query);
        const matchesRole = drive.role.toLowerCase().includes(query);
        const matchesCanonical = drive.canonicalName.toLowerCase().includes(query);
        const matchesEvents = drive.events.some((e) =>
          e.subject.toLowerCase().includes(query) || e.summary.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesRole && !matchesCanonical && !matchesEvents) {
          return false;
        }
      }

      // 2. Eligibility
      if (filters.eligibility !== "ALL") {
        if (drive.eligibility?.status !== filters.eligibility) {
          return false;
        }
      }

      // 3. Stage
      if (filters.stage !== "ALL") {
        if (drive.currentStage !== filters.stage) {
          return false;
        }
      }

      // 4. Status
      if (filters.status !== "ALL") {
        if (drive.status !== filters.status) {
          return false;
        }
      }

      // 5. Urgent Only
      if (filters.urgentOnly) {
        const hasUrgentAction = drive.actions.some(
          (a) =>
            !a.isCompleted &&
            a.deadline &&
            new Date(a.deadline).getTime() - Date.now() <= 24 * 3600 * 1000
        );
        if (!hasUrgentAction) return false;
      }

      return true;
    });
  }, [drives, filters]);

  // Action toggle
  const handleToggleAction = async (actionId: string) => {
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId }),
      });
      const json = await res.json();
      if (json.success && json.allDrives) {
        setDrives(json.allDrives);
      }
    } catch (err) {
      console.error("Failed to toggle action:", err);
    }
  };

  // Status update
  const handleUpdateStatus = async (driveId: string, status: DriveStatus) => {
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", driveId, status }),
      });
      const json = await res.json();
      if (json.success) {
        setDrives((prev) =>
          prev.map((d) => (d.id === driveId ? { ...d, status } : d))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Ingest success from simulator
  const handleIngestSuccess = (data: {
    drive: CompanyDrive;
    event: PlacementEvent;
    log: IngestionLogEntry;
  }) => {
    fetchData();
    setSyncToast(`Added event to ${data.drive.name} timeline.`);
    setTimeout(() => setSyncToast(null), 3000);
  };

  // Gmail sync trigger
  const handleSyncGmail = async () => {
    setIsSyncing(true);
    setSyncToast(null);
    try {
      const res = await fetch("/api/sync-gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "full_sync" }),
      });
      const json = await res.json();
      if (json.success) {
        setDrives(json.data.drives);
        setSyncToast(`Synced ${json.data.syncedCount} placement emails.`);
      }
    } catch (err) {
      setSyncToast("Sync failed");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  // Profile save
  const handleSaveProfile = async (updated: Partial<StudentProfile>) => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data.profile);
        setDrives(json.data.allDrives);
        setSyncToast("Profile and cutoffs updated.");
        setTimeout(() => setSyncToast(null), 3000);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-gray-200">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenSimulator={() => setActiveView("simulator")}
        onSyncGmail={handleSyncGmail}
        isSyncing={isSyncing}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-5">
        {/* Toast Alert */}
        {syncToast && (
          <div className="mb-4 p-2.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{syncToast}</span>
            </div>
            <button
              onClick={() => setSyncToast(null)}
              className="text-gray-500 hover:text-gray-300 text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Urgency Alert (< 24h) */}
        <UrgencyBanner drives={drives} onToggleAction={handleToggleAction} />

        {/* Stats Row */}
        <StatsOverview drives={drives} userCgpa={profile.cgpa} />

        {/* Views */}
        {activeView === "drives" && (
          <div>
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              totalResults={filteredDrives.length}
            />

            {isLoading ? (
              <div className="py-16 text-center text-gray-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-400" />
                Loading placement drives...
              </div>
            ) : (
              <CompanyTree
                drives={filteredDrives}
                onToggleAction={handleToggleAction}
                onUpdateStatus={handleUpdateStatus}
                onViewEventDetails={(event, drive) =>
                  setSelectedEventModal({ event, drive })
                }
              />
            )}
          </div>
        )}

        {activeView === "actions" && (
          <div>
            <ActionChecklist
              drives={drives}
              onToggleAction={handleToggleAction}
            />
          </div>
        )}

        {activeView === "simulator" && (
          <div>
            <IngestionSimulator onIngestSuccess={handleIngestSuccess} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-3 text-center text-[11px] text-gray-600">
        PES University Placement Tracker • @pes.edu Email Intelligence
      </footer>

      {/* Modals */}
      <EmailDetailModal
        event={selectedEventModal?.event || null}
        drive={selectedEventModal?.drive || null}
        onClose={() => setSelectedEventModal(null)}
      />

      <ProfileConfigModal
        profile={profile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
