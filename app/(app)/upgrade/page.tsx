"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Loader2, Crown, Sparkles } from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const FREE_FEATURES = [
  "5 tailored applications/month",
  "ATS keyword scoring",
  "Basic resume editor",
  "Email + Google sign-in",
];

const PRO_FEATURES = [
  "Unlimited tailored applications",
  "Priority AI processing",
  "Advanced ATS analytics",
  "PDF export with custom formatting",
  "AI chat for resume improvement",
  "Priority support",
];

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  prefill: { name: string; email: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

export default function UpgradePage() {
  const { user, isPro, setAuth, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isProUser = isPro();
  const razorpayConfigured = !!(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
    !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes("YOUR_KEY")
  );

  const loadRazorpayScript = () => new Promise<boolean>((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleUpgrade = async () => {
    if (!razorpayConfigured) {
      setError("Payment gateway not yet configured. Please check back soon!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway.");

      const order = await createRazorpayOrder();

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ResumeForge",
        description: "PRO Plan — Monthly",
        order_id: order.orderId,
        handler: async (response) => {
          try {
            const result = await verifyRazorpayPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (result.status === "success") {
              // Upgrade user in store
              if (user && token) {
                setAuth(token, { ...user, plan: "PRO" });
              }
              setSuccess(true);
            }
          } catch {
            setError("Payment verification failed. Contact support with your payment ID.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name:  user?.name  ?? "",
          email: user?.email ?? "",
        },
        theme: { color: "#10B981" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (err as Error).message
        ?? "Payment failed. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  if (success || isProUser) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto mt-16 text-center"
      >
        <div className="flex justify-center mb-6">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            <Crown className="h-8 w-8" style={{ color: "#10B981" }} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#FAFAFA] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          {success ? "Welcome to PRO! 🎉" : "You're on the PRO plan"}
        </h2>
        <p className="text-sm text-[#71717A] mb-6">
          {success
            ? "Your account has been upgraded. Enjoy unlimited tailored applications."
            : "You have access to all PRO features."}
        </p>
        <a
          href="/apply/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 hover:opacity-90"
          style={{ background: "#10B981", color: "#0C0C0E", fontFamily: "var(--font-heading)" }}
        >
          <Sparkles className="h-4 w-4" /> Start tailoring
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-[#FAFAFA] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Upgrade to PRO
        </h1>
        <p className="text-sm text-[#71717A]">
          Unlimited AI tailoring, advanced analytics, priority processing.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Free */}
        <div
          className="rounded-xl p-6"
          style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="mb-4">
            <p className="text-xs font-semibold text-[#52525B] uppercase tracking-widest mb-1">Free</p>
            <p className="text-3xl font-bold text-[#FAFAFA]" style={{ fontFamily: "var(--font-heading)" }}>
              ₹0<span className="text-base font-normal text-[#52525B]">/mo</span>
            </p>
          </div>
          <ul className="space-y-2.5 mb-6">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#71717A]">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#3F3F46" }} />
                {f}
              </li>
            ))}
          </ul>
          <div
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-center"
            style={{ background: "rgba(255,255,255,0.05)", color: "#52525B", fontFamily: "var(--font-heading)" }}
          >
            Current plan
          </div>
        </div>

        {/* PRO */}
        <div
          className="rounded-xl p-6 relative overflow-hidden"
          style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.25)" }}
        >
          <div className="absolute top-3 right-3">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}
            >
              Most popular
            </span>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#10B981" }}>PRO</p>
            <p className="text-3xl font-bold text-[#FAFAFA]" style={{ fontFamily: "var(--font-heading)" }}>
              ₹499<span className="text-base font-normal text-[#71717A]">/mo</span>
            </p>
            <p className="text-xs text-[#52525B] mt-0.5">Billed monthly. Cancel anytime.</p>
          </div>
          <ul className="space-y-2.5 mb-6">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#10B981" }} />
                {f}
              </li>
            ))}
          </ul>

          {error && (
            <p className="text-xs text-[#EF4444] bg-[rgba(239,68,68,0.07)] px-3 py-2 rounded-lg mb-3 border border-[rgba(239,68,68,0.15)]">
              {error}
            </p>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-50 hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
            style={{ background: "#10B981", color: "#0C0C0E", fontFamily: "var(--font-heading)" }}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            ) : (
              <><Zap className="h-4 w-4" fill="currentColor" /> {razorpayConfigured ? "Upgrade to PRO" : "Coming soon"}</>
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-[#3F3F46] mt-8">
        Payments are processed securely by{" "}
        <span style={{ color: "#52525B" }}>Razorpay</span>. Your card details are never stored on our servers.
      </p>
    </motion.div>
  );
}
