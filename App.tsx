
import React, { useState, useEffect, useCallback } from 'react';
import { Teacher, Centre, ApiResponse } from './types';
import { fetchAllData, updateTeacherCentre } from './services/api';
import TeacherCard from './components/TeacherCard';

const App: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await fetchAllData();
    if (result.status === 'success' && result.data) {
      setTeachers(result.data.teachers);
      setCentres(result.data.centres);
      setError(null);
    } else {
      setError(result.message || 'Error loading data from Google Sheets.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = teachers.find((t) => t.hrmsCode === searchTerm.trim());
    if (found) {
      setSelectedTeacher(found);
      setSaveStatus(null);
    } else {
      setSelectedTeacher(null);
      setSaveStatus({ type: 'error', message: 'No teacher found with this HRMS code.' });
    }
  };

  const handleSave = async (hrmsCode: string, centre: string) => {
    const result = await updateTeacherCentre(hrmsCode, centre);
    if (result.status === 'success') {
      setTeachers((prev) =>
        prev.map((t) => (t.hrmsCode === hrmsCode ? { ...t, examinationCentre: centre } : t))
      );
      if (selectedTeacher && selectedTeacher.hrmsCode === hrmsCode) {
        setSelectedTeacher({ ...selectedTeacher, examinationCentre: centre });
      }
      setSaveStatus({ type: 'success', message: 'Teacher assignment updated successfully!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus({ type: 'error', message: result.message || 'Failed to update record.' });
    }
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-indigo-600 font-semibold text-lg animate-pulse tracking-wide">Accessing Google Sheets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Teacher Assignment <span className="text-indigo-600">Portal</span>
        </h1>
        <p className="mt-3 text-lg text-gray-600">Fetch and Edit Duty Assignments</p>
      </header>

      <div className="space-y-8">
        {/* Search Box */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Teacher Lookup
          </h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter HRMS Code"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-800 font-medium"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg active:scale-95"
            >
              Fetch Details
            </button>
          </form>
        </div>

        {/* Teacher Result Card */}
        {selectedTeacher ? (
          <TeacherCard 
            teacher={selectedTeacher} 
            centres={centres} 
            onSave={handleSave} 
          />
        ) : (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xl font-medium">Please enter an HRMS code to proceed</p>
          </div>
        )}

        {/* Status Notifications */}
        {saveStatus && (
          <div className={`p-4 rounded-lg flex items-center space-x-3 shadow-sm border animate-bounce ${
            saveStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {saveStatus.type === 'success' ? (
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-bold">{saveStatus.message}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-800 font-bold mb-3">Portal Usage</h3>
          <ul className="text-gray-600 text-sm space-y-3">
            <li className="flex items-start">
              <span className="text-indigo-500 font-bold mr-2">1.</span>
              Lookup teacher by unique HRMS code.
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 font-bold mr-2">2.</span>
              Choose a new examination centre from the dropdown.
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 font-bold mr-2">3.</span>
              Click "Save Changes" to update the master record.
            </li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-red-600 text-white p-4 rounded-lg shadow-2xl flex items-center justify-between border-2 border-red-400">
          <span className="font-bold">{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-2xl leading-none">&times;</button>
        </div>
      )}
    </div>
  );
};

export default App;
