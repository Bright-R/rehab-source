"use client";

import { useEffect, useState } from "react";
import { Trash2, Download, RefreshCw, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const SAVED_KEY = "rehab-source-saved";
const JOBS_KEY = "rehab-source-jobs";
const SEARCH_KEY = "rehab-source-last-search";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [savedCount, setSavedCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_KEY);
    const jobs = localStorage.getItem(JOBS_KEY);
    if (saved) {
      try {
        setSavedCount(JSON.parse(saved).length);
      } catch {}
    }
    if (jobs) {
      try {
        setJobsCount(JSON.parse(jobs).length);
      } catch {}
    }
  }, []);

  function clearSavedCandidates() {
    if (confirm("Delete all saved candidates? This cannot be undone.")) {
      localStorage.removeItem(SAVED_KEY);
      setSavedCount(0);
    }
  }

  function clearJobs() {
    if (confirm("Delete all jobs? This cannot be undone.")) {
      localStorage.removeItem(JOBS_KEY);
      setJobsCount(0);
    }
  }

  function clearSearchHistory() {
    localStorage.removeItem(SEARCH_KEY);
    alert("Last search cleared.");
  }

  function exportAllData() {
    const data = {
      candidates: JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"),
      jobs: JSON.parse(localStorage.getItem(JOBS_KEY) || "[]"),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rehabsource-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your data and preferences</p>
      </div>

      <div className="space-y-4">
        {/* Theme */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Appearance</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                theme === "light"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                theme === "dark"
                  ? "bg-cyan-500 text-slate-950 border-cyan-500"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
          </div>
        </div>

        {/* Data Overview */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Your Data</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500 dark:text-slate-400">Saved Candidates</div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{savedCount}</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400">Jobs</div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{jobsCount}</div>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-2">Backup</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Download all your candidates and jobs as a JSON file.</p>
          <button
            onClick={exportAllData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            Export All Data
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-900/60 border border-red-200 dark:border-red-900/50 rounded-2xl p-6">
          <h2 className="font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <button
              onClick={clearSearchHistory}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Clear last search
            </button>
            <button
              onClick={clearSavedCandidates}
              className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete all saved candidates
            </button>
            <button
              onClick={clearJobs}
              className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete all jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}