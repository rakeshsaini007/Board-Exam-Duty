
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

  const handleSave = async (hrmsCode: string, centre: string, isUpdate: boolean) => {
    const result = await updateTeacherCentre(hrmsCode, centre);
    if (result.status === 'success') {
      // Show native alert as requested
      const msg = isUpdate ? 'Data updated successfully!' : 'Data saved successfully!';
      window.alert(msg);
      
      // Reload everything to get updated stats from AvailableDuty sheet
      await loadData();
      
      // Also find the updated teacher record to refresh the card
      const updatedList = await fetchAllData(); // Use fresh fetch to sync all states
      if (updatedList.status === 'success' && updatedList.data) {
          const freshTeacher = updatedList.data.teachers.find(t => t.hrmsCode === hrmsCode);
          if (freshTeacher) setSelectedTeacher(freshTeacher);
      }

      setSaveStatus({ type: 'success', message: msg });
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      window.alert('Error: ' + (result.message || 'Failed to process record.'));
      setSaveStatus({ type: 'error', message: result.message || 'Failed to update record.' });
    }
  };

  // Find stats for the selected duty lookup centre from the centres array (which comes from AvailableDuty sheet)
  const dutyStats = useMemo(() => {
    if (!dutyLookupCentre) return null;
    const centreInfo = centres.find(c => c.name === dutyLookupCentre);
    if (!centreInfo) return null;
    
    // We also filter the teachers list to show who is currently assigned
    const assignedTeachers = teachers.filter(t => t.examinationCentre === dutyLookupCentre);
    
    return { 
      male: centreInfo.male || 0, 
      female: centreInfo.female || 0, 
      total: (centreInfo.male || 0) + (centreInfo.female || 0),
      teachers: assignedTeachers
    };
  }, [centres, teachers, dutyLookupCentre]);

  if (loading && teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-indigo-600 font-semibold text-lg animate-pulse tracking-wide italic">Fetching latest duty data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Available <span className="text-indigo-600 underline decoration-indigo-200">Duty</span> Portal
        </h1>
        <p className="mt-4 text-xl text-gray-500 font-medium">Official Examination Centre Assignment & Statistics</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Section: Search & Edit (7 columns) */}
        <div className="lg:col-span-7 space-y-10">
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 transform transition-all hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-indigo-100 p-2 rounded-lg mr-3">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              Search Teacher Record
            </h2>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter unique HRMS Code"
                className="flex-1 px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-gray-900 font-bold text-lg"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-xl transition-all shadow-lg active:scale-95 whitespace-nowrap text-lg"
              >
                Fetch Details
              </button>
            </form>
          </section>

          {selectedTeacher ? (
            <TeacherCard 
              teacher={selectedTeacher} 
              centres={centres} 
              onSave={handleSave} 
            />
          ) : (
            <div className="bg-white rounded-3xl border-4 border-dashed border-gray-100 p-16 flex flex-col items-center justify-center text-gray-300">
              <div className="bg-gray-50 p-6 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-2xl font-black opacity-50">Lookup Result will appear here</p>
              <p className="text-gray-400 mt-2">Enter an HRMS code to start editing assignments</p>
            </div>
          )}
        </div>

        {/* Right Section: Available Duty Lookup (5 columns) */}
        <div className="lg:col-span-5">
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-10 flex flex-col min-h-[600px]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
                Available Duty Lookup
              </h2>
              <p className="text-gray-400 mt-2 font-medium">Statistics directly from AvailableDuty Sheet</p>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">Select Centre</label>
              <select
                value={dutyLookupCentre}
                onChange={(e) => setDutyLookupCentre(e.target.value)}
                className="w-full text-gray-900 font-bold bg-gray-50 p-4 rounded-xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-lg cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234F46E5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
              >
                <option value="">Choose Examination Centre...</option>
                {centres.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {dutyStats ? (
              <div className="flex-1 flex flex-col space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-6 rounded-2xl border-b-4 border-blue-200 text-center">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-tighter">Male Duty</span>
                    <div className="text-4xl font-black text-blue-700 mt-1">{dutyStats.male}</div>
                  </div>
                  <div className="bg-pink-50 p-6 rounded-2xl border-b-4 border-pink-200 text-center">
                    <span className="text-xs font-black text-pink-400 uppercase tracking-tighter">Female Duty</span>
                    <div className="text-4xl font-black text-pink-700 mt-1">{dutyStats.female}</div>
                  </div>
                  <div className="col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl text-center shadow-xl transform transition-all hover:scale-[1.02]">
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Total Active Duty Assignments</span>
                    <div className="text-5xl font-black text-white mt-2">{dutyStats.total}</div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col mt-4">
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Assigned Teachers
                  </h3>
                  <div className="flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                    {dutyStats.teachers.length > 0 ? (
                      <div className="space-y-2">
                        {dutyStats.teachers.map(t => (
                          <div key={t.hrmsCode} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 text-sm">{t.name}</span>
                              <span className="text-xs text-gray-400">HRMS: {t.hrmsCode}</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${t.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                              {t.gender === 'M' ? 'MALE' : 'FEMALE'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 italic text-sm py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        No duty records found for this centre.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-300 text-center">
                <div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-200">
                  <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="font-black text-xl text-indigo-300">Statistics Waiting...</p>
                <p className="text-sm text-gray-400 mt-2">Select a centre from the dropdown<br/>to pull data from AvailableDuty sheet.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Global Status Notifications */}
      {saveStatus && (
        <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 max-w-md w-full p-5 rounded-2xl flex items-center space-x-4 shadow-2xl border-2 z-50 animate-bounce ${
          saveStatus.type === 'success' ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'
        }`}>
          <div className="bg-white/20 p-2 rounded-lg">
            {saveStatus.type === 'success' ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <span className="font-black text-lg">{saveStatus.message}</span>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-red-600 text-white p-6 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-red-400 z-[100]">
          <span className="font-bold text-lg">{error}</span>
          <button onClick={() => setError(null)} className="ml-6 bg-white/20 hover:bg-white/40 p-1 rounded-lg transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7d2fe;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #818cf8;
        }
      `}</style>
    </div>
  );
};

export default App;
