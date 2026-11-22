"use client";

import { useState, useEffect } from "react";
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
const SEARCH_STATE_KEY = "rehab-source-last-search";

export default function CandidatesPage() {
  const [disciplines, setDisciplines] = useState<Discipline[]>(["PT"]);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("");
  const [results, setResults] = useState<NPPESResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [savedNpis, setSavedNpis] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedCandidates = localStorage.getItem(STORAGE_KEY);
    if (savedCandidates) {
      try {
        const list = JSON.parse(savedCandidates) as NPPESResult[];
        setSavedNpis(new Set(list.map((c) => c.npi)));
      } catch {}
    }

    const lastSearch = localStorage.getItem(SEARCH_STATE_KEY);
    if (lastSearch) {
      try {
        const data = JSON.parse(lastSearch);
        setDisciplines(data.disciplines || ["PT"]);
        setState(data.state || "");
        setCity(data.city || "");
        setZip(data.zip || "");
        setRadius(data.radius || "");
        setResults(data.results || []);
        setSearched(!!data.results?.length);
        setHasMore(data.hasMore || false);
        setCurrentSkip(data.currentSkip || 0);
      } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    const stateToSave = {
      disciplines,
      state,
      city,
      zip,
      radius,
      results,
      hasMore,
      currentSkip,
    };
    localStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(stateToSave));
  }, [hydrated, disciplines, state, city, zip, radius, results, hasMore, currentSkip]);

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

  function bulkSave() {
    results
      .filter((r) => selected.has(r.npi))
      .forEach((r) => saveCandidate(r));
    setSelected(new Set());
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
    setSelected(new Set());

    try {
      const params = new URLSearchParams({
        disciplines: disciplines.join(","),
        limit: String(PAGE_SIZE),
        skip: String(skip),
      });

      if (state) params.set("state", state);
      if (city) params.set("city", city);
      if (zip) {
        params.set("zip", zip);
        if (radius) params.set("radius", radius);
      }

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
    <div className="p-4 md:p-10 pt-20 md:pt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Search Candidates</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Source from the official NPPES registry (PT · OT · SLP · PTA · OTA)
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Discipline</label>
          <div className="flex flex-wrap gap-2">
            {ALL_DISCIPLINES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDiscipline(d)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  disciplines.includes(d)
                    ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 border-blue-600 dark:border-cyan-500"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                )}
              >
                {d}
                <span className="ml-1.5 text-xs opacity-80">{DISCIPLINE_LABELS[d].split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
            >
              <option value="">Any state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Charlotte"
              className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">ZIP Code</label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="e.g. 28202"
              className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Radius</label>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              disabled={!zip}
              className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 disabled:opacity-50"
            >
              <option value="">No radius</option>
              <option value="10">10 miles</option>
              <option value="25">25 miles</option>
              <option value="50">50 miles</option>
              <option value="100">100 miles</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-4 py-2.5 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-6 py-2.5 text-sm font-medium hover:bg-blue-700 dark:hover:bg-cyan-400 disabled:opacity-60 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Searching NPPES…" : "Search Candidates"}
        </button>
      </form>

      {searched && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {loading ? "Searching…" : `${results.length} candidate${results.length !== 1 ? "s" : ""} found`}
            </h2>
            {selected.size > 0 && (
              <button
                onClick={bulkSave}
                className="text-sm bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-4 py-2 rounded-xl hover:bg-blue-700 dark:hover:bg-cyan-400"
              >
                Save {selected.size} selected
              </button>
            )}
          </div>

          {results.length === 0 && !loading ? (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <Filter className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-300 font-medium">No candidates found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Try expanding the radius or selecting additional disciplines
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {results.map((r) => (
                  <div key={r.npi} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected.has(r.npi)}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(r.npi);
                        else next.delete(r.npi);
                        setSelected(next);
                      }}
                      className="mt-6 accent-blue-600 dark:accent-cyan-500"
                    />
                    <div className="flex-1">
                      <CandidateCard
                        result={r}
                        isSaved={savedNpis.has(r.npi)}
                        onSave={() => saveCandidate(r)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-6 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
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
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {result.firstName} {result.lastName}
            </h3>
            {result.credentials && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {result.credentials}
              </span>
            )}
          </div>
          <p className="text-sm text-blue-700 dark:text-cyan-400 font-medium mb-2">
            {result.taxonomyDesc || "Therapy Provider"}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            {(result.city || result.state) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {[result.city, result.state].filter(Boolean).join(", ")}
                {result.zip ? ` ${result.zip}` : ""}
                {result.distance !== undefined && (
                  <span className="text-slate-400 dark:text-slate-500">· {result.distance} mi</span>
                )}
              </span>
            )}
            {result.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {result.phone}
              </span>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500">NPI {result.npi}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaved}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0",
            isSaved
              ? "border-green-200 dark:border-emerald-700 bg-green-50 dark:bg-emerald-950/50 text-green-700 dark:text-emerald-400"
              : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          {isSaved ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}