export interface User {
  id: string;
  email: string;
  name: string;
}

export interface MasterResume {
  id: string;
  userId: string;
  content: string;
  templateType: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceFile {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export interface ATSBreakdown {
  totalScore: number;
  keywordScore: number;
  sectionScore: number;
  actionVerbScore: number;
  missingKeywords: string;
}

export interface TailoredResume {
  id: string;
  masterResumeId: string;
  jobDescriptionId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  atsScore: number | null;
  keywordScore: number | null;
  sectionScore: number | null;
  actionVerbScore: number | null;
  missingKeywords: string | null;
  tailoredSections: Record<string, string> | null;
  pdfDownloadUrl: string | null;
  createdAt: string;
  // joined fields
  companyName?: string;
  jobTitle?: string;
}

export interface JobDescription {
  id: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills?: string;
}

export interface NewApplicationForm {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string;
  baseResumeId: string;
}
