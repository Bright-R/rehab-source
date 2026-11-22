"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Trash2, Download, MessageSquare, Search } from "lucide-react";
import { NPPESResult } from "@/types";

const STORAGE_KEY = "rehab-source-saved";
const JOBS_KEY = "rehab-source-jobs";

type Stage = "New" | "Contacted" | "Interested" | "Interviewing" | "Hired" | "Not Interested";

interface SavedCandidate extends NPPESResult {
  stage: Stage;
  notes: string;
  savedAt: string;
  jobId?: string;
}

const STAGES: Stage[] = ["New", "Contacted", "Interested", "Interviewing", "Hired", "Not Interested"];

export default function PipelinePage() {
  const [saved, setSaved] = useState<SavedCandidate[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [selected, setSelected] = useState<SavedCandidate | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "All">("All");
  const [disciplineFilter, setDisciplineFilter] = useState("All");

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const list = JSON.parse(data);
        const migrated = list.map((c: any) => ({
          ...c,
          stage: c.stage || "New",
          notes: c.notes || "",
          savedAt: c.savedAt || new Date().toISOString(),
        }));
        setSaved(migrated);
      } catch {}
    }

    const jobsData = localStorage.getItem(JOBS_KEY);
    if (jobsData) {
      try {
        const list = JSON.parse(jobsData);
        setJobs(list.map((j: any) => ({ id: j.id, title: j.title })));
      } catch {}
    }
  }, []);

  function saveList(list: SavedCandidate[]) {
    setSaved(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function updateCandidate(npi: string, updates: Partial<SavedCandidate>) {
    const updated = saved.map((c) => (c.npi === npi ? { ...c, ...updates } : c));
    saveList(updated);
    if (selected?.npi === npi) setSelected({ ...selected, ...updates });
  }

  function removeCandidate(npi: string) {
    const updated = saved.filter((c) => c.npi !== npi);
    saveList(updated);
    if (selected?.npi === npi) setSelected(null);
  }

  function exportCSV() {
    if (saved.length === 0) return;
    const headers = ["First Name","Last Name","Credentials","Discipline","City","State","ZIP","Phone","NPI","Stage","Job","Notes","Saved At","Distance"];
    const rows = saved.map((c) => [
      c.firstName, c.lastName, c.credentials || "", c.taxonomyDesc || "",
      c.city || "", c.state || "", c.zip || "", c.phone || "",
      c.npi, c.stage, jobs.find(j => j.id === c.jobId)?.title || "",
      `"${(c.notes || "").replace(/"/g, '""')}"`, c.savedAt, c.distance || ""
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rehab-source-candidates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = saved.filter((c) => {
    const matchesSearch =
      search === "" ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.taxonomyDesc || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "All" || c.stage === stageFilter;
    const matchesDiscipline =
      disciplineFilter === "All" ||
      (c.taxonomyDesc || "").toUpperCase().includes(disciplineFilter);
    return matchesSearch && matchesStage && matchesDiscipline;
  });

  return (
    <div className="p-4 md:p-10 pt-20 md:pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{saved.length} candidate{saved.length !== 1 ? "s" : ""} saved</p>
        </div>
        {saved.length > 0 && (
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        )}
      </div>

      {saved.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, discipline, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as Stage | "All")}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white"
          >
            <option value="All">All Stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white"
          >
            <option value="All">All Disciplines</option>
            <option value="PT">PT</option>
            <option value="OT">OT</option>
            <option value="SLP">SLP</option>
            <option value="PTA">PTA</option>
            <option value="OTA">OTA</option>
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400">
          {saved.length === 0
            ? "No candidates saved yet. Go to Search Candidates and click Save."
            : "No candidates match your filters."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.npi} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {c.firstName} {c.lastName}
                      {c.credentials && (
                        <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {c.credentials}
                        </span>
                      )}
                    </h3>
                    <select
                      value={c.stage}
                      onChange={(e) => updateCandidate(c.npi, { stage: e.target.value as Stage })}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <select
                      value={c.jobId || ""}
                      onChange={(e) => updateCandidate(c.npi, { jobId: e.target.value || undefined })}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
                    >
                      <option value="">No job</option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-cyan-400 mt-1">{c.taxonomyDesc}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {(c.city || c.state) && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {[c.city, c.state].filter(Boolean).join(", ")}
                        {c.distance !== undefined && ` · ${c.distance} mi`}
                      </span>
                    )}
                    {c.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {c.phone}
                      </span>
                    )}
                  </div>
                  {c.notes && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic line-clamp-2">“{c.notes}”</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelected(c);
                      setNoteDraft(c.notes || "");
                    }}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 p-1"
                    title="Add / Edit Notes"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeCandidate(c.npi)}
                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">{selected.firstName} {selected.lastName}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{selected.taxonomyDesc}</p>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add notes about this candidate..."
              className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                Cancel
              </button>
              <button
                onClick={() => {
                  updateCandidate(selected.npi, { notes: noteDraft });
                  setSelected(null);
                }}
                className="px-4 py-2 text-sm bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-xl hover:bg-blue-700 dark:hover:bg-cyan-400"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}