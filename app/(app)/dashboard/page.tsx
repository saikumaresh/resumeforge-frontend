"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, AlertCircle, Zap, ArrowRight } from "lucide-react";
import { getUserTailoredResumes, TEST_USER_ID } from "@/lib/api";
import { TailoredResume } from "@/types";
import { getScoreLabel, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

/* ── Score dot ──────────────────────────────────────────────── */
function ScoreDot({ score }: { score: number }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <span
      className="inline-block h-2 w-2 rounded-full flex-shrink-0"
      style={{ background: color }}
    />
  );
}

/* ── Application Row ────────────────────────────────────────── */
function ApplicationRow({ resume, index }: { resume: TailoredResume; index: number }) {
  const score = resume.atsScore;
  const isCompleted = resume.status === "COMPLETED";
  const isPending = resume.status === "PENDING" || resume.status === "PROCESSING";
  const isFailed = resume.status === "FAILED";
  const scoreColor = score != null
    ? score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444"
    : "#52525B";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link href={`/apply/${resume.id}`}>
        <div
          className="group flex items-center gap-4 px-4 py-3.5 transition-colors duration-100 cursor-pointer rounded-lg"
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
        >
          {/* Initial avatar */}
          <div
            className="flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#A1A1AA",
              fontFamily: "var(--font-heading)",
            }}
          >
            {(resume.companyName || "?")[0].toUpperCase()}
          </div>

          {/* Job info */}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold text-[#FAFAFA] truncate"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {resume.companyName || "Unknown Company"}
            </p>
            <p className="text-xs text-[#52525B] truncate mt-0.5">
              {resume.jobTitle || "Unknown Role"}
            </p>
          </div>

          {/* Date */}
          <span className="hidden sm:block text-xs text-[#52525B] flex-shrink-0 w-20 text-right">
            {formatDate(resume.createdAt)}
          </span>

          {/* Status / Score */}
          <div className="flex-shrink-0 flex items-center gap-2 w-32 justify-end">
            {isCompleted && score != null && (
              <>
                <ScoreDot score={score} />
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: scoreColor, fontFamily: "var(--font-heading)" }}
                >
                  {score}
                </span>
                <span className="text-xs" style={{ color: "#52525B" }}>
                  {getScoreLabel(score)}
                </span>
              </>
            )}
            {isPending && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  color: "#F59E0B",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}
              >
                Processing
              </span>
            )}
            {isFailed && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                Failed
              </span>
            )}
          </div>

          <ArrowRight
            className="h-3.5 w-3.5 flex-shrink-0 transition-all duration-150 group-hover:translate-x-0.5"
            style={{ color: "#3F3F46" }}
          />
        </div>
      </Link>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginLeft: "3rem" }} />
    </motion.div>
  );
}

/* ── Empty state ────────────────────────────────────────────── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center py-24 rounded-xl"
      style={{ border: "1px dashed rgba(255,255,255,0.08)" }}
    >
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center mb-5"
        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
      >
        <Zap className="h-5 w-5" style={{ color: "#10B981" }} />
      </div>
      <h3
        className="text-base font-semibold text-[#FAFAFA] mb-1.5"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        No applications yet
      </h3>
      <p className="text-sm text-[#71717A] mb-6 text-center max-w-xs">
        Paste a job description and our AI will tailor your resume to beat the ATS.
      </p>
      <Link
        href="/apply/new"
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-95"
        style={{
          background: "#10B981",
          color: "#0C0C0E",
          fontFamily: "var(--font-heading)",
        }}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        Create first application
      </Link>
    </motion.div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const userId = user?.userId ?? TEST_USER_ID;

  const [resumes, setResumes] = useState<TailoredResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResumes = useCallback(async () => {
    try {
      const data = await getUserTailoredResumes(userId);
      setResumes(data);
    } catch {
      setError("Could not load applications");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  // Auto-refresh every 8 s while any application is pending/processing
  useEffect(() => {
    const hasPending = resumes.some(r => r.status === "PENDING" || r.status === "PROCESSING");
    if (!hasPending) return;
    const interval = setInterval(fetchResumes, 8000);
    return () => clearInterval(interval);
  }, [resumes, fetchResumes]);

  const completed = resumes.filter((r) => r.status === "COMPLETED");
  const avgScore =
    completed.length > 0
      ? Math.round(completed.reduce((s, r) => s + (r.atsScore ?? 0), 0) / completed.length)
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-xl font-bold text-[#FAFAFA]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Applications
          </h1>
          {!loading && resumes.length > 0 && (
            <p className="text-sm text-[#52525B] mt-0.5">
              {resumes.length} application{resumes.length !== 1 ? "s" : ""}
              {avgScore != null && <> · Avg. ATS {avgScore}</>}
              {completed.length > 0 && <> · {completed.length} completed</>}
            </p>
          )}
        </div>
        <Link
          href="/apply/new"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{
            background: "#10B981",
            color: "#0C0C0E",
            fontFamily: "var(--font-heading)",
          }}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          New Application
        </Link>
      </motion.div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-px">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-14 rounded-lg" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2.5 p-3.5 rounded-lg"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <AlertCircle className="h-4 w-4 text-[#EF4444] shrink-0" />
          <p className="text-sm text-[#EF4444]">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && resumes.length === 0 && <EmptyState />}

      {/* List */}
      {!loading && resumes.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {resumes.map((resume, i) => (
            <ApplicationRow key={resume.id} resume={resume} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
