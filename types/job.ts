export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string;
  postedDate: string;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
  source?: "local" | "remote";
  applyUrl?: string;
}

export type CreateJobInput = Omit<
  Job,
  "id" | "createdAt" | "updatedAt" | "isSaved"
>;
export type UpdateJobInput = Partial<CreateJobInput>;

export interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

export interface RemotiveApiResponse {
  "job-count": number;
  jobs: RemotiveJob[];
}
