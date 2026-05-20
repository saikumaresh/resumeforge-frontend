"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Zap, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resume",    label: "My Resume"  },
];

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // Clear the cookie middleware reads
    document.cookie = "rf-auth-token=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  };

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

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* New Application CTA */}
          <Link
            href="/apply/new"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-95"
            style={{ background: "#10B981", color: "#0C0C0E", fontFamily: "var(--font-heading)" }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            New Application
          </Link>

          {/* User avatar + logout */}
          {user && (
            <div className="flex items-center gap-1">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                title={user.email}
                style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                {user.name?.[0]?.toUpperCase() ?? <User className="h-3.5 w-3.5" />}
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-150 hover:bg-white/5"
                style={{ color: "#52525B" }}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
