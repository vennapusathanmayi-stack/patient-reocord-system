import React, { useState } from 'react';
import { Calendar, Plus, Clock, User, CheckCircle2, XCircle, Search, Filter, X, Stethoscope, Video, MapPin } from 'lucide-react';
import { Appointment, Doctor, Patient } from '../types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  onAddAppointment: (apt: Appointment) => void;
  onUpdateAppointment: (apt: Appointment) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  doctors,
  patients,
  onAddAppointment,
  onUpdateAppointment,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showBookModal, setShowBookModal] = useState(false);

  // New Appointment Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorName, setSelectedDoctorName] = useState(doctors[0]?.name || '');
  const [department, setDepartment] = useState('Cardiology');
  const [appointmentType, setAppointmentType] = useState<Appointment['type']>('In-Person Consultation');
  const [dateTime, setDateTime] = useState('2026-07-24T10:00');
  const [reason, setReason] = useState('');

  const filteredAppointments = appointments.filter(
    (a) => filterStatus === 'ALL' || a.status === filterStatus
  );

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    const newApt: Appointment = {
      id: `APT-${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phone,
      doctorName: selectedDoctorName,
      department,
      dateTime: new Date(dateTime).toISOString(),
      type: appointmentType,
      status: 'Scheduled',
      reason: reason || 'Routine Outpatient Consultation',
      roomNumber: 'Suite 302',
    };

    onAddAppointment(newApt);
    setShowBookModal(false);
    setReason('');
  };

  const handleStatusChange = (apt: Appointment, newStatus: Appointment['status']) => {
    onUpdateAppointment({ ...apt, status: newStatus });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" /> Outpatient (OPD) & Specialist Scheduling
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage physician slots, telehealth consultations, and clinic visits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 px-3.5 py-2 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => setShowBookModal(true)}
            className="bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-teal-500/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Schedule Consultation
          </button>
        </div>
      </div>

      {/* Appointment Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((apt) => (
          <div
            key={apt.id}
            className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm hover:border-zinc-700/80 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between border-b border-zinc-800 pb-3 mb-3">
                <div>
                  <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                    {apt.type}
                  </span>
                  <h3 className="font-bold text-white text-base">{apt.patientName}</h3>
                  <p className="text-xs text-zinc-500">{apt.patientPhone}</p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    apt.status === 'Scheduled'
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                      : apt.status === 'In-Progress'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                      : apt.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {apt.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-zinc-200 flex items-center gap-2 font-semibold">
                  <User className="w-4 h-4 text-teal-400" />
                  <span>{apt.doctorName}</span>
                  <span className="text-zinc-500 font-normal">({apt.department})</span>
                </p>
                <p className="text-zinc-300 flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{new Date(apt.dateTime).toLocaleString()}</span>
                </p>
                <p className="text-zinc-400 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 leading-relaxed">
                  <strong className="text-zinc-300 font-semibold block mb-0.5">Clinical Reason:</strong>
                  {apt.reason}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-zinc-800">
              {apt.status === 'Scheduled' && (
                <button
                  onClick={() => handleStatusChange(apt, 'In-Progress')}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Start Session
                </button>
              )}
              {apt.status === 'In-Progress' && (
                <button
                  onClick={() => handleStatusChange(apt, 'Completed')}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Complete Visit
                </button>
              )}
              {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                <button
                  onClick={() => handleStatusChange(apt, 'Cancelled')}
                  className="px-3 bg-zinc-900 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 py-1.5 rounded-lg text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* BOOK APPOINTMENT MODAL */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 max-w-md w-full space-y-4 shadow-2xl text-zinc-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base">Schedule Doctor Appointment</h3>
              <button onClick={() => setShowBookModal(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3.5 text-xs">
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
                <label className="block text-zinc-400 mb-1 font-semibold">Attending Physician *</label>
                <select
                  value={selectedDoctorName}
                  onChange={(e) => {
                    setSelectedDoctorName(e.target.value);
                    const doc = doctors.find((d) => d.name === e.target.value);
                    if (doc) setDepartment(doc.department);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-medium focus:outline-none focus:border-teal-500/50"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} — {d.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Consultation Type</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 font-medium focus:outline-none focus:border-teal-500/50"
                >
                  <option value="In-Person Consultation">In-Person OPD Consultation</option>
                  <option value="Telehealth">Telehealth / Video Call</option>
                  <option value="Follow-Up">Follow-Up Review</option>
                  <option value="Routine Checkup">Routine Preventive Checkup</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Chief Complaint / Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Hypertension review, persistent cough"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-5 py-2 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Book Appointment Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
