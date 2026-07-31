import React, { useState } from 'react';
import {
  X,
  User,
  HeartPulse,
  FileText,
  Pill,
  TestTube,
  Receipt,
  LogOut,
  Plus,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Phone,
  Mail,
  Home,
  Download,
  Activity,
} from 'lucide-react';
import {
  Patient,
  VitalRecord,
  ClinicalNote,
  Prescription,
  LabReport,
  Invoice,
} from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PatientProfileModalProps {
  patient: Patient;
  vitals: VitalRecord[];
  notes: ClinicalNote[];
  prescriptions: Prescription[];
  labReports: LabReport[];
  invoices: Invoice[];
  onClose: () => void;
  onAddVital: (vital: VitalRecord) => void;
  onAddNote: (note: ClinicalNote) => void;
  onAddPrescription: (rx: Prescription) => void;
  onUpdatePatient: (updated: Patient) => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  patient,
  vitals,
  notes,
  prescriptions,
  labReports,
  invoices,
  onClose,
  onAddVital,
  onAddNote,
  onAddPrescription,
  onUpdatePatient,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'vitals' | 'notes' | 'prescriptions' | 'labs' | 'billing' | 'discharge'
  >('overview');

  // Filter items for this patient
  const patientVitals = vitals
    .filter((v) => v.patientId === patient.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const patientNotes = notes.filter((n) => n.patientId === patient.id);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patient.id);
  const patientLabs = labReports.filter((l) => l.patientId === patient.id);
  const patientInvoices = invoices.filter((i) => i.patientId === patient.id);

  // New Vital Form State
  const [showAddVital, setShowAddVital] = useState(false);
  const [newHr, setNewHr] = useState('80');
  const [newSys, setNewSys] = useState('120');
  const [newDia, setNewDia] = useState('80');
  const [newTemp, setNewTemp] = useState('98.6');
  const [newSpo2, setNewSpo2] = useState('98');
  const [newRr, setNewRr] = useState('16');
  const [newPain, setNewPain] = useState('2');

  // New Note Form State
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteSubjective, setNoteSubjective] = useState('');
  const [noteObjective, setNoteObjective] = useState('');
  const [noteAssessment, setNoteAssessment] = useState('');
  const [notePlan, setNotePlan] = useState('');
  const [isSummarizingNote, setIsSummarizingNote] = useState(false);
  const [generatedNoteSummary, setGeneratedNoteSummary] = useState('');

  // AI Discharge Summary State
  const [isGeneratingDischarge, setIsGeneratingDischarge] = useState(false);
  const [dischargeDoc, setDischargeDoc] = useState('');

  // Selected Lab Detail State
  const [selectedLab, setSelectedLab] = useState<LabReport | null>(null);

  // Handle Vital Submission
  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault();
    const hr = parseInt(newHr) || 80;
    const sys = parseInt(newSys) || 120;
    const dia = parseInt(newDia) || 80;
    const temp = parseFloat(newTemp) || 98.6;
    const spo2 = parseInt(newSpo2) || 98;

    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (sys > 160 || hr > 120 || spo2 < 92 || temp > 102) {
      status = 'critical';
    } else if (sys > 140 || hr > 100 || spo2 < 95 || temp > 100.4) {
      status = 'warning';
    }

    const newRecord: VitalRecord = {
      id: `VIT-${Date.now()}`,
      patientId: patient.id,
      timestamp: new Date().toISOString(),
      heartRate: hr,
      bloodPressureSystolic: sys,
      bloodPressureDiastolic: dia,
      temperature: temp,
      spo2: spo2,
      respiratoryRate: parseInt(newRr) || 16,
      painScale: parseInt(newPain) || 0,
      weightKg: 70,
      heightCm: 170,
      recordedBy: 'Attending Staff, RN',
      status,
    };

    onAddVital(newRecord);
    setShowAddVital(false);
  };

  // Handle AI Note Summarize
  const handleSummarizeClinicalNote = async () => {
    const fullText = `Subjective: ${noteSubjective}\nObjective: ${noteObjective}\nAssessment: ${noteAssessment}\nPlan: ${notePlan}`;
    if (!fullText.trim()) return;

    setIsSummarizingNote(true);
    try {
      const res = await fetch('/api/ai/summarize-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: `${patient.firstName} ${patient.lastName}`,
          age: patient.age,
          gender: patient.gender,
          notesText: fullText,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setGeneratedNoteSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsSummarizingNote(false);
    }
  };

  // Save Clinical Note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: ClinicalNote = {
      id: `NOTE-${Date.now()}`,
      patientId: patient.id,
      authorDoctor: patient.primaryPhysician,
      doctorRole: 'Attending Physician',
      date: new Date().toISOString(),
      category: 'SOAP',
      subjective: noteSubjective,
      objective: noteObjective,
      assessment: noteAssessment,
      plan: notePlan,
      aiSummary: generatedNoteSummary || undefined,
    };

    onAddNote(newNote);
    setShowAddNote(false);
    setNoteSubjective('');
    setNoteObjective('');
    setNoteAssessment('');
    setNotePlan('');
    setGeneratedNoteSummary('');
  };

  // Generate AI Discharge Document
  const handleGenerateDischarge = async () => {
    setIsGeneratingDischarge(true);
    try {
      const res = await fetch('/api/ai/discharge-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: `${patient.firstName} ${patient.lastName}`,
          age: patient.age,
          gender: patient.gender,
          diagnosis: patient.department + ' condition',
          admissionDate: new Date(patient.admissionDate).toLocaleDateString(),
          dischargeDate: new Date().toLocaleDateString(),
          prescriptions: patientPrescriptions.map((p) => ({
            name: p.medicationName,
            dosage: p.dosage,
            frequency: p.frequency,
          })),
          followUpInstructions: 'Follow up in 2 weeks at Outpatient Clinic.',
        }),
      });
      const data = await res.json();
      if (data.dischargeDocument) {
        setDischargeDoc(data.dischargeDocument);
      }
    } catch (err) {
      console.error('Discharge summary error:', err);
    } finally {
      setIsGeneratingDischarge(false);
    }
  };

  const latestVital = patientVitals[patientVitals.length - 1];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#121216] border border-zinc-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-200 animate-scaleUp">
        {/* Header Bar */}
        <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center font-bold text-lg text-zinc-950 shadow-md">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  {patient.firstName} {patient.lastName}
                </h2>
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-0.5 rounded-md font-mono font-bold">
                  {patient.mrn}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    patient.triageCategory === 'emergency'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                      : patient.triageCategory === 'urgent'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {patient.triageCategory.toUpperCase()} TRIAGE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                {patient.age} yrs • {patient.gender} • Blood Group: <span className="font-bold text-white">{patient.bloodGroup}</span> • Status:{' '}
                <span className="text-teal-400 font-bold">{patient.admissionStatus}</span> (
                {patient.wardRoomBed})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-zinc-900/60 border-b border-zinc-800 px-6 flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview & Bio', icon: <User className="w-4 h-4" /> },
            { id: 'vitals', label: `Vitals (${patientVitals.length})`, icon: <HeartPulse className="w-4 h-4" /> },
            { id: 'notes', label: `SOAP Notes (${patientNotes.length})`, icon: <FileText className="w-4 h-4" /> },
            { id: 'prescriptions', label: `Prescriptions (${patientPrescriptions.length})`, icon: <Pill className="w-4 h-4" /> },
            { id: 'labs', label: `Lab Tests (${patientLabs.length})`, icon: <TestTube className="w-4 h-4" /> },
            { id: 'billing', label: `Billing (${patientInvoices.length})`, icon: <Receipt className="w-4 h-4" /> },
            { id: 'discharge', label: 'Discharge Summary', icon: <LogOut className="w-4 h-4 text-emerald-400" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-400 bg-[#121216]'
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & BIO */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Demographics Card */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-400" /> Demographics & Contact
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500 font-medium">Date of Birth:</span>
                    <span className="font-semibold text-zinc-200">{patient.dob}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500 font-medium">Phone:</span>
                    <span className="font-semibold text-zinc-200 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-500" /> {patient.phone}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500 font-medium">Email:</span>
                    <span className="font-semibold text-zinc-200 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-zinc-500" /> {patient.email}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500 font-medium">Address:</span>
                    <span className="font-semibold text-zinc-200 flex items-center gap-1">
                      <Home className="w-3 h-3 text-zinc-500" /> {patient.address}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-zinc-500 font-medium block mb-1">Emergency Contact:</span>
                    <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                      <p className="font-bold text-white">{patient.emergencyContact.name}</p>
                      <p className="text-zinc-400 font-medium">
                        {patient.emergencyContact.relationship} • {patient.emergencyContact.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance & Physician */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Admission & Coverage
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500 font-medium">Primary Physician:</span>
                    <span className="font-bold text-teal-400">{patient.primaryPhysician}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500 font-medium">Department:</span>
                    <span className="font-semibold text-zinc-200">{patient.department}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500 font-medium">Room & Bed:</span>
                    <span className="font-semibold text-zinc-200">{patient.wardRoomBed}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500 font-medium">Admission Date:</span>
                    <span className="font-semibold text-zinc-200">
                      {new Date(patient.admissionDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-500 font-medium">Insurance Provider:</span>
                    <span className="font-bold text-emerald-400">{patient.insuranceProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Policy Number:</span>
                    <span className="font-mono text-zinc-300 font-semibold">{patient.insurancePolicyNumber}</span>
                  </div>
                </div>
              </div>

              {/* Allergy & Medical Alerts */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Medical Alerts & History
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 font-medium block mb-1.5">Known Drug Allergies:</span>
                    {patient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {patient.allergies.map((allergy, i) => (
                          <span
                            key={i}
                            className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold text-[11px]"
                          >
                            ⚠️ {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-500 italic">No known drug allergies reported.</span>
                    )}
                  </div>

                  <div>
                    <span className="text-zinc-500 font-medium block mb-1">Chronic Conditions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.chronicConditions.map((cond, i) => (
                        <span key={i} className="bg-zinc-950 border border-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-lg font-semibold">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-medium block mb-1">Pre-Existing History:</span>
                    <p className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-zinc-200 leading-relaxed font-medium">
                      {patient.preExistingHistory || 'None documented.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VITALS & CHARTS */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-400" /> Vitals Monitoring & Trends
                  </h3>
                  <p className="text-xs text-zinc-500">Historical physiological parameter logs</p>
                </div>
                <button
                  onClick={() => setShowAddVital(true)}
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" /> Record New Vitals
                </button>
              </div>

              {/* Latest Vital Summary Cards */}
              {latestVital && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
                    <p className="text-[11px] text-zinc-500 font-semibold">Heart Rate</p>
                    <p className="text-xl font-extrabold text-rose-400 mt-1">
                      {latestVital.heartRate} <span className="text-xs text-zinc-500 font-normal">bpm</span>
                    </p>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
                    <p className="text-[11px] text-zinc-500 font-semibold">Blood Pressure</p>
                    <p className="text-xl font-extrabold text-teal-400 mt-1">
                      {latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic}{' '}
                      <span className="text-xs text-zinc-500 font-normal">mmHg</span>
                    </p>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
                    <p className="text-[11px] text-zinc-500 font-semibold">Temperature</p>
                    <p className="text-xl font-extrabold text-amber-400 mt-1">
                      {latestVital.temperature} <span className="text-xs text-zinc-500 font-normal">°F</span>
                    </p>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
                    <p className="text-[11px] text-zinc-500 font-semibold">Oxygen (SpO2)</p>
                    <p className="text-xl font-extrabold text-emerald-400 mt-1">
                      {latestVital.spo2}%
                    </p>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
                    <p className="text-[11px] text-zinc-500 font-semibold">Resp. Rate</p>
                    <p className="text-xl font-extrabold text-purple-400 mt-1">
                      {latestVital.respiratoryRate} <span className="text-xs text-zinc-500 font-normal">/min</span>
                    </p>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
                    <p className="text-[11px] text-zinc-500 font-semibold">Pain Score</p>
                    <p className="text-xl font-extrabold text-rose-400 mt-1">
                      {latestVital.painScale}/10
                    </p>
                  </div>
                </div>
              )}

              {/* Recharts Timeline */}
              {patientVitals.length > 0 ? (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400">Heart Rate & Systolic BP Timeline</h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={patientVitals.map((v) => ({
                          time: new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          HR: v.heartRate,
                          SystolicBP: v.bloodPressureSystolic,
                          SpO2: v.spo2,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="time" stroke="#71717a" fontSize={11} />
                        <YAxis stroke="#71717a" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', borderRadius: '12px', color: '#f4f4f5' }}
                        />
                        <Line type="monotone" dataKey="HR" stroke="#f43f5e" strokeWidth={2.5} name="Heart Rate (bpm)" />
                        <Line type="monotone" dataKey="SystolicBP" stroke="#14b8a6" strokeWidth={2.5} name="Systolic BP (mmHg)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No vitals logged yet.</p>
              )}

              {/* Add Vitals Form */}
              {showAddVital && (
                <form
                  onSubmit={handleSaveVital}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-lg"
                >
                  <h4 className="text-sm font-bold text-white">Log Patient Vitals</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Heart Rate (bpm)</label>
                      <input
                        type="number"
                        value={newHr}
                        onChange={(e) => setNewHr(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Systolic BP (mmHg)</label>
                      <input
                        type="number"
                        value={newSys}
                        onChange={(e) => setNewSys(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Diastolic BP (mmHg)</label>
                      <input
                        type="number"
                        value={newDia}
                        onChange={(e) => setNewDia(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Temperature (°F)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newTemp}
                        onChange={(e) => setNewTemp(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">SpO2 (%)</label>
                      <input
                        type="number"
                        value={newSpo2}
                        onChange={(e) => setNewSpo2(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Resp Rate (/min)</label>
                      <input
                        type="number"
                        value={newRr}
                        onChange={(e) => setNewRr(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">Pain Scale (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={newPain}
                        onChange={(e) => setNewPain(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowAddVital(false)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-4 py-1.5 rounded-xl cursor-pointer shadow-sm"
                    >
                      Save Vitals Entry
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SOAP CLINICAL NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-400" /> Clinical SOAP Notes
                  </h3>
                  <p className="text-xs text-zinc-500">Doctor consultations & progress reports</p>
                </div>
                <button
                  onClick={() => setShowAddNote(true)}
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" /> Add SOAP Note
                </button>
              </div>

              {/* Add Note Form */}
              {showAddNote && (
                <form
                  onSubmit={handleSaveNote}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-lg"
                >
                  <h4 className="text-sm font-bold text-white">New Clinical Progress Note (SOAP)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">S - Subjective (Patient Complaints)</label>
                      <textarea
                        rows={3}
                        value={noteSubjective}
                        onChange={(e) => setNoteSubjective(e.target.value)}
                        placeholder="e.g. Patient reports sharp retrosternal chest pain..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">O - Objective (Vitals, Exam & Labs)</label>
                      <textarea
                        rows={3}
                        value={noteObjective}
                        onChange={(e) => setNoteObjective(e.target.value)}
                        placeholder="e.g. BP 150/90, Troponin elevated at 4.2..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">A - Assessment (Diagnosis & Risk)</label>
                      <textarea
                        rows={3}
                        value={noteAssessment}
                        onChange={(e) => setNoteAssessment(e.target.value)}
                        placeholder="e.g. Acute STEMI, high risk..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 font-semibold">P - Plan (Therapy & Orders)</label>
                      <textarea
                        rows={3}
                        value={notePlan}
                        onChange={(e) => setNotePlan(e.target.value)}
                        placeholder="e.g. STAT Cath Lab transfer, IV Heparin..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Gemini AI Summarizer button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleSummarizeClinicalNote}
                      disabled={isSummarizingNote}
                      className="bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {isSummarizingNote ? 'Summarizing with Gemini AI...' : 'Summarize Note with Gemini AI'}
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddNote(false)}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-4 py-1.5 rounded-xl cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  {generatedNoteSummary && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300 space-y-1">
                      <p className="font-bold flex items-center gap-1 text-amber-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Clinical Summary Draft:
                      </p>
                      <p className="whitespace-pre-line leading-relaxed">{generatedNoteSummary}</p>
                    </div>
                  )}
                </form>
              )}

              {/* Note Timeline List */}
              <div className="space-y-4">
                {patientNotes.map((note) => (
                  <div key={note.id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{note.authorDoctor}</h4>
                        <p className="text-xs text-zinc-500">
                          {note.doctorRole} • {new Date(note.date).toLocaleString()}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
                        {note.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <span className="font-bold text-teal-400 block mb-1">Subjective (S):</span>
                        <p className="text-zinc-200 leading-relaxed font-medium">{note.subjective}</p>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <span className="font-bold text-teal-400 block mb-1">Objective (O):</span>
                        <p className="text-zinc-200 leading-relaxed font-medium">{note.objective}</p>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <span className="font-bold text-teal-400 block mb-1">Assessment (A):</span>
                        <p className="text-zinc-200 leading-relaxed font-medium">{note.assessment}</p>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <span className="font-bold text-teal-400 block mb-1">Plan (P):</span>
                        <p className="text-zinc-200 leading-relaxed font-medium">{note.plan}</p>
                      </div>
                    </div>

                    {note.aiSummary && (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-300">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Shift Handover Summary
                        </span>
                        <p className="whitespace-pre-line leading-relaxed text-amber-200 font-medium">{note.aiSummary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Pill className="w-5 h-5 text-teal-400" /> Medication & E-Prescriptions
                  </h3>
                  <p className="text-xs text-zinc-500">Active and past prescribed pharmaceuticals</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patientPrescriptions.map((rx) => (
                  <div key={rx.id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{rx.medicationName}</h4>
                        <p className="text-xs text-teal-400 font-bold mt-0.5">
                          Dosage: {rx.dosage} • {rx.frequency}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rx.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {rx.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-zinc-300 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                      <p>
                        <span className="text-zinc-500 font-medium">Route:</span> {rx.route}
                      </p>
                      <p>
                        <span className="text-zinc-500 font-medium">Prescribing Doctor:</span> {rx.doctorName}
                      </p>
                      <p>
                        <span className="text-zinc-500 font-medium">Instructions:</span> {rx.instructions}
                      </p>
                      <p>
                        <span className="text-zinc-500 font-medium">Period:</span> {rx.startDate} to {rx.endDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LABS & DIAGNOSTICS */}
          {activeTab === 'labs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-teal-400" /> Diagnostic & Laboratory Reports
                  </h3>
                  <p className="text-xs text-zinc-500">Pathology, radiology, and biochemistry results</p>
                </div>
              </div>

              <div className="space-y-4">
                {patientLabs.map((lab) => (
                  <div key={lab.id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{lab.testName}</h4>
                        <p className="text-xs text-zinc-500">
                          Category: {lab.category} • Ordered: {new Date(lab.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            lab.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {lab.status}
                        </span>
                        <button
                          onClick={() => setSelectedLab(lab)}
                          className="bg-zinc-950 hover:bg-zinc-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-800 transition-colors text-teal-400 cursor-pointer"
                        >
                          View Parameters
                        </button>
                      </div>
                    </div>

                    {lab.resultsSummary && (
                      <p className="text-xs text-zinc-300 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 leading-relaxed font-medium">
                        <span className="font-bold text-white">Lab Summary:</span> {lab.resultsSummary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BILLING & INVOICES */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-teal-400" /> Patient Invoices & Claims
                  </h3>
                  <p className="text-xs text-zinc-500">Hospital fee breakdown and insurance status</p>
                </div>
              </div>

              {patientInvoices.map((inv) => (
                <div key={inv.id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{inv.invoiceNumber}</h4>
                      <p className="text-xs text-zinc-500">
                        Date: {inv.date} • Due: {inv.dueDate}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-800 text-xs">
                    {inv.items.map((item) => (
                      <div key={item.id} className="py-2 flex justify-between">
                        <div>
                          <p className="font-semibold text-zinc-200">{item.description}</p>
                          <p className="text-[11px] text-zinc-500">{item.category}</p>
                        </div>
                        <span className="font-mono text-white font-bold">${item.cost.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 flex flex-wrap justify-between text-xs gap-3 font-semibold">
                    <div>
                      <span className="text-zinc-500">Total Charges:</span>{' '}
                      <span className="text-white font-mono font-bold">${inv.totalAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Insurance Covered:</span>{' '}
                      <span className="text-emerald-400 font-mono font-bold">${inv.insuranceCovered.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Patient Payable:</span>{' '}
                      <span className="text-teal-400 font-mono font-bold">${inv.patientPayable.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: DISCHARGE SUMMARY */}
          {activeTab === 'discharge' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <LogOut className="w-5 h-5 text-emerald-400" /> Patient Discharge Summary & Instructions
                  </h3>
                  <p className="text-xs text-zinc-500">Formal discharge documentation & home care guide</p>
                </div>

                <button
                  onClick={handleGenerateDischarge}
                  disabled={isGeneratingDischarge}
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-teal-500/20 disabled:opacity-50 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  {isGeneratingDischarge ? 'Generating with Gemini AI...' : 'Generate AI Discharge Document'}
                </button>
              </div>

              {dischargeDoc ? (
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-4 font-sans text-xs leading-relaxed text-zinc-200">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Official Discharge Document
                    </h4>
                    <button
                      onClick={() => alert('Discharge summary downloaded as PDF.')}
                      className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </div>
                  <div className="whitespace-pre-line bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-200 font-medium leading-relaxed">
                    {dischargeDoc}
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 text-center space-y-3">
                  <LogOut className="w-10 h-10 text-zinc-500 mx-auto" />
                  <p className="text-sm font-bold text-white">No Discharge Document Generated Yet</p>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    Click "Generate AI Discharge Document" above to auto-create formal patient discharge instructions, home medication guides, and follow-up warnings using Gemini AI.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lab Results Detail Modal Popover */}
        {selectedLab && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 max-w-xl w-full space-y-4 shadow-2xl text-zinc-200 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="font-bold text-sm text-white">{selectedLab.testName} Parameters</h4>
                <button
                  onClick={() => setSelectedLab(null)}
                  className="p-1 text-zinc-400 hover:text-white rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-zinc-800 text-xs">
                {selectedLab.values?.map((val, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">{val.parameter}</span>
                      <span className="text-zinc-500 block text-[11px]">Normal Range: {val.normalRange}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-sm text-teal-400">
                        {val.value} {val.unit}
                      </span>
                      <span
                        className={`block text-[10px] font-bold uppercase ${
                          val.status === 'critical'
                            ? 'text-rose-400'
                            : val.status === 'high' || val.status === 'low'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {val.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-zinc-800">
                <button
                  onClick={() => setSelectedLab(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold px-4 py-2 rounded-xl border border-zinc-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
