import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import type { Resume } from "./api";

export type CandidateProfile = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  authorizedInUS: boolean;
  requiresSponsorship: boolean;
};

export type StoredResume = Resume & {
  uri: string;
  mimeType?: string;
};

const API_URL_KEY = "jobpilot.apiUrl";
const PROFILE_KEY = "jobpilot.profile";
const RESUMES_KEY = "jobpilot.resumes";

export const EMPTY_PROFILE: CandidateProfile = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  authorizedInUS: true,
  requiresSponsorship: false
};

function configuredApiUrl() {
  return (Constants.expoConfig?.extra?.apiUrl as string | undefined)?.trim() ?? "";
}

export function normalizeApiUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export async function loadApiUrl() {
  const stored = await SecureStore.getItemAsync(API_URL_KEY);
  return normalizeApiUrl(stored ?? configuredApiUrl());
}

export async function saveApiUrl(value: string) {
  const normalized = normalizeApiUrl(value);
  if (normalized && !/^https?:\/\/[^/\s]+(?::\d+)?(?:\/.*)?$/i.test(normalized)) {
    throw new Error("Enter a complete server address beginning with https:// or http://.");
  }
  if (normalized) {
    await SecureStore.setItemAsync(API_URL_KEY, normalized);
  } else {
    await SecureStore.deleteItemAsync(API_URL_KEY);
  }
  return normalized;
}

export async function loadProfile(): Promise<CandidateProfile> {
  const stored = await SecureStore.getItemAsync(PROFILE_KEY);
  if (!stored) return EMPTY_PROFILE;
  try {
    return { ...EMPTY_PROFILE, ...JSON.parse(stored) } as CandidateProfile;
  } catch {
    return EMPTY_PROFILE;
  }
}

export async function saveProfile(profile: CandidateProfile) {
  await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadResumes(): Promise<StoredResume[]> {
  const stored = await SecureStore.getItemAsync(RESUMES_KEY);
  if (!stored) return [];
  try {
    const value = JSON.parse(stored);
    return Array.isArray(value) ? value as StoredResume[] : [];
  } catch {
    return [];
  }
}

export async function saveResumes(resumes: StoredResume[]) {
  await SecureStore.setItemAsync(RESUMES_KEY, JSON.stringify(resumes));
}
