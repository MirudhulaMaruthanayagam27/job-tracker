export const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'] as const;
export type Status = (typeof STATUSES)[number];

export const WORK_MODES = ['On-site', 'Hybrid', 'Remote'] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const JOB_TYPES = ['Full-time', 'Internship', 'Contract', 'Part-time'] as const;
export type JobType = (typeof JOB_TYPES)[number];

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  workMode: WorkMode;
  jobType: JobType;
  status: Status;
  /** YYYY-MM-DD */
  appliedOn: string;
  /** YYYY-MM-DD, set when an interview is scheduled */
  interviewOn: string | null;
  salary: string;
  link: string;
  contact: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type JobDraft = Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>;

export type SortKey = 'newest' | 'oldest' | 'company' | 'updated';
