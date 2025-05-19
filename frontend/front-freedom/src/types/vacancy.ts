export interface BaseVacancy {
    id: number;
    title: string;
    position: string;
    location: string;
    salary_min: number;
    salary_max: number;
  }
  
  export interface UserVacancy extends BaseVacancy {
    description: string;
    employment_type: string;
    experience_time: string;
    job_format: string;
    skills: string;
    status: string;
    telegram?: string;
    whatsapp?: string;
    email?: string;
  }
  
  export interface HRVacancy extends BaseVacancy {
    status: string;
  }
  
  export interface AdminVacancy extends UserVacancy {
    status: string;
    telegram?: string;
    whatsapp?: string;
    email?: string;
  }
  