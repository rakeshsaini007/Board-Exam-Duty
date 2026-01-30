
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
}

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
