"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const FREE_FEATURES = [
  "Unlimited tailored applications",
  "ATS keyword scoring",
  "AI resume chat assistant",
  "Resume section editor",
  "Email sign-in",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Priority AI processing",
  "Advanced ATS analytics",
  "PDF export with custom formatting",
  "Priority support",
];

export default function UpgradePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-2xl font-bold text-[#FAFAFA] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Plans
        </h1>
        <p className="text-sm text-[#71717A]">
          ResumeForge is free while we&apos;re in beta. PRO plan coming soon.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Free — current */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "rgba(16,185,129,0.05)",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4" style={{ color: "#10B981" }} />
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#10B981" }}
            >
              Free · Current plan
            </p>
          </div>
          <p
            className="text-3xl font-bold text-[#FAFAFA] mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ₹0<span className="text-base font-normal text-[#52525B]">/mo</span>
          </p>
          <ul className="space-y-2.5 mb-6">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <CheckCircle2
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: "#10B981" }}
                />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/apply/new"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.99]"
            style={{
              background: "#10B981",
              color: "#0C0C0E",
              fontFamily: "var(--font-heading)",
            }}
          >
            <Sparkles className="h-4 w-4" />
            Start tailoring
          </Link>
        </div>

        {/* PRO — coming soon */}
        <div
          className="rounded-xl p-6 relative overflow-hidden opacity-60"
          style={{
            background: "#131316",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="absolute top-3 right-3">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#52525B",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Coming soon
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-4 w-4" style={{ color: "#52525B" }} />
            <p className="text-xs font-semibold uppercase tracking-widest text-[#52525B]">
              PRO
            </p>
          </div>
          <p
            className="text-3xl font-bold text-[#52525B] mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ₹499<span className="text-base font-normal">/mo</span>
          </p>
          <ul className="space-y-2.5 mb-6">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#3F3F46]">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#3F3F46]" />
                {f}
              </li>
            ))}
          </ul>
          <div
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-center cursor-not-allowed"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "#3F3F46",
              fontFamily: "var(--font-heading)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            Coming soon
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-[#3F3F46] mt-8">
        All features are free during our beta period. No credit card required.
      </p>
    </motion.div>
  );
}
