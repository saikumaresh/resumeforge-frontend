import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MasterResume, TailoredResume } from "@/types";

interface AppStore {
  masterResume: MasterResume | null;
  setMasterResume: (r: MasterResume | null) => void;

  tailoredResumes: TailoredResume[];
  addTailoredResume: (r: TailoredResume) => void;
  updateTailoredResume: (id: string, data: Partial<TailoredResume>) => void;

  currentJobCompany: string;
  currentJobTitle: string;
  setCurrentJob: (company: string, title: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      masterResume: null,
      setMasterResume: (r) => set({ masterResume: r }),

      tailoredResumes: [],
      addTailoredResume: (r) =>
        set((s) => ({ tailoredResumes: [r, ...s.tailoredResumes] })),
      updateTailoredResume: (id, data) =>
        set((s) => ({
          tailoredResumes: s.tailoredResumes.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      currentJobCompany: "",
      currentJobTitle: "",
      setCurrentJob: (company, title) =>
        set({ currentJobCompany: company, currentJobTitle: title }),
    }),
    { name: "resumeforge-store" }
  )
);
