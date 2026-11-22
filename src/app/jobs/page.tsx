"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const JOBS_KEY = "rehab-source-jobs";

interface Job {
  id: string;
  title: string;
  discipline: string;
  location: string;
  description: string;
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("PT");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const data = localStorage.getItem(JOBS_KEY);
    if (data) {
      try {
        setJobs(JSON.parse(data));
      } catch {}
    }
  }, []);

  function saveJobs(list: Job[]) {
    setJobs(list);
    localStorage.setItem(JOBS_KEY, JSON.stringify(list));
  }

  function createJob(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newJob: Job = {
      id: Date.now().toString(),
      title: title.trim(),
      discipline,
      location: location.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    saveJobs([newJob, ...jobs]);
    setTitle("");
    setLocation("");
    setDescription("");
    setShowForm(false);
  }

  function deleteJob(id: string) {
    saveJobs(jobs.filter((j) => j.id !== id));
  }

  return (
    return (
  <div className="p-6 md:p-10 pt-20 md:pt-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Jobs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{jobs.length} open position{jobs.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-4 py-2 text-sm font-medium hover:bg-blue-700 dark:hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          New Job
        </button>
      </div>

      {showForm && (
        <form onSubmit={createJob} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Outpatient PT – Charlotte"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discipline</label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
              >
                <option>PT</option>
                <option>OT</option>
                <option>SLP</option>
                <option>PTA</option>
                <option>OTA</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Charlotte, NC"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 dark:hover:bg-cyan-400">
              Create Job
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              Cancel
            </button>
          </div>
        </form>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400">
          No jobs yet. Click “New Job” to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{job.title}</h3>
                  <p className="text-sm text-blue-700 dark:text-cyan-400 mt-1">{job.discipline} • {job.location || "Location not set"}</p>
                  {job.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{job.description}</p>}
                </div>
                <button onClick={() => deleteJob(job.id)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}