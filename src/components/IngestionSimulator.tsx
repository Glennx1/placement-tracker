"use client";

import React, { useState } from "react";
import {
  Inbox,
  Send,
  RefreshCw,
  Mail,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Terminal,
  Sparkles,
} from "lucide-react";
import { SAMPLE_PES_EMAILS, SampleEmailFixture } from "@/lib/sampleEmails";
import { CompanyDrive, PlacementEvent, IngestionLogEntry } from "@/lib/types";

interface IngestionSimulatorProps {
  onIngestSuccess: (data: {
    drive: CompanyDrive;
    event: PlacementEvent;
    log: IngestionLogEntry;
  }) => void;
}

export const IngestionSimulator: React.FC<IngestionSimulatorProps> = ({
  onIngestSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"how-it-works" | "test">("how-it-works");
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(SAMPLE_PES_EMAILS[0].id);
  const [subject, setSubject] = useState<string>(SAMPLE_PES_EMAILS[0].subject);
  const [sender, setSender] = useState<string>(SAMPLE_PES_EMAILS[0].sender);
  const [body, setBody] = useState<string>(SAMPLE_PES_EMAILS[0].body);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<{
    drive: CompanyDrive;
    event: PlacementEvent;
    log: IngestionLogEntry;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedPython, setCopiedPython] = useState<boolean>(false);

  const handleSelectFixture = (fixture: SampleEmailFixture) => {
    setSelectedFixtureId(fixture.id);
    setSubject(fixture.subject);
    setSender(fixture.sender);
    setBody(fixture.body);
    setLastResult(null);
    setErrorMsg(null);
  };

  const handleRunParser = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/parse-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          sender,
          body,
          gmailMessageId: `msg_${Date.now()}`,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Parsing failed");

      setLastResult(json.data);
      onIngestSuccess(json.data);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const googleAppsScriptCode = `/**
 * PES Placement & Communication Tracker - Google Apps Script
 * Automatically pulls ALL emails from PESU_TRACKED / PESU_TAGGED / @pes.edu
 * from July onwards and streams them directly into your dashboard.
 *
 * HOW TO RUN:
 * 1. Open https://script.google.com and click "New Project".
 * 2. Paste this entire code into Code.gs and click Save (Ctrl+S).
 * 3. Select "syncAllHistoricEmails" from the dropdown and click "Run (▶)".
 *    -> This will pull and sync ALL past emails into your dashboard!
 * 4. To enable 24/7 background syncing for incoming emails:
 *    -> Click Triggers (⏰ icon on the left) -> "Add Trigger" -> Select "syncPesEmails" -> Time-driven -> Every 5 minutes.
 */

const WEBHOOK_URL = "https://placement-tracker-teal.vercel.app/api/parse-email";

// 1. RUN THIS ONCE TO PULL AND BACKFILL ALL PAST EMAILS
function syncAllHistoricEmails() {
  Logger.log("Starting full historic sync of all PES emails...");
  
  const queries = [
    'label:PESU_TRACKED',
    'label:pesu_tracked',
    'label:PESU_TAGGED',
    'label:pesu_tagged',
    'from:(*@pes.edu)'
  ];

  let processedCount = 0;
  let label = GmailApp.getUserLabelByName("TRACKED_TO_DASHBOARD");
  if (!label) {
    label = GmailApp.createLabel("TRACKED_TO_DASHBOARD");
  }

  for (let q = 0; q < queries.length; q++) {
    const currentQuery = queries[q];
    Logger.log("Searching: " + currentQuery);
    
    const threads = GmailApp.search(currentQuery, 0, 100);
    Logger.log("Found " + threads.length + " threads for " + currentQuery);

    for (let i = 0; i < threads.length; i++) {
      const messages = threads[i].getMessages();
      for (let j = 0; j < messages.length; j++) {
        const msg = messages[j];
        
        // Extract attachment file names (.xlsx, .xls, .csv, .pdf)
        const attachments = msg.getAttachments();
        let attachmentNames = [];
        for (let k = 0; k < attachments.length; k++) {
          attachmentNames.push(attachments[k].getName());
        }

        let bodyText = msg.getPlainBody();
        if (attachmentNames.length > 0) {
          bodyText += "\\n\\n[Attached Files in Email: " + attachmentNames.join(", ") + "]";
        }

        const payload = {
          subject: msg.getSubject(),
          sender: msg.getFrom(),
          body: bodyText,
          receivedAt: msg.getDate().toISOString(),
          gmailMessageId: msg.getId()
        };

        try {
          const response = UrlFetchApp.fetch(WEBHOOK_URL, {
            method: "post",
            contentType: "application/json",
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
          });
          processedCount++;
          Logger.log("Synced [" + processedCount + "]: " + msg.getSubject() + " -> HTTP " + response.getResponseCode());
        } catch (err) {
          Logger.log("Error posting message: " + err);
        }
      }
      threads[i].addLabel(label);
    }
  }

  Logger.log("Completed! Total messages synced: " + processedCount);
}

// 2. AUTOMATIC TRIGGER FUNCTION (RUNS EVERY 5 MINUTES FOR NEW EMAILS)
function syncPesEmails() {
  const query = '(label:PESU_TRACKED OR label:pesu_tracked OR label:PESU_TAGGED OR label:pesu_tagged OR from:(*@pes.edu)) -label:TRACKED_TO_DASHBOARD';
  const threads = GmailApp.search(query, 0, 30);
  
  if (threads.length === 0) return;

  let label = GmailApp.getUserLabelByName("TRACKED_TO_DASHBOARD");
  if (!label) {
    label = GmailApp.createLabel("TRACKED_TO_DASHBOARD");
  }

  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];
      
      const attachments = msg.getAttachments();
      let attachmentNames = [];
      for (let k = 0; k < attachments.length; k++) {
        attachmentNames.push(attachments[k].getName());
      }

      let bodyText = msg.getPlainBody();
      if (attachmentNames.length > 0) {
        bodyText += "\\n\\n[Attached Files in Email: " + attachmentNames.join(", ") + "]";
      }

      const payload = {
        subject: msg.getSubject(),
        sender: msg.getFrom(),
        body: bodyText,
        receivedAt: msg.getDate().toISOString(),
        gmailMessageId: msg.getId()
      };

      try {
        UrlFetchApp.fetch(WEBHOOK_URL, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
      } catch (err) {
        Logger.log("Error: " + err);
      }
    }
    threads[i].addLabel(label);
  }
}`;

  const pythonScriptCommand = `python scripts/sync_gmail_local.py --webhook https://placement-tracker-teal.vercel.app/api/parse-email`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyPython = () => {
    navigator.clipboard.writeText(pythonScriptCommand);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2000);
  };

  return (
    <div className="clean-card p-5 space-y-4 mb-8 bg-white border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Sync PES Emails (Gmail PESU_TRACKED / PESU_TAGGED)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated Google Apps Script &amp; Local Python Sync Engine
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab("how-it-works")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "how-it-works"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Live Gmail Sync Setup
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "test"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Test Email Ingestion
          </button>
        </div>
      </div>

      {activeTab === "how-it-works" ? (
        <div className="space-y-4 text-xs">
          {/* Method 1: Google Apps Script for 24/7 background sync */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  Option 1 (Recommended): Google Apps Script (Pulls Everything from PESU_TRACKED)
                </span>
                <p className="text-indigo-800 text-xs mt-0.5 font-medium">
                  Runs directly inside your Google account. Has a <strong>syncAllHistoricEmails</strong> function to pull all past emails, plus a 5-minute recurring background sync.
                </p>
              </div>

              <button
                onClick={copyAppsScript}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 text-xs font-bold flex-shrink-0 shadow-xs"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? "Copied Script!" : "Copy Google Apps Script"}</span>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-64">
              <pre>{googleAppsScriptCode}</pre>
            </div>

            <div className="p-3 rounded-lg bg-white border border-indigo-200 text-slate-700 text-xs space-y-1">
              <strong>Quick 2-Step Instructions:</strong>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                <li>Go to <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">script.google.com</a>, create a project, paste this code, and click Save.</li>
                <li>Select <code>syncAllHistoricEmails</code> from the top dropdown and click <strong>Run (▶)</strong>. It will pull all your emails from <code>PESU_TRACKED</code> into the website!</li>
              </ol>
            </div>
          </div>

          {/* Method 2: Local Python Scanner for PESU_TRACKED */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  Option 2: Run Local Python Scanner from Terminal
                </span>
                <p className="text-slate-600 text-xs mt-0.5">
                  Scans your Gmail account for <strong>PESU_TRACKED</strong>, <strong>PESU_TAGGED</strong>, or <strong>@pes.edu</strong> and syncs them.
                </p>
              </div>

              <button
                onClick={copyPython}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-semibold flex-shrink-0 shadow-2xs"
              >
                {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPython ? "Copied Command!" : "Copy Command"}</span>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
              <code>python scripts/sync_gmail_local.py --webhook https://placement-tracker-teal.vercel.app/api/parse-email</code>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Sample template selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Load an Authentic @pes.edu Email Template:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PES_EMAILS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectFixture(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedFixtureId === item.id
                      ? "bg-indigo-50 text-indigo-700 border-indigo-300 font-bold shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.expectedCompany}</span>
                  <span className="text-[10px] text-slate-400 ml-1">({item.tag})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Email Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  Subject Line:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  Sender:
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  Email Body:
                </label>
                <textarea
                  rows={7}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-400 leading-relaxed"
                />
              </div>

              <button
                onClick={handleRunParser}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Parsing &amp; Categorizing with AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Parse &amp; Ingest into Dashboard Bucket</span>
                  </>
                )}
              </button>
            </div>

            {/* Structured Output / Result */}
            <div className="space-y-2">
              <label className="block text-[11px] text-slate-700 font-semibold flex items-center justify-between">
                <span>Structured Extraction JSON:</span>
                {lastResult && (
                  <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Added to Timeline
                  </span>
                )}
              </label>

              <div className="h-72 p-3.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-auto">
                {lastResult ? (
                  <pre>{JSON.stringify(lastResult, null, 2)}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-center text-xs">
                    Click &ldquo;Parse &amp; Ingest&rdquo; to test structured multi-category extraction.
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

