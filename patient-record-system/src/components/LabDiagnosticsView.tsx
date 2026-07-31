import React, { useState } from 'react';
import { TestTube, Plus, Search, CheckCircle2, AlertCircle, Clock, X, FileText } from 'lucide-react';
import { LabReport, Patient, Doctor } from '../types';

interface LabDiagnosticsViewProps {
  labReports: LabReport[];
  patients: Patient[];
  doctors: Doctor[];
  onAddLabReport: (report: LabReport) => void;
  onUpdateLabReport: (report: LabReport) => void;
}

export const LabDiagnosticsView: React.FC<LabDiagnosticsViewProps> = ({
  labReports,
  patients,
  doctors,
  onAddLabReport,
  onUpdateLabReport,
}) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedLabResultModal, setSelectedLabResultModal] = useState<LabReport | null>(null);

  // New Order State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [testName, setTestName] = useState('Complete Blood Count (CBC)');
  const [category, setCategory] = useState<LabReport['category']>('Hematology');
  const [requestingDoctor, setRequestingDoctor] = useState(doctors[0]?.name || '');

  // Result Entry State
  const [param1Name, setParam1Name] = useState('WBC Count');
  const [param1Val, setParam1Val] = useState('8.5');
  const [param1Unit, setParam1Unit] = useState('x10^3/uL');
  const [param1Range, setParam1Range] = useState('4.5 - 11.0');

  const [param2Name, setParam2Name] = useState('Hemoglobin');
  const [param2Val, setParam2Val] = useState('14.2');
  const [param2Unit, setParam2Unit] = useState('g/dL');
  const [param2Range, setParam2Range] = useState('12.0 - 15.5');

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    const newReport: LabReport = {
      id: `LAB-${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      testName,
      category,
      orderDate: new Date().toISOString(),
      status: 'Ordered',
      requestingDoctor,
      labTechnician: 'Pending Assignment',
      resultsSummary: 'Awaiting lab specimen processing',
    };

    onAddLabReport(newReport);
    setShowOrderModal(false);
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabResultModal) return;

    const updated: LabReport = {
      ...selectedLabResultModal,
      status: 'Completed',
      resultDate: new Date().toISOString(),
      labTechnician: 'Senior CLS Technician',
      resultsSummary: 'Lab analysis completed and verified by pathology department.',
      values: [
        {
          parameter: param1Name,
          value: param1Val,
          unit: param1Unit,
          normalRange: param1Range,
          status: 'normal',
        },
        {
          parameter: param2Name,
          value: param2Val,
          unit: param2Unit,
          normalRange: param2Range,
          status: 'normal',
        },
      ],
    };

    onUpdateLabReport(updated);
    setSelectedLabResultModal(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TestTube className="w-5 h-5 text-teal-400" /> Laboratory & Diagnostic Orders
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Pathology, microbiology, biochemistry, and imaging diagnostic orders
          </p>
        </div>

        <button
          onClick={() => setShowOrderModal(true)}
          className="bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-teal-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Request STAT Lab Test
        </button>
      </div>

      {/* Lab Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labReports.map((lab) => (
          <div
            key={lab.id}
            className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm hover:border-zinc-700/80 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between border-b border-zinc-800 pb-3 mb-3">
                <div>
                  <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                    {lab.category}
                  </span>
                  <h3 className="font-bold text-white text-base">{lab.testName}</h3>
                  <p className="text-xs text-teal-300 font-bold mt-0.5">{lab.patientName}</p>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    lab.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : lab.status === 'In Progress'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {lab.status}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                <p>
                  <span className="text-zinc-500 font-medium">Requesting Doctor:</span>{' '}
                  <span className="font-semibold text-zinc-200">{lab.requestingDoctor}</span>
                </p>
                <p>
                  <span className="text-zinc-500 font-medium">Ordered:</span>{' '}
                  <span className="font-mono text-zinc-400">{new Date(lab.orderDate).toLocaleString()}</span>
                </p>
                {lab.resultsSummary && (
                  <p className="pt-1 text-zinc-400">
                    <strong className="text-zinc-200 font-semibold block">Summary:</strong> {lab.resultsSummary}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              {lab.status !== 'Completed' ? (
                <button
                  onClick={() => setSelectedLabResultModal(lab)}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                >
                  Enter Lab Results
                </button>
              ) : (
                <button
                  onClick={() => setSelectedLabResultModal(lab)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold px-3.5 py-2 rounded-xl text-xs border border-zinc-800 transition-colors cursor-pointer"
                >
                  View Parameters
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* REQUEST LAB MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 max-w-md w-full space-y-4 shadow-2xl text-zinc-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base">Request STAT Lab Diagnostic Order</h3>
              <button onClick={() => setShowOrderModal(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Select Patient *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-medium focus:outline-none focus:border-teal-500/50"
                  required
                >
                  <option value="">-- Choose Patient Record --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Test / Diagnostic Order *</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Diagnostic Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-medium focus:outline-none focus:border-teal-500/50"
                >
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Hematology">Hematology</option>
                  <option value="Imaging">Radiology / Imaging</option>
                  <option value="Cardiology">Cardiology (ECG/Echo)</option>
                  <option value="Microbiology">Microbiology</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Submit Diagnostic Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LAB RESULT ENTRY / VIEW MODAL */}
      {selectedLabResultModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 max-w-lg w-full space-y-4 shadow-2xl text-zinc-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">{selectedLabResultModal.testName}</h3>
                <p className="text-xs text-zinc-500">Patient: {selectedLabResultModal.patientName}</p>
              </div>
              <button
                onClick={() => setSelectedLabResultModal(null)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedLabResultModal.status === 'Completed' ? (
              <div className="space-y-3 text-xs">
                <p className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl">
                  Status: Completed & Pathology Approved
                </p>
                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
                  {selectedLabResultModal.values?.map((v, i) => (
                    <div key={i} className="p-3 flex justify-between bg-zinc-950">
                      <div>
                        <span className="font-bold text-white">{v.parameter}</span>
                        <span className="text-zinc-500 block text-[10px]">Reference Range: {v.normalRange}</span>
                      </div>
                      <span className="font-bold font-mono text-teal-400 text-sm">
                        {v.value} {v.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveResults} className="space-y-3.5 text-xs">
                <p className="text-zinc-400 font-medium">Input laboratory analyzer findings:</p>

                <div className="p-3 bg-zinc-900/80 rounded-xl space-y-2 border border-zinc-800">
                  <span className="font-bold text-teal-400 block">Parameter 1</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={param1Name}
                      onChange={(e) => setParam1Name(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 font-medium focus:outline-none focus:border-teal-500/50"
                    />
                    <input
                      type="text"
                      value={param1Val}
                      onChange={(e) => setParam1Val(e.target.value)}
                      placeholder="Value"
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 font-mono font-bold focus:outline-none focus:border-teal-500/50"
                    />
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/80 rounded-xl space-y-2 border border-zinc-800">
                  <span className="font-bold text-teal-400 block">Parameter 2</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={param2Name}
                      onChange={(e) => setParam2Name(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 font-medium focus:outline-none focus:border-teal-500/50"
                    />
                    <input
                      type="text"
                      value={param2Val}
                      onChange={(e) => setParam2Val(e.target.value)}
                      placeholder="Value"
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 font-mono font-bold focus:outline-none focus:border-teal-500/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedLabResultModal(null)}
                    className="px-4 py-2 text-zinc-400 hover:text-white font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    Approve & Publish Results
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
