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
    category: "ALL",
    stage: "ALL",
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

  // Filtered opportunities calculation
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

      // 2. Category Bucket Filter
      if (filters.category !== "ALL") {
        const itemCategory = drive.category || "COMPANY";
        if (itemCategory !== filters.category) {
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
        setSyncToast("Profile updated.");
        setTimeout(() => setSyncToast(null), 3000);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6">
        {/* Toast Alert */}
        {syncToast && (
          <div className="mb-4 p-3 rounded-xl bg-white border border-emerald-200 text-xs text-slate-800 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{syncToast}</span>
            </div>
            <button
              onClick={() => setSyncToast(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
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
              <div className="py-20 text-center text-slate-400 text-xs font-medium">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                Loading feeds...
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
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 bg-white">
        PES Campus Tracker • Real-time intelligence for @pes.edu communication
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

