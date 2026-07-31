import React from 'react';
import {
  Activity,
  Users,
  BedDouble,
  Calendar,
  Pill,
  TestTube,
  Receipt,
  Sparkles,
  Search,
  Plus,
  AlertTriangle,
  RotateCcw,
  Clock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'patients'
  | 'beds'
  | 'appointments'
  | 'pharmacy'
  | 'labs'
  | 'billing'
  | 'ai';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewAdmission: () => void;
  onResetData: () => void;
  emergencyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenNewAdmission,
  onResetData,
  emergencyCount,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'patients', label: 'Patients & EHR', icon: <Users className="w-4 h-4" />, badge: emergencyCount },
    { id: 'beds', label: 'Wards & Beds', icon: <BedDouble className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'pharmacy', label: 'Pharmacy & Meds', icon: <Pill className="w-4 h-4" /> },
    { id: 'labs', label: 'Lab Diagnostics', icon: <TestTube className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing & Claims', icon: <Receipt className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Clinical Copilot', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#121216] border-b border-zinc-800 text-zinc-200 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between h-16 gap-4 border-b border-zinc-800/80">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-teal-500 text-zinc-950 flex items-center justify-center font-bold text-lg shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-zinc-950" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight leading-none group-hover:text-teal-400 transition-colors">
                  HEALIO<span className="text-teal-400 text-xs ml-1 font-semibold uppercase tracking-wider">Pro</span>
                </h1>
                <span className="bg-teal-500/10 text-teal-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-400" /> Enterprise EHR
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2">
                <span>Clinical & Operational Suite</span>
                <span className="inline-block w-1 h-1 rounded-full bg-zinc-700"></span>
                <span className="text-teal-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Live Operations
                </span>
              </p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, MRN (e.g. HSP-84920), diagnosis..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-10 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 transition-colors shadow-inner"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-mono px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-950">
                  ⌘K
                </span>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {emergencyCount > 0 && (
              <button
                onClick={() => setActiveTab('patients')}
                className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-500/20 transition-all pulse-emergency cursor-pointer"
                title="Critical Emergency Alerts"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{emergencyCount} ER Alert{emergencyCount > 1 ? 's' : ''}</span>
              </button>
            )}

            <button
              onClick={onOpenNewAdmission}
              className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-3.5 py-2 rounded-lg shadow-md shadow-teal-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
              <span className="hidden sm:inline">New Admission</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset Mock Hospital Data"
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-teal-400 font-bold text-xs shadow-inner">
                <UserCheck className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-medium text-zinc-200">Dr. Sarah Jenkins</p>
                <p className="text-[10px] text-zinc-500">Cardiology Dept.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-2.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800/90 text-white font-semibold shadow-xs border border-zinc-700/80'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-teal-400' : 'text-zinc-500'}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-teal-500 text-zinc-950' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
