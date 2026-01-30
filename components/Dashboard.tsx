
import React, { useMemo } from 'react';
import { Teacher, Centre, DashboardStat } from '../types';

interface DashboardProps {
  teachers: Teacher[];
  centres: Centre[];
}

const Dashboard: React.FC<DashboardProps> = ({ teachers, centres }) => {
  const stats = useMemo(() => {
    const data: DashboardStat[] = centres.map((c) => ({
      centre: c.name,
      male: 0,
      female: 0,
    }));

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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Assignment Dashboard
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examination Centre</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Male Teachers</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Female Teachers</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.length > 0 ? (
              stats.map((row) => (
                <tr key={row.centre} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.centre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-600 font-semibold">{row.male}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-pink-600 font-semibold">{row.female}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold bg-indigo-50 text-indigo-700">{row.male + row.female}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 italic">No centres found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
