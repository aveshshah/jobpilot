import { loadApiUrl } from "./storage";

export type Job = {
  id: string;
  source: "linkedin_alert" | "indeed_alert";
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  postedAt?: string;
  active: boolean;
  matchScore: number;
};

export type Resume = {
  id: string;
  name: string;
  originalName: string;
  isDefault: boolean;
};

export class ApiNotConfiguredError extends Error {
  constructor() {
    super("JobPilot server is not configured. Open Profile and enter the server address.");
    this.name = "ApiNotConfiguredError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const apiUrl = await loadApiUrl();
  if (!apiUrl) throw new ApiNotConfiguredError();

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      }
    });
  } catch {
    throw new Error("Cannot reach the JobPilot server. Check the server address and your network.");
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  configured: async () => Boolean(await loadApiUrl()),
  health: () => request<{ ok: true }>("/health"),
  jobs: () => request<{ jobs: Job[] }>("/jobs"),
  job: (id: string) => request<{ job: Job }>(`/jobs/${id}`),
  resumes: () => request<{ resumes: Resume[] }>("/resumes"),
  apply: (jobId: string, resumeId?: string) =>
    request<{ applicationId: string; status: string; reason?: string }>("/applications", {
      method: "POST",
      body: JSON.stringify({ jobId, resumeId, mode: "immediate" })
    }),
  saveProfile: (profile: Record<string, unknown>) =>
    request<{ saved: true }>("/profile", {
      method: "PUT",
      body: JSON.stringify(profile)
    })
};
