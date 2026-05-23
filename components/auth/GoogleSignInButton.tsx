"use client";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { googleAuth } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthUser } from "@/store/useAuthStore";

interface Props {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  label?: string;
}

export default function GoogleSignInButton({ onSuccess, onError, label = "Continue with Google" }: Props) {
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const configured = !!(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE"
  );

  if (!configured) {
    return (
      <div
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed"
        style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#71717A" }}
        title="Google OAuth not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local"
      >
        <GoogleIcon />
        {label} (not configured)
      </div>
    );
  }

  const handleCredentialResponse = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      onError?.("Google sign-in failed.");
      return;
    }
    setLoading(true);
    try {
      const data = await googleAuth(credentialResponse.credential);
      const user: AuthUser = {
        userId: data.userId,
        name: data.name,
        email: data.email,
        plan: data.plan ?? "FREE",
        pictureUrl: data.pictureUrl,
      };
      setAuth(data.token, user);
      // Set cookie for middleware
      document.cookie = `rf-auth-token=${data.token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Google sign-in failed. Please try again.";
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <GoogleLogin
        onSuccess={handleCredentialResponse}
        onError={() => onError?.("Google sign-in was cancelled or failed.")}
        useOneTap={false}
        theme="filled_black"
        size="large"
        width="100%"
        text={label === "Continue with Google" ? "continue_with" : "signup_with"}
        shape="rectangular"
      />
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg"
          style={{ background: "rgba(12,12,14,0.7)" }}
        >
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#10B981" }} />
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
