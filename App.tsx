
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Teacher, Centre, ApiResponse } from './types';
import { fetchAllData, updateTeacherCentre } from './services/api';
import TeacherCard from './components/TeacherCard';

const App: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [dutyLookupCentre, setDutyLookupCentre] = useState('');
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

  // Calculate stats for the selected duty lookup centre
  const dutyStats = useMemo(() => {
    if (!dutyLookupCentre) return null;
    const filtered = teachers.filter(t => t.examinationCentre === dutyLookupCentre);
    const male = filtered.filter(t => t.gender === 'M').length;
    const female = filtered.filter(t => t.gender === 'F').length;
    return { male, female, total: filtered.length };
  }, [teachers, dutyLookupCentre]);

  if (loading && teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-indigo-600 font-semibold text-lg animate-pulse tracking-wide">Accessing Google Sheets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Teacher Assignment <span className="text-indigo-600">Portal</span>
        </h1>
        <p className="mt-3 text-lg text-gray-600">Manage Assignments and Monitor Duty Availability</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Teacher Lookup & Edit */}
        <div className="space-y-8">
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg active:scale-95 whitespace-nowrap"
              >
                Fetch
              </button>
            </form>
          </div>

          {selectedTeacher ? (
            <TeacherCard 
              teacher={selectedTeacher} 
              centres={centres} 
              onSave={handleSave} 
            />
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-lg font-medium">Enter HRMS code to edit details</p>
            </div>
          )}
        </div>

        {/* Right Column: Available Duty Lookup */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <svg className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Available Duty Lookup
              </h2>
              <p className="text-sm text-gray-500 mt-1">Select a centre to view current assignment statistics.</p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Examination Centre</label>
              <select
                value={dutyLookupCentre}
                onChange={(e) => setDutyLookupCentre(e.target.value)}
                className="w-full text-gray-800 font-medium bg-white p-3 rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              >
                <option value="">Choose a centre from list...</option>
                {centres.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {dutyStats ? (
              <div className="flex-1 flex flex-col justify-center animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                    <span className="text-xs font-bold text-blue-400 uppercase">Male Teachers</span>
                    <div className="text-4xl font-black text-blue-600 mt-2">{dutyStats.male}</div>
                  </div>
                  <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 text-center">
                    <span className="text-xs font-bold text-pink-400 uppercase">Female Teachers</span>
                    <div className="text-4xl font-black text-pink-600 mt-2">{dutyStats.female}</div>
                  </div>
                  <div className="col-span-2 bg-indigo-600 p-6 rounded-2xl text-center shadow-lg">
                    <span className="text-xs font-bold text-indigo-200 uppercase">Total Duty Assigned</span>
                    <div className="text-5xl font-black text-white mt-1">{dutyStats.total}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-300">
                <svg className="h-20 w-20 mb-4 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <p className="font-bold text-lg">Select a centre to view stats</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Status Notifications */}
      {saveStatus && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 max-w-md w-full p-4 rounded-xl flex items-center space-x-3 shadow-2xl border z-50 animate-bounce ${
          saveStatus.type === 'success' ? 'bg-green-500 border-green-400 text-white' : 'bg-red-500 border-red-400 text-white'
        }`}>
          {saveStatus.type === 'success' ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="font-bold">{saveStatus.message}</span>
        </div>
      )}

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
