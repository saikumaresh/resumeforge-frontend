import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Hardcoded test user for now (until auth is built)
export const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

// ── Master Resume ────────────────────────────────────────────────
export const getMasterResume = async (userId: string) => {
  // Returns first master resume or null
  try {
    const { data } = await api.get(`/api/v1/resumes/users/${userId}/master/first`);
    // Assemble plain-text content from sections
    if (data.sections?.length > 0) {
      data.content = data.sections.map((s: { content: string }) => s.content).join("\n\n");
    }
    return data;
  } catch (e: unknown) {
    if ((e as { response?: { status?: number } })?.response?.status === 404) return null;
    throw e;
  }
};

export const createMasterResume = async (userId: string, content: string) => {
  const { data } = await api.put(`/api/v1/resumes/users/${userId}/master`, { content });
  data.content = content;
  return data;
};

export const updateMasterResume = async (userId: string, content: string) => {
  const { data } = await api.put(`/api/v1/resumes/users/${userId}/master`, { content });
  data.content = content;
  return data;
};

// ── Tailored Resumes ─────────────────────────────────────────────
export const tailorResume = async (
  masterResumeId: string,
  payload: {
    userId: string;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    requiredSkills?: string;
  }
) => {
  const { data } = await api.post(
    `/api/v1/resumes/${masterResumeId}/tailor`,
    payload
  );
  return data;
};

export const getTailoredResume = async (tailoredId: string) => {
  const { data } = await api.get(`/api/v1/resumes/tailored/${tailoredId}`);
  return data;
};

export const getUserTailoredResumes = async (userId: string) => {
  const { data } = await api.get(`/api/v1/resumes/users/${userId}/tailored`);
  return data;
};

export const retryTailoring = async (tailoredId: string) => {
  const { data } = await api.post(`/api/v1/resumes/tailored/${tailoredId}/retry`);
  return data;
};

export const updateTailoredSections = async (
  tailoredId: string,
  sections: Record<string, string>
) => {
  const { data } = await api.put(
    `/api/v1/resumes/tailored/${tailoredId}/sections`,
    { sections }
  );
  return data;
};

export const chatWithResume = async (
  tailoredId: string,
  payload: {
    message: string;
    sections: Record<string, string>;
    targetSection?: string;
  }
): Promise<{
  reply: string;
  suggestedSection?: string;
  suggestedContent?: string;
}> => {
  const { data } = await api.post(
    `/api/v1/resumes/tailored/${tailoredId}/chat`,
    payload
  );
  return data;
};

export const pollTailoredResume = async (
  tailoredId: string,
  onUpdate: (status: string, data: unknown) => void,
  maxAttempts = 24
): Promise<unknown> => {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const data = await getTailoredResume(tailoredId);
    onUpdate(data.status, data);
    if (data.status === "COMPLETED" || data.status === "FAILED") {
      return data;
    }
  }
  throw new Error("Tailoring timed out");
};
