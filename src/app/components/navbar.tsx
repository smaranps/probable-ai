"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Google_Sans_Flex } from "next/font/google";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-google-sans-flex",
});

interface NavbarProps {
  user?: any;
  onSignOut?: () => void;
}
export default function Navbar({ user = null, onSignOut }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user_profile");
    localStorage.removeItem("auth_token");
    window.dispatchEvent(new Event("storage"));

    if (onSignOut) {
      onSignOut();
    } else {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div
      className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-8 max-w-5xl mx-auto w-full pointer-events-auto"
      style={{ fontFamily: googleSansFlex.style.fontFamily }}
    >
      <nav className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl px-6 py-3.5 shadow-xl shadow-slate-950/10 transition-all duration-300">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-6 h-6 rounded-md bg-[#10B981] flex items-center justify-center font-bold text-white text-xs">
              P
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-slate-900">
              Probable<span className="text-[#10B981]">.ai</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="#about"
              className="text-slate-600 hover:text-slate-900 transition"
            >
              How It Works
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#10B981] hover:bg-[#14B8A6] text-white font-semibold rounded-lg transition shadow-sm"
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100/80 bg-white/60 font-semibold rounded-lg transition cursor-pointer border border-rose-200 shadow-sm"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/login?mode=signup")}
                  className="px-4 py-1.5 text-slate-600 hover:text-slate-900 transition cursor-pointer font-medium"
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="px-4 py-1.5 bg-[#10B981] hover:bg-[#14B8A6] text-white font-semibold rounded-lg transition cursor-pointer shadow-sm"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-700 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100/50 transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-slate-200/70 mt-3 flex flex-col gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-600 hover:text-slate-900 transition py-1.5 px-2 rounded-md hover:bg-white/50"
            >
              How It Works
            </Link>

            {user ? (
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-200/50">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 bg-[#10B981] text-white font-semibold rounded-lg transition shadow-sm"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 bg-rose-50/80 text-rose-600 hover:bg-rose-100/80 font-semibold rounded-lg transition border border-rose-200 cursor-pointer shadow-sm"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-200/50">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/login?mode=signup");
                  }}
                  className="w-full text-left py-2 px-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-md transition cursor-pointer font-medium"
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="w-full px-4 py-2.5 bg-[#10B981] hover:bg-[#14B8A6] text-white font-semibold rounded-lg transition cursor-pointer shadow-sm text-center"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
