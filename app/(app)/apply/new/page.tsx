"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { getMasterResume, tailorResume, pollTailoredResume, TEST_USER_ID } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";

/* ── Form Input ──────────────────────────────────────────────── */
function FormInput({
  label, value, onChange, placeholder, required, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; required?: boolean; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5 transition-colors duration-150"
        style={{ color: focused ? "#10B981" : "#71717A" }}
      >
        {label}
        {required && <span className="ml-0.5" style={{ color: "#10B981" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150 placeholder:text-[#3F3F46]"
        style={{
          background: "#131316",
          border: `1px solid ${focused ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`,
          color: "#FAFAFA",
          boxShadow: focused ? "0 0 0 3px rgba(16,185,129,0.06)" : "none",
        }}
      />
    </div>
  );
}

/* ── Form Textarea ───────────────────────────────────────────── */
function FormTextarea({
  label, value, onChange, placeholder, required, minH = 180, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; required?: boolean; minH?: number; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label
          className="text-xs font-medium transition-colors duration-150"
          style={{ color: focused ? "#10B981" : "#71717A" }}
        >
          {label}
          {required && <span className="ml-0.5" style={{ color: "#10B981" }}>*</span>}
        </label>
        {value && (
          <span className="text-[11px] font-mono" style={{ color: "#3F3F46" }}>
            {value.length} chars
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150 resize-none placeholder:text-[#3F3F46]"
        style={{
          background: "#131316",
          border: `1px solid ${focused ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`,
          color: "#FAFAFA",
          boxShadow: focused ? "0 0 0 3px rgba(16,185,129,0.06)" : "none",
          minHeight: minH,
          fontFamily: "var(--font-sans)",
          lineHeight: 1.65,
        }}
      />
      {hint && (
        <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "#F59E0B" }}>
          <span>⚡</span> {hint}
        </p>
      )}
    </div>
  );
}

/* ── Processing Screen ───────────────────────────────────────── */
function ProcessingScreen({ company, jobTitle, progress }: {
  company: string; jobTitle: string; progress: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-20 text-center"
    >
      {/* Icon */}
      <div className="flex justify-center mb-8">
        <motion.div
          className="h-14 w-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}>
            <Sparkles className="h-6 w-6" style={{ color: "#10B981" }} />
          </motion.div>
        </motion.div>
      </div>

      <h2 className="text-lg font-semibold text-[#FAFAFA] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
        Crafting your resume
      </h2>
      <p className="text-sm text-[#71717A] mb-8">
        for <span style={{ color: "#FAFAFA" }}>{company}</span>
        <span className="mx-1.5" style={{ color: "#3F3F46" }}>·</span>
        <span style={{ color: "#71717A" }}>{jobTitle}</span>
      </p>

      {/* Progress bar */}
      <div className="rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", height: 3 }}>
        <motion.div
          className="h-full rounded-lg"
          style={{ background: "#10B981" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-[#52525B] mt-3">Usually takes 10–20 seconds</p>
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function NewApplicationPage() {
  const router = useRouter();
  const { masterResume, setMasterResume, setCurrentJob } = useAppStore();
  const { user } = useAuthStore();
  const userId = user?.userId ?? TEST_USER_ID;

  const [form, setForm] = useState({ companyName: "", jobTitle: "", jobDescription: "", requiredSkills: "" });
  const [hasMaster, setHasMaster] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (masterResume) { setHasMaster(true); return; }
    getMasterResume(userId)
      .then((data) => { setMasterResume(data); setHasMaster(!!data); })
      .catch(() => setHasMaster(false));
  }, [masterResume, setMasterResume]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterResume) { setError("Please set up your master resume first."); return; }
    setError("");
    setTailoring(true);
    setProgress(15);

    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress(p => p < 85 ? p + Math.random() * 8 : p);
    }, 2000);

    try {
      setCurrentJob(form.companyName, form.jobTitle);
      const result = await tailorResume(masterResume.id, { userId, ...form });
      setProgress(90);
      await pollTailoredResume(result.id, (status) => {
        if (status === "PROCESSING") setProgress(95);
      });
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => router.push(`/apply/${result.id}`), 300);
    } catch {
      clearInterval(progressInterval);
      setTailoring(false);
      setProgress(0);
      setError("Tailoring failed. Please try again.");
    }
  };

  const set = (field: string) => (v: string) => setForm(f => ({ ...f, [field]: v }));
  const canSubmit = form.companyName && form.jobTitle && form.jobDescription && hasMaster;

  if (tailoring) {
    return <ProcessingScreen company={form.companyName} jobTitle={form.jobTitle} progress={progress} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-[#FAFAFA]" style={{ fontFamily: "var(--font-heading)" }}>
          Tailor your resume
        </h1>
        <p className="text-sm text-[#71717A] mt-1">
          Paste the job details and our AI will optimise your resume for maximum ATS score.
        </p>
      </div>

      {/* No master resume warning */}
      <AnimatePresence>
        {!hasMaster && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2.5 p-3.5 rounded-lg mb-5"
            style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#F59E0B" }} />
            <p className="text-sm text-[#A1A1AA]">
              You haven&apos;t set up a master resume yet.{" "}
              <a href="/resume" className="underline font-medium" style={{ color: "#F59E0B" }}>
                Set it up here
              </a>{" "}
              before tailoring.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div
          className="rounded-xl p-5 space-y-5"
          style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Company name" value={form.companyName}
              onChange={set("companyName")} placeholder="e.g. Google" required
            />
            <FormInput
              label="Job title" value={form.jobTitle}
              onChange={set("jobTitle")} placeholder="e.g. Software Engineer" required
            />
          </div>

          <FormTextarea
            label="Job description"
            value={form.jobDescription}
            onChange={set("jobDescription")}
            placeholder={"Paste the full job description here — the more detail, the better the AI tailoring.\n\nInclude:\n• Role responsibilities and day-to-day tasks\n• Required skills, languages, and frameworks\n• Years of experience required\n• Nice-to-have qualifications\n\nAim for at least 200 characters for best results."}
            required
            minH={200}
            hint={
              form.jobDescription.length > 0 && form.jobDescription.length < 200
                ? `${200 - form.jobDescription.length} more characters recommended for best results`
                : undefined
            }
          />

          <FormInput
            label="Required skills (optional — boosts ATS match)"
            value={form.requiredSkills}
            onChange={set("requiredSkills")}
            placeholder="e.g. Java, Spring Boot, Kafka, Docker, PostgreSQL"
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm mt-3 text-[#EF4444]"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
          style={canSubmit ? {
            background: "#10B981",
            color: "#0C0C0E",
            fontFamily: "var(--font-heading)",
          } : {
            background: "#1C1C1F",
            color: "#52525B",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {canSubmit ? (
            <>
              <Sparkles className="h-4 w-4" />
              Tailor my resume with AI
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4" />
              Fill in all required fields
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
