"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar({ user }: { user: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 pt-4 px-4 sm:px-8 max-w-5xl mx-auto w-full">
      <nav className="bg-[#111827]/80 backdrop-blur-md border border-[#1E293B]/80 rounded-2xl px-6 py-3.5 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#10B981] flex items-center justify-center font-bold text-slate-950 text-xs">
              P
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-white">
              Probable<span className="text-[#10B981]">.ai</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a
              href="#about"
              className="text-[#94A3B8] hover:text-white transition"
            >
              How It Works
            </a>
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-1.5 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-semibold rounded-lg transition"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/login?mode=signup")}
                  className="px-4 py-1.5 text-[#94A3B8] hover:text-white transition cursor-pointer"
                >
                  Sign up
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-1.5 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-semibold rounded-lg transition cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#94A3B8] hover:text-white p-1 transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-[#1E293B] mt-3 flex flex-col gap-3 text-sm font-medium">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#94A3B8] hover:text-white transition py-1"
            >
              How It Works
            </a>
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 bg-[#10B981] text-slate-950 font-semibold rounded-lg transition"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/login?mode=signup");
                  }}
                  className="w-full text-left py-1.5 text-[#94A3B8] hover:text-white transition cursor-pointer"
                >
                  Sign up
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="w-full px-4 py-2 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-semibold rounded-lg transition cursor-pointer"
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
