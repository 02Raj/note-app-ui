export interface Job {
  _id?: string;
  companyName: string;
  skillsRequired: string[];
  contactEmail: string | null;
  contactPhone: string | null;
  workMode: string;
  status: 'Saved' | 'Applied' | 'Contacted' | 'Interviewing' | 'Rejected' | 'Offer';
  rawText: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParsedJobResponse {
  status: string;
  success?: boolean;
  message: string;
  data: {
    companyName: string;
    skillsRequired: string[];
    contactEmail: string | null;
    contactPhone: string | null;
    workMode: string;
  };
}
