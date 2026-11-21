export type Discipline = "PT" | "OT" | "SLP" | "PTA" | "OTA";

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  PT: "Physical Therapist",
  OT: "Occupational Therapist",
  SLP: "Speech-Language Pathologist",
  PTA: "Physical Therapy Assistant",
  OTA: "Occupational Therapy Assistant",
};

export const DISCIPLINE_TAXONOMY: Record<Discipline, string[]> = {
  PT: ["225100000X"],
  OT: ["225X00000X"],
  SLP: ["235Z00000X"],
  PTA: ["225200000X"],
  OTA: ["224Z00000X"],
};

export interface License {
  type: string;
  state: string;
  number?: string;
  expiration?: string;
  status?: "Active" | "Expired" | "Unknown";
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  credentials?: string;
  discipline: Discipline;
  npi?: string;
  phone?: string;
  email?: string;
  linkedinUrl?: string;
  city?: string;
  state?: string;
  zip?: string;
  licenses: License[];
  yearsExperience?: number;
  degree?: string;
  specialties?: string[];
  preferredSettings?: string[];
  employmentPreferences?: string[];
  telehealthCapable?: boolean;
  source: "NPPES" | "Imported" | "Manual" | "Self-registered";
  dateAdded: string;
  notes?: string;
  resumeUrl?: string;
}

export interface SearchFilters {
  disciplines: Discipline[];
  city?: string;
  state?: string;
  zip?: string;
  radius?: number;
  keyword?: string;
}

export interface NPPESResult {
  npi: string;
  firstName: string;
  lastName: string;
  credentials?: string;
  taxonomy: string;
  taxonomyDesc: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  address?: string;
}