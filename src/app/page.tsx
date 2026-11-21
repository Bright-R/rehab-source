import Link from "next/link";
import { Search, Users, Briefcase, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Source and manage PT, OT, SLP, PTA & OTA candidates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Saved Candidates"
          value="0"
          icon={<Users className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Open Jobs"
          value="0"
          icon={<Briefcase className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          title="In Pipeline"
          value="0"
          icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
        />
        <StatCard
          title="Searches Today"
          value="0"
          icon={<Search className="h-5 w-5 text-amber-600" />}
        />
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Quick Start</h2>
        <div className="space-y-3">
          <Link
            href="/candidates"
            className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">
                Search NPPES for candidates
              </div>
              <div className="text-sm text-slate-500">
                Find PTs, OTs, SLPs, PTAs and OTAs by location and discipline
              </div>
            </div>
          </Link>
        </div>
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
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}