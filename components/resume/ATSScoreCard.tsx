"use client";
import { motion } from "framer-motion";
import { TailoredResume } from "@/types";
import { getScoreLabel } from "@/lib/utils";
import { AlertCircle, TrendingUp } from "lucide-react";

interface Props {
  resume: TailoredResume;
}

/* ── Circular SVG Score Ring ─────────────────────────────────── */
function CircularScore({ score }: { score: number }) {
  const size = 120;
  const strokeWidth = 7;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#EAB308" : "#EF4444";
  const glowColor = score >= 80 ? "rgba(34,197,94,0.5)" : score >= 60 ? "rgba(234,179,8,0.5)" : "rgba(239,68,68,0.5)";

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width={size} height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" strokeWidth={strokeWidth}
            stroke="rgba(34,197,94,0.1)"
          />
          {/* Fill */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" strokeWidth={strokeWidth}
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={`${circ}`}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - fill }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
          />
        </svg>
        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: "none" }}>
          <motion.span
            className="text-3xl font-black leading-none"
            style={{ color, fontFamily: "var(--font-heading)" }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-[#6B7280] uppercase tracking-widest mt-0.5">/ 100</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
        style={{
          background: `${color}15`,
          border: `1px solid ${color}30`,
          color,
        }}
      >
        {getScoreLabel(score)}
      </motion.div>
    </div>
  );
}

/* ── Score Bar ───────────────────────────────────────────────── */
function ScoreBar({ label, value, max, delay = 0 }: {
  label: string; value: number; max: number; delay?: number;
}) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 80 ? "#22C55E" : pct >= 55 ? "#EAB308" : "#EF4444";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#6B7280] font-medium">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>
          {value}<span className="text-[#374151] font-normal">/{max}</span>
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: "rgba(34,197,94,0.08)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────── */
export default function ATSScoreCard({ resume }: Props) {
  const score = resume.atsScore ?? 0;
  const missing = resume.missingKeywords
    ? resume.missingKeywords.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-20 rounded-2xl overflow-hidden"
      style={{ background: "#0D1B12", border: "1px solid rgba(34,197,94,0.12)" }}
    >
      {/* Header */}
      <div
        className="px-5 pt-5 pb-4 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(34,197,94,0.08)" }}
      >
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          <TrendingUp className="h-3.5 w-3.5" style={{ color: "#22C55E" }} />
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "#22C55E" }}
        >
          ATS Score
        </span>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Circular ring */}
        <div className="flex justify-center">
          <CircularScore score={score} />
        </div>

        {/* Score breakdown */}
        <div
          className="p-4 rounded-xl space-y-3.5"
          style={{ background: "#060D09", border: "1px solid rgba(34,197,94,0.06)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>
            Score Breakdown
          </p>
          <ScoreBar label="Keywords" value={resume.keywordScore ?? 0} max={50} delay={0.3} />
          <ScoreBar label="Sections" value={resume.sectionScore ?? 0} max={30} delay={0.45} />
          <ScoreBar label="Action Verbs" value={resume.actionVerbScore ?? 0} max={20} delay={0.6} />
        </div>

        {/* Missing keywords */}
        {missing.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-2.5"
          >
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "#F97316" }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#F97316" }}>
                Missing Keywords
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missing.slice(0, 10).map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={{
                    background: "rgba(249,115,22,0.08)",
                    border: "1px solid rgba(249,115,22,0.2)",
                    color: "#F97316",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
            <p className="text-[11px]" style={{ color: "#475569" }}>
              Add these to boost your score.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
