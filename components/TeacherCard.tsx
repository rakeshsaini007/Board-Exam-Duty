
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

  const handleDownloadCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Duty Card - ${teacher.hrmsCode}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700;900&display=swap');
            body { 
                font-family: 'Noto Sans Devanagari', sans-serif; 
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                background: #f3f4f6;
            }
            @page {
              size: A4 portrait;
              margin: 0;
            }
            .duty-card {
              width: 105mm;
              height: 148.5mm;
              background: white;
              padding: 6mm;
              box-sizing: border-box;
              border: 1px solid #e5e7eb;
              position: relative;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            .card-border-inner {
              border: 2px double #4F46E5;
              height: 100%;
              padding: 4mm;
              display: flex;
              flex-direction: column;
              border-radius: 8px;
            }
            @media print {
              body { background: white; }
              .no-print { display: none; }
              .duty-card { 
                  border: none; 
                  box-shadow: none;
                  margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="duty-card shadow-2xl my-10">
            <div class="card-border-inner">
                <div class="text-center border-b border-indigo-100 pb-2 mb-3">
                  <h1 class="text-[13px] font-black text-indigo-900 leading-tight">बेसिक शिक्षा परिषद उत्तर प्रदेश, प्रयागराज</h1>
                  <p class="text-gray-700 font-bold text-[10px] mt-0.5">बोर्ड परीक्षा वर्ष - 2026</p>
                  <p class="text-indigo-600 font-black text-[11px] mt-0.5">कक्ष निरीक्षक</p>
                </div>
                
                <div class="space-y-3 mb-auto">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <p class="text-[7px] font-black text-indigo-400 uppercase tracking-widest">HRMS CODE</p>
                      <p class="text-[10px] font-bold text-gray-900">${teacher.hrmsCode}</p>
                    </div>
                    <div>
                      <p class="text-[7px] font-black text-indigo-400 uppercase tracking-widest">GENDER</p>
                      <p class="text-[10px] font-bold text-gray-900">${teacher.gender === 'M' ? 'Male' : 'Female'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p class="text-[7px] font-black text-indigo-400 uppercase tracking-widest">TEACHER NAME</p>
                    <p class="text-[10px] font-bold text-gray-900 leading-tight uppercase">${teacher.name}</p>
                  </div>
                  
                  <div>
                    <p class="text-[7px] font-black text-indigo-400 uppercase tracking-widest">SCHOOL NAME</p>
                    <p class="text-[9px] font-bold text-gray-800 leading-tight uppercase">${teacher.schoolName}</p>
                  </div>

                  <div>
                    <p class="text-[7px] font-black text-indigo-400 uppercase tracking-widest">MOBILE NO.</p>
                    <p class="text-[10px] font-bold text-gray-900">${teacher.mobileNumber}</p>
                  </div>
                </div>

                <div class="bg-indigo-50 border border-indigo-200 p-3 rounded-lg text-center my-3">
                  <p class="text-[9px] font-black text-indigo-600 mb-1 leading-tight">खण्ड शिक्षा अधिकारी-स्वार द्वारा आवंटित परीक्षा केन्द्र</p>
                  <h2 class="text-[12px] font-black text-indigo-900 leading-tight uppercase">${teacher.examinationCentre}</h2>
                </div>

                <div class="flex justify-between items-end mt-auto pt-3 border-t border-gray-100">
                  <div class="text-center w-[45%]">
                    <div class="h-5 border-b border-gray-200 mb-1"></div>
                    <p class="text-[7px] font-bold text-gray-700 leading-tight">हस्ताक्षर कक्ष निरीक्षक</p>
                  </div>
                  <div class="text-center w-[52%]">
                    <div class="h-5 border-b border-gray-200 mb-1"></div>
                    <p class="text-[7px] font-bold text-gray-700 leading-tight">प्रति हस्ताक्षर खण्ड शिक्षा अधिकारी</p>
                  </div>
                </div>
                
                <div class="text-[6px] text-gray-400 font-medium italic mt-2 text-right">
                    दिनांक: ${new Date().toLocaleDateString('hi-IN')}
                </div>
                
                <div class="absolute top-2 right-2 text-[5px] font-bold text-indigo-100 select-none -rotate-12 pointer-events-none uppercase">
                  Verified Portal Record
                </div>
            </div>
          </div>
          
          <div class="fixed bottom-8 left-0 right-0 flex justify-center no-print">
            <button onclick="window.print()" class="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-2xl hover:bg-indigo-700 transition-all flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Duty Card (1/4 A4 Size)</span>
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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

      <div className="bg-gray-50 px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-xs text-gray-500 font-medium">
          {isExistingAssignment ? (
            <span className="flex items-center text-amber-600">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
              Assigned: {teacher.examinationCentre}
            </span>
          ) : (
            <span className="flex items-center text-indigo-500">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              No current assignment
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isExistingAssignment && (
            <button
              onClick={handleDownloadCard}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md active:scale-95 border-b-4 border-emerald-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Card</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving || selectedCentre === teacher.examinationCentre || !selectedCentre}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-8 py-3 rounded-xl font-black text-white transition-all shadow-lg active:scale-95 ${
              isSaving || selectedCentre === teacher.examinationCentre || !selectedCentre
                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                : isExistingAssignment 
                  ? 'bg-amber-600 hover:bg-amber-700 border-b-4 border-amber-800' 
                  : 'bg-indigo-600 hover:bg-indigo-700 border-b-4 border-indigo-800'
            }`}
          >
            {isSaving ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span>{isExistingAssignment ? 'Update' : 'Submit'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherCard;
