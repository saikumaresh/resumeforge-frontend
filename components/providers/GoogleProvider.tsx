"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  // If not configured, still render children (Google button just won't work)
  if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID_HERE") {
    return <>{children}</>;
  }
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
