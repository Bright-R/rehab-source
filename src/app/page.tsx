import Link from "next/link";
import { Search, Users, Briefcase, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-10 pt-20 md:pt-10 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Source and manage PT, OT, SLP, PTA & OTA candidates
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard title="Saved Candidates" value="—" icon={<Users className="h-5 w-5" />} />
        <StatCard title="Open Jobs" value="—" icon={<Briefcase className="h-5 w-5" />} />
        <StatCard title="In Pipeline" value="—" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Searches Today" value="—" icon={<Search className="h-5 w-5" />} />
      </div>

      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Quick Start</h2>
        <Link
          href="/candidates"
          className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
        >
          <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-cyan-500/10 flex items-center justify-center border border-blue-200 dark:border-cyan-500/20">
            <Search className="h-6 w-6 text-blue-600 dark:text-cyan-400" />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white">Search NPPES for candidates</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Find PTs, OTs, SLPs, PTAs and OTAs by location and discipline
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className="text-blue-600 dark:text-cyan-400">{icon}</div>
      </div>
      <div className="text-3xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}