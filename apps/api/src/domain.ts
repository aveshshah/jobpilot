export type JobSource = "linkedin_alert" | "indeed_alert";

export type Job = {
  id: string;
  source: JobSource;
  externalId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  postedAt?: string;
  firstSeenAt: string;
  lastVerifiedAt: string;
  active: boolean;
  matchScore: number;
};

export type Resume = {
  id: string;
  name: string;
  originalName: string;
  storageKey: string;
  isDefault: boolean;
};

export type CandidateProfile = {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  authorizedInUS?: boolean;
  requiresSponsorship?: boolean;
  answers?: Record<string, string | boolean | number>;
};

export type Application = {
  id: string;
  jobId: string;
  resumeId: string;
  status: "blocked" | "submitted" | "failed";
  reason?: string;
  createdAt: string;
};
