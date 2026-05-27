"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthUser } from "@/store/useAuthStore";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const next = searchParams.get("next") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      const user: AuthUser = { userId: data.userId, name: data.name, email: data.email, plan: data.plan ?? "FREE" };
      setAuth(data.token, user);
      document.cookie = `rf-auth-token=${data.token}; path=/; max-age=${7 * 86400}; SameSite=Lax`;
      router.push(next);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm"
    >
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-[#FAFAFA] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          Welcome back
        </h1>
        <p className="text-sm text-[#71717A]">Sign in to your ResumeForge account</p>
      </div>

      <div
        className="rounded-xl p-6 space-y-4"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="text-xs font-medium text-[#71717A]">Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm outline-none transition-all duration-150 placeholder:text-[#3F3F46]"
                style={{ background: "#0C0C0E", border: "1px solid rgba(255,255,255,0.08)", color: "#FAFAFA" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)")}
                onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#52525B" }}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#EF4444] bg-[rgba(239,68,68,0.07)] px-3 py-2 rounded-lg border border-[rgba(239,68,68,0.15)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-40 hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
            style={{ background: "#10B981", color: "#0C0C0E", fontFamily: "var(--font-heading)" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[#52525B] mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium transition-colors hover:text-[#6EE7B7]" style={{ color: "#10B981" }}>
          Sign up free
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
