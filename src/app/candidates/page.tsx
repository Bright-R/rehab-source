"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  Loader2,
  UserPlus,
  Filter,
  Check,
} from "lucide-react";
import { Discipline, DISCIPLINE_LABELS, NPPESResult } from "@/types";
import { cn } from "@/lib/utils";

const ALL_DISCIPLINES: Discipline[] = ["PT", "OT", "SLP", "PTA", "OTA"];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
];

const PAGE_SIZE = 200;
const STORAGE_KEY = "rehab-source-saved";

export default function CandidatesPage() {
  const [disciplines, setDisciplines] = useState<Discipline[]>(["PT"]);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [results, setResults] = useState<NPPESResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [savedNpis, setSavedNpis] = useState<Set<string>>(new Set());

  // Load saved NPIs on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const list = JSON.parse(saved) as NPPESResult[];
          setSavedNpis(new Set(list.map((c) => c.npi)));
        } catch {}
      }
    }
  });

  function toggleDiscipline(d: Discipline) {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

function saveCandidate(candidate: NPPESResult) {
  if (typeof window === "undefined") return;

  const existing = localStorage.getItem(STORAGE_KEY);
  let list: any[] = [];
  if (existing) {
    try {
      list = JSON.parse(existing);
    } catch {}
  }

  if (list.some((c) => c.npi === candidate.npi)) return;

  const withMeta = {
    ...candidate,
    stage: "New",
    notes: "",
    savedAt: new Date().toISOString(),
  };

  list.unshift(withMeta);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  setSavedNpis((prev) => new Set(prev).add(candidate.npi));
}

  async function doSearch(skip = 0, append = false) {
    if (disciplines.length === 0) {
      setError("Select at least one discipline");
      return;
    }
    if (!state && !city && !zip) {
      setError("Enter a state, city, or ZIP code");
      return;
    }

    if (append) setLoadingMore(true);
    else setLoading(true);

    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        disciplines: disciplines.join(","),
        limit: String(PAGE_SIZE),
        skip: String(skip),
      });
      if (state) params.set("state", state);
      if (city) params.set("city", city);
      if (zip) params.set("zip", zip);

      const res = await fetch(`/api/nppes?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Search failed");

      const newResults = data.results || [];

      if (append) {
        setResults((prev) => [...prev, ...newResults]);
      } else {
        setResults(newResults);
      }

      setHasMore(newResults.length === PAGE_SIZE);
      setCurrentSkip(skip + newResults.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      if (!append) setResults([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCurrentSkip(0);
    doSearch(0, false);
  }

  function handleLoadMore() {
    doSearch(currentSkip, true);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Search Candidates</h1>
        <p className="text-slate-500 mt-1">
          Source from the official NPPES registry (PT · OT · SLP · PTA · OTA)
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-xl border p-6 mb-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Discipline</label>
          <div className="flex flex-wrap gap-2">
            {ALL_DISCIPLINES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDiscipline(d)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                  disciplines.includes(d)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                )}
              >
                {d}
                <span className="ml-1.5 text-xs opacity-80">{DISCIPLINE_LABELS[d].split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Charlotte"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ZIP Code</label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="e.g. 28202"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Searching NPPES…" : "Search Candidates"}
        </button>
      </form>

      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">
              {loading ? "Searching…" : `${results.length} candidate${results.length !== 1 ? "s" : ""} found`}
            </h2>
          </div>

          {results.length === 0 && !loading ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Filter className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No candidates found</p>
              <p className="text-sm text-slate-400 mt-1">
                Try expanding the location or selecting additional disciplines
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                {results.map((r) => (
                  <CandidateCard
                    key={r.npi}
                    result={r}
                    isSaved={savedNpis.has(r.npi)}
                    onSave={() => saveCandidate(r)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loadingMore ? "Loading more…" : "Load More Candidates"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CandidateCard({
  result,
  isSaved,
  onSave,
}: {
  result: NPPESResult;
  isSaved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border p-5 hover:border-blue-200 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">
              {result.firstName} {result.lastName}
            </h3>
            {result.credentials && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {result.credentials}
              </span>
            )}
          </div>
          <p className="text-sm text-blue-700 font-medium mb-2">
            {result.taxonomyDesc || "Therapy Provider"}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            {(result.city || result.state) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {[result.city, result.state].filter(Boolean).join(", ")}
                {result.zip ? ` ${result.zip}` : ""}
              </span>
            )}
            {result.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {result.phone}
              </span>
            )}
            <span className="text-xs text-slate-400">NPI {result.npi}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaved}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors shrink-0",
            isSaved
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          )}
        >
          {isSaved ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}