import React, { useState } from 'react';
import { Header, TabType } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { BedWardView } from './components/BedWardView';
import { AppointmentsView } from './components/AppointmentsView';
import { PharmacyView } from './components/PharmacyView';
import { LabDiagnosticsView } from './components/LabDiagnosticsView';
import { BillingView } from './components/BillingView';
import { AiAssistantView } from './components/AiAssistantView';
import { PatientProfileModal } from './components/PatientProfileModal';
import {
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_VITALS,
  INITIAL_CLINICAL_NOTES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_REPORTS,
  INITIAL_BEDS,
  INITIAL_APPOINTMENTS,
  INITIAL_INVOICES,
} from './data/initialData';
import { Patient, VitalRecord, ClinicalNote, Prescription, LabReport } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [vitals, setVitals] = useState<VitalRecord[]>(INITIAL_VITALS);
  const [notes, setNotes] = useState<ClinicalNote[]>(INITIAL_CLINICAL_NOTES);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [labReports, setLabReports] = useState<LabReport[]>(INITIAL_LAB_REPORTS);
  const [appointments] = useState(INITIAL_APPOINTMENTS);
  const [beds, setBeds] = useState(INITIAL_BEDS);
  const [invoices] = useState(INITIAL_INVOICES);
  const [doctors] = useState(INITIAL_DOCTORS);

  const emergencyCount = patients.filter((p) => p.triageCategory === 'emergency').length;

  const handleResetData = () => {
    setPatients(INITIAL_PATIENTS);
    setVitals(INITIAL_VITALS);
    setNotes(INITIAL_CLINICAL_NOTES);
    setPrescriptions(INITIAL_PRESCRIPTIONS);
    setLabReports(INITIAL_LAB_REPORTS);
    setBeds(INITIAL_BEDS);
  };

  const handleAddPatient = (newP: Patient) => {
    setPatients((prev) => [newP, ...prev]);
  };

  const handleAddVital = (vital: VitalRecord) => {
    setVitals((prev) => [vital, ...prev]);
  };

  const handleAddNote = (note: ClinicalNote) => {
    setNotes((prev) => [note, ...prev]);
  };

  const handleAddPrescription = (rx: Prescription) => {
    setPrescriptions((prev) => [rx, ...prev]);
  };

  const handleUpdatePatient = (updated: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedPatient && selectedPatient.id === updated.id) {
      setSelectedPatient(updated);
    }
  };

  const handleToggleBedStatus = (bedId: string) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== bedId) return b;
        const newStatus = b.status === 'Available' ? 'Maintenance' : 'Available';
        return { ...b, status: newStatus };
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-200 font-sans selection:bg-teal-500 selection:text-zinc-950 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewAdmission={() => {
          setActiveTab('patients');
        }}
        onResetData={handleResetData}
        emergencyCount={emergencyCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            patients={patients}
            vitals={vitals}
            beds={beds}
            doctors={doctors}
            appointments={appointments}
            onSelectPatient={(p) => setSelectedPatient(p)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'patients' && (
          <PatientsView
            patients={patients}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenPatientModal={(p) => setSelectedPatient(p)}
            onAddPatient={handleAddPatient}
            doctors={doctors}
          />
        )}

        {activeTab === 'beds' && (
          <BedWardView
            beds={beds}
            patients={patients}
            onToggleBedStatus={handleToggleBedStatus}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            doctors={doctors}
            patients={patients}
          />
        )}

        {activeTab === 'pharmacy' && (
          <PharmacyView
            prescriptions={prescriptions}
            patients={patients}
          />
        )}

        {activeTab === 'labs' && (
          <LabDiagnosticsView
            labReports={labReports}
            patients={patients}
          />
        )}

        {activeTab === 'billing' && (
          <BillingView
            invoices={invoices}
            patients={patients}
          />
        )}

        {activeTab === 'ai' && (
          <AiAssistantView
            patients={patients}
          />
        )}
      </main>

      {selectedPatient && (
        <PatientProfileModal
          patient={selectedPatient}
          vitals={vitals}
          notes={notes}
          prescriptions={prescriptions}
          labReports={labReports}
          invoices={invoices}
          onClose={() => setSelectedPatient(null)}
          onAddVital={handleAddVital}
          onAddNote={handleAddNote}
          onAddPrescription={handleAddPrescription}
          onUpdatePatient={handleUpdatePatient}
        />
      )}
    </div>
  );
}

