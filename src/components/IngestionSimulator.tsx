"use client";

import React, { useState } from "react";
import {
  Inbox,
  Send,
  RefreshCw,
  Mail,
  CheckCircle2,
  Code2,
  HelpCircle,
  ArrowRight,
  Copy,
  Check,
  Terminal,
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
 * Google Apps Script for your personal @gmail.com account
 * Scans emails coming from sender "@pes.edu" and posts them to your Placement Tracker.
 *
 * Setup in 1 minute:
 * 1. Open https://script.google.com in your browser (signed in with your @gmail.com account).
 * 2. Create a New Project, paste this code and Save.
 * 3. Replace APP_URL with your webhook URL (e.g. your ngrok/tunnel URL or deployed URL).
 * 4. Add a Time-driven Trigger (Triggers icon -> Add Trigger -> Every 5 minutes).
 */

const APP_URL = "https://your-domain-or-ngrok.ngrok-free.app/api/parse-email";

function scanPesPlacementEmails() {
  // Search for all emails in your Gmail inbox coming from @pes.edu domain
  const query = 'from:(*@pes.edu) -label:PESU_TRACKED';
  const threads = GmailApp.search(query, 0, 15);
  
  if (threads.length === 0) return;

  // Create or get tracking label so we never reprocess the same email twice
  let label = GmailApp.getUserLabelByName("PESU_TRACKED");
  if (!label) {
    label = GmailApp.createLabel("PESU_TRACKED");
  }

  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];
      
      const payload = {
        subject: msg.getSubject(),
        sender: msg.getFrom(),
        body: msg.getPlainBody(),
        receivedAt: msg.getDate().toISOString(),
        gmailMessageId: msg.getId()
      };

      try {
        const response = UrlFetchApp.fetch(APP_URL, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
        Logger.log("Sent: " + msg.getSubject() + " -> Status: " + response.getResponseCode());
      } catch (err) {
        Logger.log("Error sending email: " + err);
      }
    }
    // Mark thread as processed
    threads[i].addLabel(label);
  }
}`;

  const pythonScriptCommand = `python scripts/sync_gmail_local.py`;

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
    <div className="clean-card p-5 space-y-4 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div>
          <h2 className="text-sm font-bold text-white">
            Syncing @pes.edu Emails from your @gmail.com Inbox
          </h2>
          <p className="text-xs text-gray-400">
            Automated scanning script &amp; live test sandbox
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-0.5 bg-gray-900 rounded-md border border-gray-800 text-xs">
          <button
            onClick={() => setActiveTab("how-it-works")}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === "how-it-works"
                ? "bg-gray-800 text-white font-semibold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Live Gmail Scanner Setup
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === "test"
                ? "bg-gray-800 text-white font-semibold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Test Email Ingestion
          </button>
        </div>
      </div>

      {activeTab === "how-it-works" ? (
        <div className="space-y-4 text-xs">
          {/* Method 1: Google Apps Script for @gmail.com */}
          <div className="p-4 rounded-lg bg-gray-900/90 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm">
                  Option 1: Google Apps Script (Automated 24/7 Cloud Sync)
                </span>
                <p className="text-gray-400 text-xs mt-0.5">
                  Runs directly inside your personal <strong>@gmail.com</strong> account, searches for emails from <strong>@pes.edu</strong>, and pushes them to your tracker.
                </p>
              </div>

              <button
                onClick={copyAppsScript}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 text-xs font-medium flex-shrink-0"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? "Copied Script!" : "Copy Google Apps Script"}</span>
              </button>
            </div>

            <div className="p-3 rounded bg-gray-950 border border-gray-800 text-gray-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-56">
              <pre>{googleAppsScriptCode}</pre>
            </div>

            <div className="text-[11px] text-gray-400 space-y-1">
              <strong>Quick 2-step setup:</strong>
              <ol className="list-decimal list-inside space-y-0.5 ml-1">
                <li>Go to <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">script.google.com</a> signed in with your personal @gmail.com account.</li>
                <li>Paste the script, save it, and click <strong>Triggers</strong> (clock icon) $\rightarrow$ <strong>Add Trigger</strong> $\rightarrow$ set to run <strong>Every 5 minutes</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Method 2: Local Python Scanner */}
          <div className="p-4 rounded-lg bg-gray-900/90 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm">
                  Option 2: Local Python Script (Zero Setup / Direct to localhost:3000)
                </span>
                <p className="text-gray-400 text-xs mt-0.5">
                  Runs on your computer without needing any internet tunnels or ngrok.
                </p>
              </div>

              <button
                onClick={copyPython}
                className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 flex items-center gap-1 text-xs font-medium flex-shrink-0"
              >
                {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPython ? "Copied Command" : "Copy Command"}</span>
              </button>
            </div>

            <div className="p-2.5 rounded bg-gray-950 border border-gray-800 text-xs text-emerald-400 font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>python scripts/sync_gmail_local.py</span>
            </div>

            <p className="text-[11px] text-gray-400">
              The file <code className="text-gray-300 bg-gray-950 px-1 py-0.5 rounded">scripts/sync_gmail_local.py</code> is already created in your workspace! Simply open it, set your Gmail address &amp; an App Password, and run it whenever you want to scan.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Sample template selector */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
              Load an Authentic @pes.edu Placement Email Template:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PES_EMAILS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectFixture(item)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    selectedFixtureId === item.id
                      ? "bg-blue-950/80 text-blue-200 border-blue-700 font-semibold"
                      : "bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-200"
                  }`}
                >
                  <span>{item.expectedCompany}</span>
                  <span className="text-[10px] text-gray-500 ml-1">({item.tag})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Email Form */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] text-gray-400 font-medium mb-1">
                  Subject Line:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-md text-xs text-gray-200 focus:outline-none focus:border-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-medium mb-1">
                  Sender:
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-md text-xs text-gray-200 focus:outline-none focus:border-gray-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-medium mb-1">
                  Email Body:
                </label>
                <textarea
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-md text-xs text-gray-200 font-mono focus:outline-none focus:border-gray-700 leading-relaxed"
                />
              </div>

              <button
                onClick={handleRunParser}
                disabled={isProcessing}
                className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing with Gemini LLM...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Parse &amp; Ingest into Company Tree</span>
                  </>
                )}
              </button>
            </div>

            {/* Structured Output / Result */}
            <div className="space-y-2">
              <label className="block text-[11px] text-gray-400 font-medium flex items-center justify-between">
                <span>Gemini LLM Structured Output:</span>
                {lastResult && (
                  <span className="text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Attached to Tree
                  </span>
                )}
              </label>

              <div className="h-64 p-3 bg-gray-950 rounded-md border border-gray-800 font-mono text-[11px] text-blue-300 overflow-auto">
                {lastResult ? (
                  <pre>{JSON.stringify(lastResult, null, 2)}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600 text-center text-xs">
                    Click &ldquo;Parse &amp; Ingest&rdquo; to test structured extraction.
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-2 rounded bg-red-950/50 border border-red-800 text-xs text-red-300">
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
