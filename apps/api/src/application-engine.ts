import { randomUUID } from "node:crypto";
import { Application, CandidateProfile, Job, Resume } from "./domain.js";

const REQUIRED_PROFILE_FIELDS: (keyof CandidateProfile)[] = [
  "fullName", "email", "phone", "authorizedInUS", "requiresSponsorship"
];

export type SubmissionAdapter = {
  supports(job: Job): boolean;
  submit(job: Job, profile: CandidateProfile, resume: Resume): Promise<{ receipt: string }>;
};

export class DemoAdapter implements SubmissionAdapter {
  supports(job: Job) {
    return new URL(job.url).hostname === "example.com";
  }
  async submit() {
    return { receipt: `demo-${randomUUID()}` };
  }
}

export function validatePreflight(profile: CandidateProfile, resume?: Resume): string[] {
  const missing = REQUIRED_PROFILE_FIELDS
    .filter((field) => profile[field] === undefined || profile[field] === "")
    .map((field) => `Missing profile field: ${field}`);
  if (!resume) missing.push("No résumé selected");
  return missing;
}

export async function submitApplication(input: {
  job: Job;
  resume?: Resume;
  profile: CandidateProfile;
  adapters: SubmissionAdapter[];
  allowRealSubmission: boolean;
}): Promise<Application> {
  const id = randomUUID();
  const problems = validatePreflight(input.profile, input.resume);
  if (problems.length) {
    return {
      id, jobId: input.job.id, resumeId: input.resume?.id ?? "",
      status: "blocked", reason: problems.join("; "), createdAt: new Date().toISOString()
    };
  }

  const adapter = input.adapters.find((candidate) => candidate.supports(input.job));
  if (!adapter) {
    return {
      id, jobId: input.job.id, resumeId: input.resume!.id,
      status: "blocked",
      reason: "No authorized submission adapter supports this application page.",
      createdAt: new Date().toISOString()
    };
  }

  if (!input.allowRealSubmission && !(adapter instanceof DemoAdapter)) {
    return {
      id, jobId: input.job.id, resumeId: input.resume!.id,
      status: "blocked", reason: "Real submission is disabled.", createdAt: new Date().toISOString()
    };
  }

  await adapter.submit(input.job, input.profile, input.resume!);
  return {
    id, jobId: input.job.id, resumeId: input.resume!.id,
    status: "submitted", createdAt: new Date().toISOString()
  };
}
