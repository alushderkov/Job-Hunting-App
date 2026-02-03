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
}

export type CreateJobInput = Omit<
  Job,
  "id" | "createdAt" | "updatedAt" | "isSaved"
>;
export type UpdateJobInput = Partial<CreateJobInput>;
