
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Teacher, Centre, ApiResponse } from './types';
import { fetchAllData, updateTeacherCentre } from './services/api';
import TeacherCard from './components/TeacherCard';

// SET THE PORTAL DEADLINE HERE: 10 Feb 2026, 5:00 PM
const DEADLINE = new Date('2026-02-10T17:00:00').getTime();

const App: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Check if current time has passed the deadline
  const isExpired = useMemo(() => currentTime >= DEADLINE, [currentTime]);

  const loadData = useCallback(async () => {
    if (isExpired) {
        setLoading(false);
        return;
    }
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
  }, [isExpired]);

  useEffect(() => {
    loadData();
    
    // Optional: Update timer every minute to handle users who leave the tab open
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;
    
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
    if (isExpired) {
        window.alert("Deadline reached. Assignments are no longer accepted.");
        return;
    }
    const result = await updateTeacherCentre(hrmsCode, centre);
    if (result.status === 'success') {
      const msg = isUpdate ? 'Data updated successfully!' : 'Data saved successfully!';
      window.alert(msg);
      
      await loadData();
      
      const updatedList = await fetchAllData();
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

  // 1. Loading State
  if (loading && teachers.length === 0 && !isExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-indigo-600 font-semibold text-lg animate-pulse tracking-wide italic">Fetching latest duty data...</p>
      </div>
    );
  }

  // 2. Expired State
  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-gray-100 transform transition-all animate-fadeIn">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 text-red-500 rounded-full mb-8 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Portal Access Closed</h1>
          <div className="h-1 w-16 bg-red-200 mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-600 font-medium leading-relaxed mb-8">
            The deadline for examination duty assignment <br/>
            <span className="font-bold text-red-600">(10 Feb 2026, 05:00 PM)</span> <br/>
            has officially passed. 
          </p>
          <div className="bg-gray-50 rounded-2xl p-6 text-sm text-gray-500 border border-gray-100">
            Please contact the <span className="font-bold text-gray-700">Block Education Office (BEO)</span> for any urgent corrections or manual assignment requests.
          </div>
          <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest font-black">Basic Education Department, UP</p>
        </div>
      </div>
    );
  }

  // 3. Normal Active State
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Available <span className="text-indigo-600 underline decoration-indigo-200">Duty</span> Portal
        </h1>
        <p className="mt-4 text-xl text-gray-500 font-medium">Official Examination Centre Assignment & Card Generation</p>
        <div className="mt-4 inline-flex items-center bg-indigo-50 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
          <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
          Link Active Until 10 Feb 2026, 05:00 PM
        </div>
      </header>

      <div className="space-y-10 max-w-2xl mx-auto">
        {/* Search Section */}
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

        {/* Result Section */}
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
      `}</style>
    </div>
  );
};

export default App;
