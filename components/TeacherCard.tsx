
import React, { useState, useMemo } from 'react';
import { Teacher, Centre } from '../types';

interface TeacherCardProps {
  teacher: Teacher;
  centres: Centre[];
  onSave: (hrmsCode: string, centre: string) => Promise<void>;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, centres, onSave }) => {
  const [selectedCentre, setSelectedCentre] = useState(teacher.examinationCentre);
  const [isSaving, setIsSaving] = useState(false);

  // Filter centres based on available duty for the teacher's gender
  const availableCentres = useMemo(() => {
    return centres.filter((c) => {
      // If teacher is Male, only show centres with male duty > 0
      // If teacher is Female, only show centres with female duty > 0
      // Always include the teacher's CURRENTLY assigned centre so the dropdown is valid
      const isCurrentCentre = c.name === teacher.examinationCentre;
      if (isCurrentCentre) return true;

      if (teacher.gender === 'M') {
        return (c.male || 0) > 0;
      } else if (teacher.gender === 'F') {
        return (c.female || 0) > 0;
      }
      return false;
    });
  }, [centres, teacher.gender, teacher.examinationCentre]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(teacher.hrmsCode, selectedCentre);
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 max-w-2xl mx-auto transform transition-all hover:shadow-2xl">
      <div className="bg-indigo-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex justify-between items-center">
          <span>Teacher Details</span>
          <span className="text-sm bg-indigo-500 px-2 py-1 rounded text-indigo-100">HRMS: {teacher.hrmsCode}</span>
        </h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
            <p className="text-gray-800 font-medium bg-gray-50 p-2 rounded border border-gray-100">{teacher.name}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Gender</label>
            <p className="text-gray-800 font-medium bg-gray-50 p-2 rounded border border-gray-100">{teacher.gender === 'M' ? 'Male' : 'Female'}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mobile Number</label>
            <p className="text-gray-800 font-medium bg-gray-50 p-2 rounded border border-gray-100">{teacher.mobileNumber}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">School Name</label>
            <p className="text-gray-800 font-medium bg-gray-50 p-2 rounded border border-gray-100">{teacher.schoolName}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Examination Centre</label>
            <select
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
              className="w-full text-gray-800 font-medium bg-white p-2 rounded border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            >
              <option value="">Select a centre</option>
              {availableCentres.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} {c.name !== teacher.examinationCentre ? `(${teacher.gender === 'M' ? c.male : c.female} slots)` : ''}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1 italic">
              * Only showing centres with available slots for {teacher.gender === 'M' ? 'Male' : 'Female'} teachers.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving || selectedCentre === teacher.examinationCentre || !selectedCentre}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-bold text-white transition-all shadow-md active:scale-95 ${
            isSaving || selectedCentre === teacher.examinationCentre || !selectedCentre
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Updating...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TeacherCard;
