"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Zap } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resume", label: "My Resume" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 w-full glass"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{ background: "#10B981" }}
          >
            <Zap className="h-3.5 w-3.5 text-white" fill="white" strokeWidth={2.5} />
          </div>
          <span
            className="font-semibold text-[15px] tracking-tight"
            style={{ color: "#FAFAFA", fontFamily: "var(--font-heading)" }}
          >
            Resume<span style={{ color: "#10B981" }}>Forge</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="relative px-4 py-2 text-sm font-medium transition-colors duration-150 rounded-md"
                style={{ color: isActive ? "#FAFAFA" : "#71717A" }}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                    style={{ background: "#10B981" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <Link
          href="/apply/new"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{
            background: "#10B981",
            color: "#0C0C0E",
            fontFamily: "var(--font-heading)",
          }}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          New Application
        </Link>
      </div>
    </header>
  );
}
