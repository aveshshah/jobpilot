import Constants from "expo-constants";

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

const configured = Constants.expoConfig?.extra?.apiUrl as string | undefined;
const API_URL = configured ?? "http://10.0.2.2:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    }
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
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
