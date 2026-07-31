import React, { useState } from 'react';
import { Pill, Plus, AlertTriangle, Sparkles, ShieldCheck, Search, CheckCircle2, X, Package } from 'lucide-react';
import { Prescription, Patient, Doctor } from '../types';

interface PharmacyViewProps {
  prescriptions: Prescription[];
  patients: Patient[];
  doctors: Doctor[];
  onAddPrescription: (rx: Prescription) => void;
}

interface MedicationStock {
  name: string;
  category: string;
  dosage: string;
  stock: number;
  unit: string;
  warningStock: number;
}

const INITIAL_MEDICATIONS: MedicationStock[] = [
  { name: 'Ticagrelor (Brilinta)', category: 'Antiplatelet', dosage: '90 mg', stock: 450, unit: 'tablets', warningStock: 100 },
  { name: 'Atorvastatin', category: 'Statin', dosage: '80 mg', stock: 820, unit: 'tablets', warningStock: 150 },
  { name: 'Regular Insulin (Humulin R)', category: 'Antidiabetic', dosage: '100 U/mL', stock: 24, unit: 'vials', warningStock: 30 },
  { name: 'Albuterol Nebulizer', category: 'Bronchodilator', dosage: '2.5 mg/3mL', stock: 120, unit: 'amps', warningStock: 50 },
  { name: 'Amoxicillin / Clavulanate', category: 'Antibiotic', dosage: '875 mg', stock: 320, unit: 'tablets', warningStock: 100 },
  { name: 'Heparin Sodium', category: 'Anticoagulant', dosage: '5000 U/mL', stock: 42, unit: 'vials', warningStock: 25 },
  { name: 'Metformin', category: 'Antidiabetic', dosage: '500 mg', stock: 1100, unit: 'tablets', warningStock: 200 },
  { name: 'Lisinopril', category: 'ACE Inhibitor', dosage: '10 mg', stock: 680, unit: 'tablets', warningStock: 100 },
];

