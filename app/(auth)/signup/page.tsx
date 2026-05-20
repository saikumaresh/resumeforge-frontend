"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { register } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

function StrengthBar({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const colors = ["#EF4444", "#F59E0B", "#F59E0B", "#10B981", "#10B981"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : "rgba(255,255,255,0.07)" }}
          />
        ))}
      </div>
      <p className="text-[11px]" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setLoading(true);
    try {
      const data = await register({ name, email, password });
      setAuth(data.token, { userId: data.userId, name: data.name, email: data.email });
      document.cookie = `rf-auth-token=${data.token}; path=/; max-age=${7 * 86400}; SameSite=Lax`;
      router.push("/resume"); // Send new users to set up their master resume first
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    "AI tailors your resume for each job description",
    "ATS keyword scoring with actionable insights",
    "Unlimited tailored applications",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm"
    >
      <div className="text-center mb-7">
        <h1
          className="text-2xl font-bold text-[#FAFAFA] mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Create your account
        </h1>
        <p className="text-sm text-[#71717A]">Free forever — no credit card needed</p>
      </div>

      {/* Perks */}
      <div className="flex flex-col gap-1.5 mb-6">
        {perks.map(p => (
          <div key={p} className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#10B981" }} />
            <span className="text-xs text-[#71717A]">{p}</span>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-6 space-y-4"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[#71717A] mb-1.5">Full name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jane Smith"
            required
            autoComplete="name"
            className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150 placeholder:text-[#3F3F46]"
            style={{ background: "#0C0C0E", border: "1px solid rgba(255,255,255,0.08)", color: "#FAFAFA" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)")}
            onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-[#71717A] mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150 placeholder:text-[#3F3F46]"
            style={{ background: "#0C0C0E", border: "1px solid rgba(255,255,255,0.08)", color: "#FAFAFA" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)")}
            onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-[#71717A] mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm outline-none transition-all duration-150 placeholder:text-[#3F3F46]"
              style={{ background: "#0C0C0E", border: "1px solid rgba(255,255,255,0.08)", color: "#FAFAFA" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)")}
              onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              className="absolute right-3 top-[13px]"
              style={{ color: "#52525B" }}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <StrengthBar password={password} />
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-[#EF4444] bg-[rgba(239,68,68,0.07)] px-3 py-2 rounded-lg border border-[rgba(239,68,68,0.15)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !name || !email || password.length < 8}
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-40 hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
          style={{ background: "#10B981", color: "#0C0C0E", fontFamily: "var(--font-heading)" }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account…" : "Create free account"}
        </button>
      </form>

      <p className="text-center text-sm text-[#52525B] mt-5">
        Already have an account?{" "}
        <Link href="/login" className="font-medium transition-colors hover:text-[#6EE7B7]" style={{ color: "#10B981" }}>
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
