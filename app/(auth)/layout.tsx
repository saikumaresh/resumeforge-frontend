import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#0C0C0E" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10 group">
        <div
          className="h-8 w-8 rounded-xl flex items-center justify-center"
          style={{ background: "#10B981" }}
        >
          <Zap className="h-4 w-4 text-white" fill="white" strokeWidth={2.5} />
        </div>
        <span
          className="font-semibold text-[17px] tracking-tight"
          style={{ color: "#FAFAFA", fontFamily: "var(--font-heading)" }}
        >
          Resume<span style={{ color: "#10B981" }}>Forge</span>
        </span>
      </Link>

      {children}
    </div>
  );
}
