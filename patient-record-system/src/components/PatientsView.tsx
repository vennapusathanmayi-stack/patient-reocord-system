import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  List,
  Grid,
  ChevronRight,
  X,
  ShieldAlert,
  Phone,
  Mail,
  Building,
  UserCheck,
  Activity,
  Heart,
  Stethoscope,
  BadgeAlert,
} from 'lucide-react';
import { Patient, TriageCategory, AdmissionStatus } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenPatientModal: (patient: Patient) => void;
  onAddPatient: (newPatient: Patient) => void;
  doctors: { name: string; department: string }[];
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  searchQuery,
  setSearchQuery,
  onOpenPatientModal,
  onAddPatient,
  doctors,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [triageFilter, setTriageFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Patient Registration State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('48');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('1978-08-14');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [emergencyName, setEmergencyName] = useState('Jane Doe');
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (555) 987-6543');
  const [insuranceProvider, setInsuranceProvider] = useState('Aetna Health Plan');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('AET-99201');
  const [triageCategory, setTriageCategory] = useState<TriageCategory>('routine');
  const [admissionStatus, setAdmissionStatus] = useState<AdmissionStatus>('Admitted');
  const [department, setDepartment] = useState('Cardiology');
  const [primaryPhysician, setPrimaryPhysician] = useState('Dr. Sarah Jenkins, MD');
  const [allergiesText, setAllergiesText] = useState('Penicillin');

  // Filter Logic
  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.wardRoomBed.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || p.admissionStatus === statusFilter;
    const matchesTriage = triageFilter === 'ALL' || p.triageCategory === triageFilter;

    return matchesQuery && matchesStatus && matchesTriage;
  });

  // Handle New Registration
  const handleSubmitNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newMrn = `HSP-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPatient: Patient = {
      id: `PAT-${Date.now()}`,
      mrn: newMrn,
      firstName,
      lastName,
      age: parseInt(age) || 30,
      gender,
      dob,
      bloodGroup,
      phone,
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      address,
      emergencyContact: {
        name: emergencyName || 'Family Contact',
        relationship: 'Relative',
        phone: emergencyPhone || phone,
      },
      insuranceProvider,
      insurancePolicyNumber,
      triageCategory,
      admissionStatus,
      department,
      wardRoomBed: `${department} Ward-Bed-0${Math.floor(1 + Math.random() * 8)}`,
      primaryPhysician,
      admissionDate: new Date().toISOString(),
      allergies: allergiesText ? allergiesText.split(',').map((a) => a.trim()) : [],
      chronicConditions: [],
      preExistingHistory: 'New patient intake admission.',
      familyHistory: 'Not documented.',
    };

    onAddPatient(newPatient);
    setShowAddModal(false);

    // Reset Form
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Search Control Bar */}
      <div className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" /> Patient Registry & Electronic Health Records (EHR)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Showing {filteredPatients.length} patient files in master health system directory
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-zinc-800 text-teal-400 border border-zinc-700/60 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-zinc-800 text-teal-400 border border-zinc-700/60 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Card Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-teal-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> New Intake Registration
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-800">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, MRN (HSP-...), ward, diagnosis..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 px-3 py-2 focus:outline-none font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Admitted">Admitted</option>
              <option value="ICU">ICU</option>
              <option value="Emergency">Emergency</option>
              <option value="Outpatient">Outpatient</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>

          {/* Triage Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Triage Priority:</span>
            <select
              value={triageFilter}
              onChange={(e) => setTriageFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 px-3 py-2 focus:outline-none font-medium"
            >
              <option value="ALL">All Triage Levels</option>
              <option value="emergency">Emergency (Red Alert)</option>
              <option value="urgent">Urgent (Yellow Alert)</option>
              <option value="routine">Routine (Green Level)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-[#121216] rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-500 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Patient Demographics</th>
                  <th className="py-3.5 px-4">Age / Sex / Blood</th>
                  <th className="py-3.5 px-4">Triage Priority</th>
                  <th className="py-3.5 px-4">Status & Ward</th>
                  <th className="py-3.5 px-4">Attending Doctor</th>
                  <th className="py-3.5 px-4 text-right">EHR Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => onOpenPatientModal(patient)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 font-bold text-sm flex items-center justify-center border border-teal-500/20 shadow-sm">
                          {patient.firstName[0]}
                          {patient.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm hover:text-teal-400 transition-colors">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="font-mono text-[11px] text-zinc-500 font-medium">MRN: {patient.mrn}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-zinc-200">
                        {patient.age} yrs • {patient.gender}
                      </p>
                      <p className="text-zinc-500 font-semibold">Blood: <span className="text-rose-400 font-bold">{patient.bloodGroup}</span></p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          patient.triageCategory === 'emergency'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                            : patient.triageCategory === 'urgent'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {patient.triageCategory === 'emergency' && <BadgeAlert className="w-3.5 h-3.5" />}
                        {patient.triageCategory.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-md border border-teal-500/20 text-[11px] inline-block mb-1">
                        {patient.admissionStatus}
                      </span>
                      <p className="text-zinc-500 text-[11px]">{patient.department} ({patient.wardRoomBed})</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-zinc-300">{patient.primaryPhysician}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold px-3 py-1.5 rounded-lg border border-zinc-800 transition-all inline-flex items-center gap-1 text-xs cursor-pointer">
                        Open Chart <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => onOpenPatientModal(patient)}
              className="bg-[#121216] rounded-2xl p-5 border border-zinc-800 shadow-sm hover:border-zinc-700/80 transition-all cursor-pointer space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 font-bold flex items-center justify-center border border-teal-500/20 text-base shadow-sm">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="font-mono text-xs text-zinc-500">MRN: {patient.mrn}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    patient.triageCategory === 'emergency'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : patient.triageCategory === 'urgent'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {patient.triageCategory.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Age & Gender</span>
                  <span className="font-bold text-zinc-200">
                    {patient.age} yrs • {patient.gender}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Blood Group</span>
                  <span className="font-bold text-rose-400">{patient.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Department</span>
                  <span className="font-semibold text-zinc-200">{patient.department}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Bed Allocation</span>
                  <span className="font-bold text-teal-400">{patient.wardRoomBed}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800">
                <span className="text-zinc-400">Dr. {patient.primaryPhysician.split(',')[0]}</span>
                <span className="text-teal-400 font-bold flex items-center gap-1">
                  View Full Chart <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW PATIENT ADMISSION INTAKE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121216] rounded-2xl border border-zinc-800 p-6 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-zinc-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Patient Intake & Admission Registration</h3>
                  <p className="text-xs text-zinc-500">Create new electronic medical record file</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewPatient} className="space-y-4 pt-4 overflow-y-auto pr-1 text-xs custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="e.g. Robert"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="e.g. Miller"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Age *</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50 font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-rose-400 focus:outline-none focus:border-teal-500/50 font-semibold"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Department Unit *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50 font-medium"
                  >
                    <option value="Cardiology">Cardiology Unit</option>
                    <option value="Emergency">Emergency Ward</option>
                    <option value="Surgery">Surgical Suite</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Pediatrics">Pediatrics Ward</option>
                    <option value="ICU">Intensive Care Unit (ICU)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Triage Priority Level *</label>
                  <select
                    value={triageCategory}
                    onChange={(e) => setTriageCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 font-bold text-white focus:outline-none focus:border-teal-500/50"
                  >
                    <option value="routine">Routine (Green)</option>
                    <option value="urgent">Urgent (Yellow)</option>
                    <option value="emergency">Emergency (Red Alert)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Attending Physician *</label>
                  <select
                    value={primaryPhysician}
                    onChange={(e) => setPrimaryPhysician(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-teal-500/50 font-medium"
                  >
                    {doctors.map((d, i) => (
                      <option key={i} value={d.name}>
                        {d.name} ({d.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Known Drug Allergies</label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, NSAIDs, Sulfa"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
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
                  Complete Registration & Open Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