export const PharmacyView: React.FC<PharmacyViewProps> = ({
  prescriptions,
  patients,
  doctors,
  onAddPrescription,
}) => {
  const [showAddRxModal, setShowAddRxModal] = useState(false);
  const [rxSearch, setRxSearch] = useState('');

  // New Rx State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.name || '');
  const [medicationName, setMedicationName] = useState('Ticagrelor (Brilinta)');
  const [dosage, setDosage] = useState('90 mg');
  const [frequency, setFrequency] = useState('Twice daily');
  const [route, setRoute] = useState('Oral');
  const [instructions, setInstructions] = useState('Take with or without food');
  const [isEvaluatingAi, setIsEvaluatingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Check Allergy Warning
  const allergyWarning =
    selectedPatient && medicationName
      ? selectedPatient.allergies.find((a) => medicationName.toLowerCase().includes(a.toLowerCase()))
      : null;

  // AI Safety Analysis Call
  const handleRunAiSafetyCheck = async () => {
    if (!medicationName || !selectedPatient) return;

    setIsEvaluatingAi(true);
    try {
      const res = await fetch('/api/ai/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newMedication: `${medicationName} ${dosage}`,
          existingMedications: prescriptions.filter((p) => p.patientId === selectedPatient.id).map((p) => p.medicationName),
          knownAllergies: selectedPatient.allergies,
          chronicConditions: selectedPatient.chronicConditions.join(', '),
        }),
      });
      const data = await res.json();
      if (data.safetyAnalysis) {
        setAiAnalysis(data.safetyAnalysis);
      }
    } catch (err) {
      console.error('AI check error:', err);
    } finally {
      setIsEvaluatingAi(false);
    }
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newRx: Prescription = {
      id: `RX-${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      doctorName: selectedDoctor,
      date: new Date().toISOString().split('T')[0],
      medicationName,
      dosage,
      frequency,
      route,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Active',
      instructions,
      refillsRemaining: 3,
      allergyWarning: allergyWarning ? `Patient allergic to ${allergyWarning}` : undefined,
    };

    onAddPrescription(newRx);
    setShowAddRxModal(false);
    setAiAnalysis('');
  };

  const filteredRx = prescriptions.filter(
    (p) =>
      !rxSearch ||
      p.medicationName.toLowerCase().includes(rxSearch.toLowerCase()) ||
      p.patientName?.toLowerCase().includes(rxSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-400" /> Pharmacy & E-Prescription System
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Pharmaceutical stock monitoring and AI interaction safety checks
          </p>
        </div>

        <button
          onClick={() => setShowAddRxModal(true)}
          className="bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-teal-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Issue E-Prescription
        </button>
      </div>

      {/* Hospital Stock Inventory Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-teal-400" /> Hospital Pharmacy Stock Inventory
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {INITIAL_MEDICATIONS.map((med, idx) => {
            const isLow = med.stock <= med.warningStock;
            return (
              <div
                key={idx}
                className={`bg-[#121216] rounded-xl p-3 border transition-all shadow-sm ${
                  isLow ? 'bg-amber-500/10 border-amber-500/30' : 'border-zinc-800'
                }`}
              >
                <p className="text-xs font-bold text-white truncate">{med.name}</p>
                <p className="text-[10px] text-zinc-500 font-medium">{med.dosage}</p>
                <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-zinc-800">
                  <span className={`text-base font-extrabold font-mono ${isLow ? 'text-amber-400' : 'text-teal-400'}`}>
                    {med.stock}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">{med.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Prescriptions Registry */}
      <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-zinc-800 pb-3">
          <h3 className="font-bold text-white text-sm">Active Patient E-Prescriptions</h3>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={rxSearch}
              onChange={(e) => setRxSearch(e.target.value)}
              placeholder="Search drug or patient name..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-teal-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRx.map((rx) => (
            <div key={rx.id} className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800 space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{rx.medicationName}</h4>
                  <p className="text-xs text-teal-400 font-bold mt-0.5">{rx.patientName}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {rx.status}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <p>
                  <span className="text-zinc-500 font-medium">Dosage:</span> <strong className="text-white">{rx.dosage}</strong> ({rx.frequency})
                </p>
                <p>
                  <span className="text-zinc-500 font-medium">Instructions:</span> {rx.instructions}
                </p>
                <p className="text-zinc-500">
                  Prescribed by: <span className="font-semibold text-zinc-200">{rx.doctorName}</span>
                </p>
              </div>

              {rx.allergyWarning && (
                <p className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {rx.allergyWarning}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ISSUE E-PRESCRIPTION MODAL */}
      {showAddRxModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 max-w-lg w-full space-y-4 shadow-2xl text-zinc-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-400" /> Issue E-Prescription Order
              </h3>
              <button onClick={() => setShowAddRxModal(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Select Patient *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
                  required
                >
                  <option value="">-- Select Patient Record --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Allergy Warning Badge */}
              {selectedPatient && selectedPatient.allergies.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-rose-300">
                  <p className="font-bold flex items-center gap-1.5 text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Patient Allergy Alert:
                  </p>
                  <p className="text-[11px] mt-0.5 font-semibold text-rose-300">{selectedPatient.allergies.join(', ')}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Medication Name *</label>
                  <input
                    type="text"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Dosage *</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Frequency *</label>
                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Administration Route</label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                  >
                    <option value="Oral">Oral</option>
                    <option value="IV Continuous">IV Continuous</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Subcutaneous">Subcutaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Special Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              {/* AI Drug Interaction Check Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleRunAiSafetyCheck}
                  disabled={isEvaluatingAi || !selectedPatient}
                  className="w-full bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {isEvaluatingAi ? 'Evaluating Drug Safety with Gemini AI...' : 'Run Gemini AI Drug Safety & Allergy Check'}
                </button>
              </div>

              {aiAnalysis && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-amber-200 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-400">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> AI Pharmacologist Interaction Report:
                  </p>
                  <p className="whitespace-pre-line leading-relaxed">{aiAnalysis}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddRxModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Issue E-Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
