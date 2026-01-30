
export interface Teacher {
  hrmsCode: string;
  name: string;
  gender: string;
  schoolName: string;
  mobileNumber: string;
  examinationCentre: string;
}

export interface Centre {
  name: string;
  male?: number;
  female?: number;
}

// Added DashboardStat interface to resolve the import error in components/Dashboard.tsx
export interface DashboardStat {
  centre: string;
  male: number;
  female: number;
}

export interface ApiResponse {
  status: 'success' | 'error';
  data?: {
    teachers: Teacher[];
    centres: Centre[];
  };
  message?: string;
}
