"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Download, Save, Loader2, CheckCircle2, RefreshCw, Sparkles,
} from "lucide-react";
import ResumeEditor from "@/components/resume/ResumeEditor";
import AIChatPanel from "@/components/chat/AIChatPanel";
import { getTailoredResume, updateTailoredSections, pollTailoredResume, retryTailoring } from "@/lib/api";
import { TailoredResume } from "@/types";
import { useAppStore } from "@/store/useAppStore";

/* ── Inline ATS Score bar ────────────────────────────────────── */
function InlineATSScore({ resume }: { resume: TailoredResume }) {
  const score = resume.atsScore ?? 0;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  const label = score >= 80 ? "Strong match" : score >= 60 ? "Good match" : "Needs work";
  const missing = resume.missingKeywords
    ? resume.missingKeywords.split(",").map(s => s.trim()).filter(Boolean).slice(0, 6)
    : [];
  const keyword = resume.keywordScore ?? 0;
  const section = resume.sectionScore ?? 0;
  const action = resume.actionVerbScore ?? 0;

  return (
    <div
      className="no-print rounded-lg px-4 py-3 mb-5"
      style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Score row */}
      <div className="flex items-center gap-3 mb-2">
        <motion.span
          className="text-2xl font-bold tabular-nums"
          style={{ color, fontFamily: "var(--font-heading)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {score}
        </motion.span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium" style={{ color: "#71717A" }}>ATS Score</span>
            <span className="text-xs font-medium" style={{ color }}>{label}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
        <span className="text-xs" style={{ color: "#3F3F46" }}>/100</span>
      </div>

      {/* Sub-scores */}
      <div className="flex items-center gap-4 mb-2.5">
        {[
          { label: "Keywords", val: keyword, max: 100 },
          { label: "Sections", val: section, max: 100 },
          { label: "Verbs",    val: action,  max: 100 },
        ].map(({ label: l, val, max }) => {
          const pct = Math.round((val / max) * 100);
          const c = pct >= 80 ? "#10B981" : pct >= 55 ? "#F59E0B" : "#EF4444";
          return (
            <div key={l} className="flex items-center gap-1.5">
              <div className="h-1 w-12 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: c }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-[11px]" style={{ color: "#52525B" }}>
                {l} {val}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Missing keywords */}
      {missing.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[#71717A]">Add to improve:</span>
          {missing.map(kw => (
            <span
              key={kw}
              className="text-[11px] px-2 py-0.5 rounded-md font-medium"
              style={{
                background: "rgba(239,68,68,0.07)",
                color: "#F87171",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Polling screen ──────────────────────────────────────────── */
function PollingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-28 text-center"
    >
      <motion.div
        className="h-12 w-12 rounded-xl flex items-center justify-center mb-5"
        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <Sparkles className="h-5 w-5" style={{ color: "#10B981" }} />
      </motion.div>
      <h3 className="text-base font-semibold text-[#FAFAFA] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
        Your resume is being tailored
      </h3>
      <p className="text-sm text-[#71717A]">The AI is crafting the perfect content…</p>
    </motion.div>
  );
}

/* ── Auto-save badge ─────────────────────────────────────────── */
function AutoSaveBadge({ state }: { state: "idle" | "saving" | "saved" }) {
  if (state === "idle") return null;
  return (
    <AnimatePresence>
      <motion.span
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-1 text-[11px]"
        style={{ color: state === "saved" ? "#10B981" : "#71717A" }}
      >
        {state === "saving"
          ? <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
          : <><CheckCircle2 className="h-3 w-3" /> Saved</>
        }
      </motion.span>
    </AnimatePresence>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentJobCompany, currentJobTitle } = useAppStore();

  const [resume, setResume] = useState<TailoredResume | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [polling, setPolling] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Track whether sections have unsaved changes
  const dirtyRef = useRef(false);
  const resumeRef = useRef<TailoredResume | null>(null);
  resumeRef.current = resume;

  // ── Load ─────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const data = await getTailoredResume(id);
      setResume(data);
      if (data.tailoredSections) setSections(data.tailoredSections);
      if (data.status === "PENDING" || data.status === "PROCESSING") {
        setPolling(true);
        await pollTailoredResume(id, (status, updated) => {
          if (status === "COMPLETED" || status === "FAILED") {
            const u = updated as TailoredResume;
            setResume(u);
            if (u.tailoredSections) setSections(u.tailoredSections);
            setPolling(false);
          }
        });
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Auto-save (debounced 2 s after last change) ───────────────
  useEffect(() => {
    if (!dirtyRef.current) return;
    const current = resumeRef.current;
    if (!current || current.status !== "COMPLETED") return;

    const timer = setTimeout(async () => {
      setAutoSaveState("saving");
      try {
        await updateTailoredSections(current.id, sections);
        setAutoSaveState("saved");
        dirtyRef.current = false;
        setTimeout(() => setAutoSaveState("idle"), 2500);
      } catch {
        setAutoSaveState("idle");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [sections]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSectionChange = (key: string, value: string) => {
    dirtyRef.current = true;
    setSections(s => ({ ...s, [key]: value }));
  };

  // ── Retry tailoring ───────────────────────────────────────────
  const handleRetry = async () => {
    if (!resume || retrying) return;
    setRetrying(true);
    setPolling(true);
    try {
      await retryTailoring(id);
      setResume(r => r ? { ...r, status: "PENDING" } : r);
      setSections({});
      await pollTailoredResume(id, (status, updated) => {
        if (status === "COMPLETED" || status === "FAILED") {
          const u = updated as TailoredResume;
          setResume(u);
          if (u?.tailoredSections) setSections(u.tailoredSections);
          setPolling(false);
          setRetrying(false);
        }
      });
    } catch {
      setPolling(false);
      setRetrying(false);
    }
  };

  // ── PDF export ────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (resume?.pdfDownloadUrl) {
      window.open(`http://localhost:8081${resume.pdfDownloadUrl}`, "_blank");
    } else {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2" style={{ color: "#71717A" }}>
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#10B981" }} />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-[#71717A] mb-3">Application not found.</p>
        <button onClick={() => router.push("/dashboard")} className="text-sm underline" style={{ color: "#10B981" }}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const company = resume.companyName || currentJobCompany || "Company";
  const jobTitle = resume.jobTitle || currentJobTitle || "Role";
  const isCompleted = resume.status === "COMPLETED";

  return (
    <>
      {/* ── Print styles: show only resume sections ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: #111 !important; margin: 0; }
          * { box-shadow: none !important; }
          .print-resume-container { display: block !important; }
          .print-resume-section {
            background: white !important;
            border: none !important;
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
          }
          .print-resume-section .section-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #6b7280 !important;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-bottom: 8px;
          }
          .print-resume-section .section-content {
            font-size: 12px;
            line-height: 1.7;
            color: #111 !important;
            white-space: pre-wrap;
          }
        }
      `}</style>

      <div className="space-y-0">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="no-print flex items-center justify-between gap-4 mb-5"
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1 text-sm font-medium transition-colors duration-150 hover:text-[#FAFAFA] flex-shrink-0"
              style={{ color: "#52525B" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <span style={{ color: "#27272A" }}>/</span>
            <h1
              className="text-sm font-semibold text-[#FAFAFA] truncate"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {company}
              <span className="mx-1.5 font-normal" style={{ color: "#3F3F46" }}>·</span>
              <span style={{ color: "#A1A1AA", fontWeight: 400 }}>{jobTitle}</span>
            </h1>
            {polling && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-md animate-pulse flex-shrink-0"
                style={{ background: "rgba(245,158,11,0.08)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.15)" }}
              >
                Processing
              </span>
            )}
          </div>

          {isCompleted && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Auto-save indicator */}
              <AutoSaveBadge state={autoSaveState} />

              {/* Export PDF */}
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 hover:opacity-90 active:scale-95"
                style={{
                  background: "#10B981",
                  color: "#0C0C0E",
                  fontFamily: "var(--font-heading)",
                }}
              >
                <Download className="h-3 w-3" />
                Export PDF
              </button>
            </div>
          )}
        </motion.div>

        {/* Polling */}
        {polling && <PollingScreen />}

        {/* Two-column layout */}
        {isCompleted && !polling && (
          <div className="flex gap-5 items-start">
            {/* LEFT — Resume */}
            <div className="flex-1 min-w-0">
              <InlineATSScore resume={resume} />
              <ResumeEditor sections={sections} onChange={handleSectionChange} />
            </div>

            {/* RIGHT — AI Chat */}
            <div
              className="no-print flex-shrink-0 sticky top-20"
              style={{ width: 360, height: "calc(100vh - 120px)" }}
            >
              <AIChatPanel
                tailoredId={resume.id}
                sections={sections}
                onApplySuggestion={(key, content) => {
                  handleSectionChange(key, content);
                }}
              />
            </div>
          </div>
        )}

        {/* Failed */}
        {resume.status === "FAILED" && !polling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-20 text-center"
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <RefreshCw className="h-5 w-5" style={{ color: "#EF4444" }} />
            </div>
            <h3 className="text-base font-semibold text-[#FAFAFA] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Tailoring failed
            </h3>
            <p className="text-sm text-[#71717A] mb-5">Something went wrong. Please try again.</p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: "#10B981", color: "#0C0C0E", fontFamily: "var(--font-heading)" }}
            >
              {retrying
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />}
              {retrying ? "Retrying…" : "Try Again"}
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}
