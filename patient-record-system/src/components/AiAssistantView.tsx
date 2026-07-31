import React, { useState } from 'react';
import { Sparkles, FileText, AlertTriangle, Pill, LogOut, ShieldCheck, CheckCircle2, RefreshCw, Bot } from 'lucide-react';
import { Patient } from '../types';

interface AiAssistantViewProps {
  patients: Patient[];
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ patients }) => {
  const [activeTool, setActiveTool] = useState<'triage' | 'notes' | 'pharmacy' | 'discharge'>('triage');

  // Tool 1: Triage Assistant State
  const [triagePatientId, setTriagePatientId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('Substernal chest tightness radiating to left arm with diaphoresis');
  const [hr, setHr] = useState('110');
  const [sysBp, setSysBp] = useState('155');
  const [diaBp, setDiaBp] = useState('95');
  const [temp, setTemp] = useState('99.0');
  const [spo2, setSpo2] = useState('94');
  const [loadingTriage, setLoadingTriage] = useState(false);
  const [triageResult, setTriageResult] = useState('');

  // Tool 2: Notes Summarizer State
  const [rawNoteText, setRawNoteText] = useState(
    'Patient admitted with severe shortness of breath and fever. Auscultation reveals bilateral crepitations. ABG shows mild hypoxemia. Started on supplemental oxygen and IV broad-spectrum antibiotics. Blood cultures drawn.'
  );
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesSummaryResult, setNotesSummaryResult] = useState('');

  // Tool 3: Drug Interaction State
  const [proposedDrug, setProposedDrug] = useState('Warfarin 5mg');
  const [existingMeds, setExistingMeds] = useState('Aspirin 81mg, Clopidogrel 75mg');
  const [knownAllergies, setKnownAllergies] = useState('Penicillin');
  const [loadingDrugCheck, setLoadingDrugCheck] = useState(false);
  const [drugCheckResult, setDrugCheckResult] = useState('');

  // Tool 4: Discharge Doc State
  const [dischargePatientName, setDischargePatientName] = useState('Eleanor Vance');
  const [dischargeDiagnosis, setDischargeDiagnosis] = useState('Acute STEMI post primary PCI with drug-eluting stent');
  const [loadingDischarge, setLoadingDischarge] = useState(false);
  const [dischargeDocResult, setDischargeDocResult] = useState('');

  // Call API 1: Triage
  const handleRunTriage = async () => {
    if (!chiefComplaint) return;
    setLoadingTriage(true);
    try {
      const selectedP = patients.find((p) => p.id === triagePatientId);
      const res = await fetch('/api/ai/triage-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chiefComplaint,
          patientAge: selectedP?.age || 55,
          patientGender: selectedP?.gender || 'Male',
          preExisting: selectedP?.chronicConditions.join(', ') || 'Hypertension',
          vitals: { heartRate: hr, bloodPressure: `${sysBp}/${diaBp}`, temp, spo2 },
        }),
      });
      const data = await res.json();
      if (data.triageAnalysis) setTriageResult(data.triageAnalysis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTriage(false);
    }
  };

  // Call API 2: Notes Summarizer
  const handleRunNoteSummarizer = async () => {
    if (!rawNoteText) return;
    setLoadingNotes(true);
    try {
      const res = await fetch('/api/ai/summarize-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Clinical Patient',
          notesText: rawNoteText,
        }),
      });
      const data = await res.json();
      if (data.summary) setNotesSummaryResult(data.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Call API 3: Drug Interaction
  const handleRunDrugCheck = async () => {
    if (!proposedDrug) return;
    setLoadingDrugCheck(true);
    try {
      const res = await fetch('/api/ai/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newMedication: proposedDrug,
          existingMedications: existingMeds.split(','),
          knownAllergies: knownAllergies.split(','),
        }),
      });
      const data = await res.json();
      if (data.safetyAnalysis) setDrugCheckResult(data.safetyAnalysis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDrugCheck(false);
    }
  };

  // Call API 4: Discharge Summary
  const handleRunDischargeGen = async () => {
    setLoadingDischarge(true);
    try {
      const res = await fetch('/api/ai/discharge-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: dischargePatientName,
          age: 64,
          gender: 'Female',
          diagnosis: dischargeDiagnosis,
          admissionDate: '2026-07-19',
          dischargeDate: '2026-07-21',
          prescriptions: [
            { name: 'Ticagrelor', dosage: '90mg', frequency: 'Twice daily' },
            { name: 'Atorvastatin', dosage: '80mg', frequency: 'Bedtime' },
          ],
        }),
      });
      const data = await res.json();
      if (data.dischargeDocument) setDischargeDocResult(data.dischargeDocument);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDischarge(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" /> AI Clinical Decision Support Hub
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Gemini AI assistant for ER triage, clinical note summarization, drug interactions, and discharge documentation
          </p>
        </div>
      </div>

      {/* Tool Switcher Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'triage', label: '1. ER Symptom Triage', icon: <AlertTriangle className="w-4 h-4 text-rose-400" /> },
          { id: 'notes', label: '2. SOAP Note Summarizer', icon: <FileText className="w-4 h-4 text-teal-400" /> },
          { id: 'pharmacy', label: '3. Drug Interaction Check', icon: <Pill className="w-4 h-4 text-emerald-400" /> },
          { id: 'discharge', label: '4. Discharge Generator', icon: <LogOut className="w-4 h-4 text-amber-400" /> },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as any)}
            className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTool === tool.id
                ? 'bg-zinc-900 border-teal-500 text-teal-400 shadow-md ring-1 ring-teal-500/30'
                : 'bg-[#121216] border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            {tool.icon}
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* TOOL 1: ER TRIAGE */}
      {activeTool === 'triage' && (
        <div className="bg-[#121216] rounded-2xl p-6 border border-zinc-800 shadow-sm space-y-5">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Emergency Triage & Diagnostic Risk Assister
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Select Patient Record (Optional)</label>
              <select
                value={triagePatientId}
                onChange={(e) => setTriagePatientId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-medium focus:outline-none focus:border-teal-500/50"
              >
                <option value="">-- Custom Intake --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.age}y {p.gender})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Chief Complaint & Present Symptoms *</label>
              <textarea
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-medium focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">HR (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Systolic BP</label>
                <input
                  type="number"
                  value={sysBp}
                  onChange={(e) => setSysBp(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Diastolic BP</label>
                <input
                  type="number"
                  value={diaBp}
                  onChange={(e) => setDiaBp(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
                />
              </div>
            </div>

            <button
              onClick={handleRunTriage}
              disabled={loadingTriage}
              className="bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-rose-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {loadingTriage ? 'Evaluating Triage Risk with Gemini AI...' : 'Evaluate Triage Priority & Orders'}
            </button>
          </div>

          {triageResult && (
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-2 text-xs leading-relaxed text-zinc-200">
              <h4 className="font-bold text-sm text-rose-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> AI Emergency Triage Assessment:
              </h4>
              <div className="whitespace-pre-line bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-200 font-medium leading-relaxed">
                {triageResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 2: SOAP NOTES SUMMARIZER */}
      {activeTool === 'notes' && (
        <div className="bg-[#121216] rounded-2xl p-6 border border-zinc-800 shadow-sm space-y-5">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-400" /> Clinical Progress Note Handover Summarizer
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Paste Raw Clinical / Consultation Notes *</label>
              <textarea
                rows={5}
                value={rawNoteText}
                onChange={(e) => setRawNoteText(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-100 font-medium focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <button
              onClick={handleRunNoteSummarizer}
              disabled={loadingNotes}
              className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-teal-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {loadingNotes ? 'Generating Handover Summary...' : 'Summarize for Doctor Shift Handover'}
            </button>
          </div>

          {notesSummaryResult && (
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-2 text-xs leading-relaxed text-zinc-200">
              <h4 className="font-bold text-sm text-teal-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Structured Shift Handover Summary:
              </h4>
              <div className="whitespace-pre-line bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-200 font-medium leading-relaxed">
                {notesSummaryResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 3: DRUG INTERACTION CHECK */}
      {activeTool === 'pharmacy' && (
        <div className="bg-[#121216] rounded-2xl p-6 border border-zinc-800 shadow-sm space-y-5">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-400" /> Multi-Drug Interaction & Allergy Safety Evaluator
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Proposed New Drug *</label>
              <input
                type="text"
                value={proposedDrug}
                onChange={(e) => setProposedDrug(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Existing Active Medications (Comma separated)</label>
              <input
                type="text"
                value={existingMeds}
                onChange={(e) => setExistingMeds(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Known Drug Allergies</label>
              <input
                type="text"
                value={knownAllergies}
                onChange={(e) => setKnownAllergies(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <button
              onClick={handleRunDrugCheck}
              disabled={loadingDrugCheck}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {loadingDrugCheck ? 'Checking Safety with Gemini AI...' : 'Run Pharmacological Safety Check'}
            </button>
          </div>

          {drugCheckResult && (
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-2 text-xs leading-relaxed text-zinc-200">
              <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> AI Pharmacological Safety Report:
              </h4>
              <div className="whitespace-pre-line bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-200 font-medium leading-relaxed">
                {drugCheckResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: DISCHARGE SUMMARY */}
      {activeTool === 'discharge' && (
        <div className="bg-[#121216] rounded-2xl p-6 border border-zinc-800 shadow-sm space-y-5">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <LogOut className="w-4 h-4 text-amber-400" /> Patient-Friendly Discharge Document Generator
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Patient Name *</label>
              <input
                type="text"
                value={dischargePatientName}
                onChange={(e) => setDischargePatientName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Primary Discharge Diagnosis *</label>
              <input
                type="text"
                value={dischargeDiagnosis}
                onChange={(e) => setDischargeDiagnosis(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <button
              onClick={handleRunDischargeGen}
              disabled={loadingDischarge}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {loadingDischarge ? 'Drafting Discharge Document...' : 'Generate Discharge Document'}
            </button>
          </div>

          {dischargeDocResult && (
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-2 text-xs leading-relaxed text-zinc-200">
              <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Generated Hospital Discharge Summary:
              </h4>
              <div className="whitespace-pre-line bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-200 font-medium leading-relaxed">
                {dischargeDocResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
