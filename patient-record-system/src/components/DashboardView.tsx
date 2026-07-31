import React from 'react';
import {
  Users,
  BedDouble,
  Calendar,
  AlertTriangle,
  UserCheck,
  Plus,
  Pill,
  TestTube,
  Sparkles,
  Activity,
  Clock,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Patient, BedItem, Appointment, Doctor } from '../types';

interface DashboardViewProps {
  patients: Patient[];
  beds: BedItem[];
  appointments: Appointment[];
  doctors: Doctor[];
  onOpenNewAdmission: () => void;
  onOpenPatientModal: (patient: Patient) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  beds,
  appointments,
  doctors,
  onOpenNewAdmission,
  onOpenPatientModal,
  onNavigateTab,
}) => {
  // Key Stats Calculations
  const totalPatients = patients.length;
  const admittedCount = patients.filter((p) => p.admissionStatus !== 'Discharged').length;

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const todayAppointments = appointments.length;
  const emergencyPatients = patients.filter(
    (p) => p.triageCategory === 'emergency' && p.admissionStatus !== 'Discharged'
  );
  const urgentPatients = patients.filter(
    (p) => p.triageCategory === 'urgent' && p.admissionStatus !== 'Discharged'
  );
  const routinePatients = patients.filter(
    (p) => p.triageCategory === 'routine' && p.admissionStatus !== 'Discharged'
  );

  const availableDoctors = doctors.filter((d) => d.status === 'Available').length;

  // Department Occupancy Chart Data
  const wards = Array.from(new Set(beds.map((b) => b.wardName))) as string[];
  const wardChartData = wards.map((ward) => {
    const wardBeds = beds.filter((b) => b.wardName === ward);
    const occupied = wardBeds.filter((b) => b.status === 'Occupied').length;
    const available = wardBeds.length - occupied;
    return {
      ward: ward.replace(' Ward', '').replace(' Unit', ''),
      Occupied: occupied,
      Available: available,
    };
  });

  // Triage Distribution Data for Pie Chart
  const triagePieData = [
    { name: 'Emergency (Red)', value: emergencyPatients.length, color: '#ef4444' },
    { name: 'Urgent (Yellow)', value: urgentPatients.length, color: '#f59e0b' },
    { name: 'Routine (Green)', value: routinePatients.length, color: '#10b981' },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome & KPI Header Banner */}
      <div className="bg-[#121216] text-zinc-100 rounded-2xl p-6 shadow-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-500/10 text-teal-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Live Hospital Operations
            </span>
            <span className="text-xs text-zinc-500">| St. Jude Memorial Medical Center</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Clinical Operations Dashboard
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Real-time emergency triage metrics, inpatient bed distribution, physician schedules, and AI-assisted diagnosis workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewAdmission}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Patient Intake</span>
          </button>
          <button
            onClick={() => onNavigateTab('ai')}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/20 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Triage Copilot</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Active Patients */}
        <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Active Inpatients
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalPatients}</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {admittedCount} admitted
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> Active EHR patient files
          </p>
        </div>

        {/* Ward Bed Occupancy */}
        <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Ward Occupancy
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{occupancyRate}%</span>
            <span className="text-xs font-medium text-zinc-400">
              ({occupiedBeds}/{totalBeds} beds)
            </span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 mt-3 overflow-hidden border border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyRate > 85 ? 'bg-rose-500' : occupancyRate > 65 ? 'bg-amber-500' : 'bg-teal-500'
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Scheduled Consultations */}
        <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Appointments
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{todayAppointments}</span>
            <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
              Today
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">OPD & Telehealth bookings</p>
        </div>

        {/* Critical ER Triage */}
        <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              ER Emergency Triage
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">{emergencyPatients.length}</span>
            <span className="text-xs font-semibold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
              Red Alert
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">Requires immediate stabilization</p>
        </div>

        {/* On Duty Doctors */}
        <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              On-Duty Physicians
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{availableDoctors}</span>
            <span className="text-xs text-zinc-500 font-medium">/ {doctors.length} Total</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Available for consult
          </p>
        </div>
      </div>

      {/* Quick Action Workflow Bar */}
      <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
          Quick Workflow Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={onOpenNewAdmission}
            className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-teal-500/50 hover:bg-zinc-800 transition-all text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-zinc-950 transition-colors">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100">New Intake</p>
              <p className="text-[10px] text-zinc-500">Register patient</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('appointments')}
            className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-purple-500/50 hover:bg-zinc-800 transition-all text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100">Book OPD</p>
              <p className="text-[10px] text-zinc-500">Doctor slots</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('pharmacy')}
            className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100">E-Prescribe</p>
              <p className="text-[10px] text-zinc-500">Rx generator</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('labs')}
            className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-amber-500/50 hover:bg-zinc-800 transition-all text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
              <TestTube className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100">Order Lab</p>
              <p className="text-[10px] text-zinc-500">Blood/imaging</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('ai')}
            className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-teal-500/50 hover:bg-zinc-800 transition-all text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100">AI Triage</p>
              <p className="text-[10px] text-zinc-500">Risk analysis</p>
            </div>
          </button>
        </div>
      </div>

      {/* Visual Analytics Grid: Ward Occupancy Bar Chart & Triage Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Bed Capacity Chart */}
        <div className="lg:col-span-2 bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-teal-400" />
                Ward Bed Capacity & Occupancy Breakdown
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Occupied vs Available beds across hospital wards
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('beds')}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Interactive Bed Map <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="ward" tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Occupied" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Occupied Beds" />
                <Bar dataKey="Available" fill="#27272a" radius={[6, 6, 0, 0]} name="Available Beds" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Risk Triage Distribution */}
        <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              Patient Triage Category
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Risk classification ratio</p>
          </div>

          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={triagePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {triagePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800">
            {triagePieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="font-medium text-zinc-300">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value} patients</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Emergency Triage Patients Table */}
      <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-white text-base">
                Critical Triage Patients (Emergency Priority)
              </h3>
              <p className="text-xs text-zinc-500">
                Patients requiring STAT physician evaluation, continuous vitals, and immediate orders
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('patients')}
            className="text-xs text-teal-400 hover:text-teal-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            Full EHR Registry <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {emergencyPatients.length > 0 ? (
            emergencyPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => onOpenPatientModal(patient)}
                className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-rose-600/80 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-rose-600/20">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm hover:text-teal-400 transition-colors">
                        {patient.firstName} {patient.lastName}
                      </h4>
                      <span className="text-[10px] font-mono bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 font-semibold">
                        MRN: {patient.mrn}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {patient.age} yrs • {patient.gender} • Blood Group: <strong className="text-rose-400">{patient.bloodGroup}</strong> • Unit: <strong className="text-zinc-200">{patient.department}</strong> ({patient.wardRoomBed})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end">
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm">
                      <AlertTriangle className="w-3 h-3" /> EMERGENCY
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Attending: {patient.primaryPhysician}
                    </p>
                  </div>
                  <div className="p-2 text-zinc-400 hover:text-white">
                    <ArrowUpRight className="w-5 h-5 text-zinc-500" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-500 italic py-8 text-center bg-zinc-900/50 rounded-xl border border-zinc-800">
              No patients currently flagged as high-risk Emergency triage.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
