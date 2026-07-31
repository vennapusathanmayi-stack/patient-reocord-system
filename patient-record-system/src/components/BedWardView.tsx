import React, { useState } from 'react';
import { BedDouble, CheckCircle2, RefreshCw, X, LogOut, ChevronRight, UserPlus, ShieldAlert, Building } from 'lucide-react';
import { BedItem, Patient } from '../types';

interface BedWardViewProps {
  beds: BedItem[];
  patients: Patient[];
  onUpdateBeds: (beds: BedItem[]) => void;
  onOpenPatientModal: (patient: Patient) => void;
}

export const BedWardView: React.FC<BedWardViewProps> = ({
  beds,
  patients,
  onUpdateBeds,
  onOpenPatientModal,
}) => {
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [showAssignModal, setShowAssignModal] = useState<BedItem | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const wards = ['ALL', 'ICU', 'Emergency Ward', 'Cardiology Unit', 'General Ward', 'Pediatric Ward', 'Surgical Suite'];

  const filteredBeds = selectedWard === 'ALL' ? beds : beds.filter((b) => b.wardName === selectedWard);

  // Unassigned Patients (Admitted but no bed assigned or need relocation)
  const unassignedPatients = patients.filter((p) => p.admissionStatus !== 'Discharged');

  // Handle Bed Assignment
  const handleAssignBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssignModal || !selectedPatientId) return;

    const targetPatient = patients.find((p) => p.id === selectedPatientId);
    if (!targetPatient) return;

    const updatedBeds = beds.map((b) => {
      if (b.id === showAssignModal.id) {
        return {
          ...b,
          status: 'Occupied' as const,
          patientId: targetPatient.id,
          patientName: `${targetPatient.firstName} ${targetPatient.lastName}`,
          mrn: targetPatient.mrn,
          admissionDate: new Date().toISOString().split('T')[0],
          attendingDoctor: targetPatient.primaryPhysician,
        };
      }
      return b;
    });

    onUpdateBeds(updatedBeds);
    setShowAssignModal(null);
    setSelectedPatientId('');
  };

  // Handle Freeing / Discharging Bed
  const handleFreeBed = (bedId: string) => {
    if (!confirm('Are you sure you want to release and mark this bed for cleaning?')) return;

    const updatedBeds = beds.map((b) => {
      if (b.id === bedId) {
        return {
          ...b,
          status: 'Available' as const,
          patientId: undefined,
          patientName: undefined,
          mrn: undefined,
          admissionDate: undefined,
          attendingDoctor: undefined,
        };
      }
      return b;
    });

    onUpdateBeds(updatedBeds);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Ward Selector Bar */}
      <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-teal-400" /> Ward Bed Allocation & Occupancy Map
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live bed capacity and patient relocation matrix across hospital units
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Available Bed
            </span>
            <span className="flex items-center gap-1.5 text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span> Occupied Inpatient
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Sanitizing / Maint
            </span>
          </div>
        </div>

        {/* Ward Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-3 border-t border-zinc-800">
          {wards.map((ward) => (
            <button
              key={ward}
              onClick={() => setSelectedWard(ward)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedWard === ward
                  ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {ward}
            </button>
          ))}
        </div>
      </div>

      {/* Bed Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const isOccupied = bed.status === 'Occupied';
          const isAvailable = bed.status === 'Available';

          const matchingPatient = patients.find((p) => p.id === bed.patientId);

          return (
            <div
              key={bed.id}
              className={`bg-[#121216] rounded-2xl p-5 border transition-all shadow-sm flex flex-col justify-between ${
                isOccupied
                  ? 'border-teal-500/30 bg-gradient-to-b from-teal-500/5 to-transparent'
                  : isAvailable
                  ? 'border-zinc-800 hover:border-emerald-500/40'
                  : 'border-amber-500/20 bg-amber-500/5'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                    {bed.wardName}
                  </span>
                  <h3 className="font-extrabold text-white text-lg font-mono tracking-tight">
                    {bed.bedNumber}
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    isOccupied
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                      : isAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {bed.status}
                </span>
              </div>

              {/* Patient Details if Occupied */}
              {isOccupied && bed.patientName ? (
                <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white text-sm">{bed.patientName}</p>
                    <span className="font-mono text-[10px] text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                      {bed.mrn}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-[11px]">Admitted: {bed.admissionDate}</p>
                  <p className="text-teal-400 font-semibold text-[11px]">
                    Dr: {bed.attendingDoctor}
                  </p>

                  <div className="flex gap-2 pt-2 border-t border-zinc-800">
                    {matchingPatient && (
                      <button
                        onClick={() => onOpenPatientModal(matchingPatient)}
                        className="flex-1 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold py-1.5 rounded-lg text-[11px] text-center transition-all cursor-pointer shadow-sm"
                      >
                        Open Chart
                      </button>
                    )}
                    <button
                      onClick={() => handleFreeBed(bed.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                      title="Release Bed"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : isAvailable ? (
                <div className="py-4 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs text-zinc-500 font-medium">Bed disinfected & ready</p>
                  <button
                    onClick={() => setShowAssignModal(bed)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition-all w-full cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    Assign Inpatient
                  </button>
                </div>
              ) : (
                <div className="py-4 text-center space-y-1">
                  <RefreshCw className="w-8 h-8 text-amber-400 mx-auto animate-spin" />
                  <p className="text-xs text-amber-400 font-semibold">Sanitizing / Cleaning</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ASSIGN BED MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 max-w-md w-full space-y-4 shadow-2xl text-zinc-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Assign Inpatient to Bed</h3>
                <p className="text-xs text-zinc-500">
                  Unit: {showAssignModal.wardName} — Bed: <strong className="font-mono text-teal-400">{showAssignModal.bedNumber}</strong>
                </p>
              </div>
              <button onClick={() => setShowAssignModal(null)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignBedSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1.5 font-semibold">Select Admitted Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-medium focus:outline-none focus:border-teal-500/50"
                  required
                >
                  <option value="">-- Select Patient Record --</option>
                  {unassignedPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn}) — {p.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(null)}
                  className="px-4 py-2 text-zinc-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-5 py-2 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Confirm Bed Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
