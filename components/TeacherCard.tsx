
import React, { useState, useMemo, useEffect } from 'react';
import { Teacher, Centre } from '../types';

interface TeacherCardProps {
  teacher: Teacher;
  centres: Centre[];
  onSave: (hrmsCode: string, centre: string, isUpdate: boolean) => Promise<void>;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, centres, onSave }) => {
  const [selectedCentre, setSelectedCentre] = useState(teacher.examinationCentre || '');
  const [isSaving, setIsSaving] = useState(false);

  // Reset local state when a new teacher is loaded
  useEffect(() => {
    setSelectedCentre(teacher.examinationCentre || '');
  }, [teacher.hrmsCode, teacher.examinationCentre]);

  // Determine if this is an update or a fresh submission
  const isExistingAssignment = useMemo(() => {
    return !!teacher.examinationCentre && teacher.examinationCentre.trim() !== '';
  }, [teacher.examinationCentre]);

  // Filter centres based on available duty for the teacher's gender
  const availableCentres = useMemo(() => {
    return centres.filter((c) => {
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
    await onSave(teacher.hrmsCode, selectedCentre, isExistingAssignment);
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 max-w-2xl mx-auto transform transition-all hover:shadow-2xl animate-fadeIn">
      <div className={`px-6 py-4 ${isExistingAssignment ? 'bg-amber-600' : 'bg-indigo-600'}`}>
        <h3 className="text-xl font-bold text-white flex justify-between items-center">
          <span>{isExistingAssignment ? 'Existing Assignment Found' : 'New Teacher Record'}</span>
          <span className="text-sm bg-black/20 px-2 py-1 rounded text-white font-mono">HRMS: {teacher.hrmsCode}</span>
        </h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
            <p className="text-gray-800 font-bold bg-gray-50 p-3 rounded-lg border border-gray-100">{teacher.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Gender</label>
              <p className="text-gray-800 font-medium bg-gray-50 p-2 rounded border border-gray-100">{teacher.gender === 'M' ? 'Male' : 'Female'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mobile</label>
              <p className="text-gray-800 font-medium bg-gray-50 p-2 rounded border border-gray-100">{teacher.mobileNumber}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">School Name</label>
            <p className="text-gray-600 text-sm font-medium bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[3rem]">{teacher.schoolName}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Examination Centre</label>
            <div className="relative">
              <select
                value={selectedCentre}
                onChange={(e) => setSelectedCentre(e.target.value)}
                className="w-full text-gray-900 font-bold bg-white p-3 rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Select Centre --</option>
                {availableCentres.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} {c.name !== teacher.examinationCentre ? `(${teacher.gender === 'M' ? c.male : c.female} slots)` : '(Current)'}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-indigo-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic flex items-center">
              <svg className="h-3 w-3 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Displaying centres with available {teacher.gender === 'M' ? 'Male' : 'Female'} slots.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
        <div className="text-xs text-gray-500 font-medium">
          {isExistingAssignment ? (
            <span className="flex items-center text-amber-600">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
              Records found in TeacherList
            </span>
          ) : (
            <span className="flex items-center text-indigo-500">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              Ready for first assignment
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || selectedCentre === teacher.examinationCentre || !selectedCentre}
          className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-black text-white transition-all shadow-lg active:scale-95 ${
            isSaving || selectedCentre === teacher.examinationCentre || !selectedCentre
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : isExistingAssignment 
                ? 'bg-amber-600 hover:bg-amber-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <span>{isExistingAssignment ? 'Update Assignment' : 'Submit Assignment'}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TeacherCard;
