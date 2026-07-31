import React, { useState } from 'react';
import { Receipt, Plus, DollarSign, ShieldCheck, CheckCircle2, Clock, X, FileText } from 'lucide-react';
import { Invoice, Patient } from '../types';

interface BillingViewProps {
  invoices: Invoice[];
  patients: Patient[];
  onAddInvoice: (inv: Invoice) => void;
  onUpdateInvoice: (inv: Invoice) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  invoices,
  patients,
  onAddInvoice,
  onUpdateInvoice,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Invoice Items
  const [consultFee, setConsultFee] = useState('250');
  const [roomFee, setRoomFee] = useState('1500');
  const [labFee, setLabFee] = useState('450');

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    const consult = parseFloat(consultFee) || 0;
    const room = parseFloat(roomFee) || 0;
    const lab = parseFloat(labFee) || 0;
    const total = consult + room + lab;

    const insCovered = Math.round(total * 0.8);
    const patientPayable = total - insCovered;

    const newInv: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items: [
        { id: '1', description: 'Specialist Consultation Fee', category: 'Consultation Fee', cost: consult, quantity: 1 },
        { id: '2', description: 'Ward Room & Inpatient Bed Charges', category: 'Room & Board', cost: room, quantity: 1 },
        { id: '3', description: 'Diagnostic & Lab Work Charges', category: 'Lab Tests', cost: lab, quantity: 1 },
      ],
      totalAmount: total,
      insuranceCovered: insCovered,
      patientPayable,
      status: 'Pending Insurance',
    };

    onAddInvoice(newInv);
    setShowAddModal(false);
  };

  const handleMarkPaid = (inv: Invoice) => {
    onUpdateInvoice({ ...inv, status: 'Paid' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-400" /> Hospital Billing & Insurance Claims Ledger
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Patient itemized billing, copay balances, and insurance claim tracking
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-teal-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Create Patient Invoice
        </button>
      </div>

      {/* Invoice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm hover:border-zinc-700/80 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono font-bold">{inv.invoiceNumber}</span>
                  <h3 className="font-bold text-white text-base">{inv.patientName}</h3>
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

              {/* Itemized list */}
              <div className="divide-y divide-zinc-800 text-xs">
                {inv.items.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between">
                    <span className="text-zinc-300 font-medium">{item.description}</span>
                    <span className="font-mono text-white font-bold">${item.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Summary box */}
              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 flex justify-between text-xs font-semibold mt-3">
                <div>
                  <span className="text-zinc-500 block text-[10px] font-bold uppercase">Total Charges</span>
                  <span className="text-white font-mono text-sm font-bold">${inv.totalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] font-bold uppercase">Insurance (80%)</span>
                  <span className="text-emerald-400 font-mono text-sm font-bold">${inv.insuranceCovered.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] font-bold uppercase">Patient Copay</span>
                  <span className="text-teal-400 font-mono text-sm font-bold">${inv.patientPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {inv.status !== 'Paid' && (
              <div className="pt-3 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => handleMarkPaid(inv)}
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-teal-500/20"
                >
                  Record Settlement Payment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CREATE INVOICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 max-w-md w-full space-y-4 shadow-2xl text-zinc-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base">Generate Patient Hospital Bill</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Select Patient *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-semibold focus:outline-none focus:border-teal-500/50"
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
                <label className="block text-zinc-400 mb-1 font-semibold">Consultation Fee ($)</label>
                <input
                  type="number"
                  value={consultFee}
                  onChange={(e) => setConsultFee(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Inpatient Room & Bed Charges ($)</label>
                <input
                  type="number"
                  value={roomFee}
                  onChange={(e) => setRoomFee(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Lab Tests & Diagnostics Charges ($)</label>
                <input
                  type="number"
                  value={labFee}
                  onChange={(e) => setLabFee(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
