import { Application, CandidateProfile, Job, Resume } from "./domain.js";

const now = new Date().toISOString();
const jobs = new Map<string, Job>([
  ["demo-1", {
    id: "demo-1",
    source: "linkedin_alert",
    externalId: "demo-linkedin-1",
    title: "Vehicle Controls Engineer",
    company: "Demo Mobility",
    location: "Novi, MI",
    url: "https://example.com/jobs/demo-1",
    description: "Develop vehicle controls and estimation algorithms using MATLAB/Simulink.",
    postedAt: now,
    firstSeenAt: now,
    lastVerifiedAt: now,
    active: true,
    matchScore: 91
  }]
]);
const resumes = new Map<string, Resume>([
  ["resume-demo", {
    id: "resume-demo",
    name: "Controls résumé",
    originalName: "controls-resume.pdf",
    storageKey: "demo/controls-resume.pdf",
    isDefault: true
  }]
]);
const applications = new Map<string, Application>();
let profile: CandidateProfile = {};

export const store = {
  listJobs: () => [...jobs.values()].filter((job) => job.active),
  getJob: (id: string) => jobs.get(id),
  upsertJob: (job: Job) => jobs.set(job.id, job),
  listResumes: () => [...resumes.values()],
  getResume: (id: string) => resumes.get(id),
  saveProfile: (value: CandidateProfile) => { profile = { ...profile, ...value }; },
  getProfile: () => profile,
  saveApplication: (application: Application) => applications.set(application.id, application),
  getApplication: (id: string) => applications.get(id)
};
