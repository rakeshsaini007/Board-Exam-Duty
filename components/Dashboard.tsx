
import React, { useMemo } from 'react';
import { Teacher, Centre, DashboardStat } from '../types';

interface DashboardProps {
  teachers: Teacher[];
  centres: Centre[];
  highlightCentre?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ teachers, centres, highlightCentre }) => {
  const stats = useMemo(() => {
    // We "drag" the list of centers directly from the AvailableDuty sheet data (via centres prop)
    const data: DashboardStat[] = centres.map((c) => ({
      centre: c.name,
      male: 0,
      female: 0,
    }));

    // We calculate counts based on the current TeacherList
    teachers.forEach((t) => {
      const centreStat = data.find((d) => d.centre === t.examinationCentre);
      if (centreStat) {
        if (t.gender === 'M') centreStat.male++;
        else if (t.gender === 'F') centreStat.female++;
      }
    });

    return data;
  }, [teachers, centres]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
        <h2 className="text-xl font-bold text-indigo-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Available Duty
        </h2>
        <p className="text-xs text-indigo-600 mt-1 font-medium uppercase tracking-wide">Live statistics from AvailableDuty Sheet</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Centre Name</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Male</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Female</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.length > 0 ? (
              stats.map((row) => (
                <tr 
                  key={row.centre} 
                  className={`transition-colors ${highlightCentre === row.centre ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {row.centre}
                    {highlightCentre === row.centre && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 animate-pulse">
                        Selected
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-600 font-bold">{row.male}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-pink-600 font-bold">{row.female}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-black">
                      {row.male + row.female}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400 italic">
                  No centres found in AvailableDuty sheet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
