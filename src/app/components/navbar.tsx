"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { setGuestMode } from "@/app/services/guestMode";

interface NavbarProps {
  user?: any;
  isGuest?: boolean;
  onSignOut?: () => void;
}

export default function Navbar({
  user = null,
  isGuest = false,
  onSignOut,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const isAuthed = !!user || isGuest;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("ouac_user_profile");
    setGuestMode(false);
    localStorage.removeItem("guestOnboardingCompleted");
    localStorage.removeItem("guestCredits");
    localStorage.removeItem("guestCreditsDate");
    localStorage.removeItem("user_profile");
    localStorage.removeItem("auth_token");
    if (onSignOut) {
      await onSignOut();
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[var(--paper)]/85 backdrop-blur-md border-b border-[var(--border)]"
          : "bg-[var(--paper)]/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center font-heading font-bold text-white text-xs">
              P
            </div>
            <span className="font-heading text-lg font-semibold tracking-tight text-[var(--ink)]">
              Probable<span className="text-[var(--accent)]">.ai</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link
              href="/#how-it-works"
              className="text-[var(--ink-soft)] font-medium hover:text-[var(--ink)] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#faq"
              className="text-[var(--ink-soft)] font-medium hover:text-[var(--ink)] transition-colors"
            >
              FAQ
            </Link>
            <div className="h-5 w-px bg-[var(--border)]" />
            {isAuthed ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <LayoutDashboard size={15} /> Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--ink-soft)] hover:text-rose-600 font-medium transition-colors cursor-pointer"
                >
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/login?mode=login")}
                  className="px-4 py-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/login?mode=signup")}
                  className="px-4 py-2 text-sm font-semibold bg-[var(--ink)] hover:bg-[var(--ink)]/90 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[var(--ink)] p-1.5 rounded-lg hover:bg-[var(--mist)] transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[var(--border)] mt-1 pt-4 flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition py-2.5 px-2 rounded-md hover:bg-[var(--mist)]"
            >
              How It Works
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition py-2.5 px-2 rounded-md hover:bg-[var(--mist)]"
            >
              FAQ
            </Link>

            {isAuthed ? (
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-[var(--border)]">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-lg transition"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-semibold rounded-lg transition border border-rose-200 cursor-pointer"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/login?mode=login");
                  }}
                  className="w-full text-left py-2.5 px-2 text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--mist)] rounded-md transition cursor-pointer font-medium"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/login?mode=signup");
                  }}
                  className="w-full px-4 py-2.5 bg-[var(--ink)] hover:bg-[var(--ink)]/90 text-white font-semibold rounded-lg transition cursor-pointer text-center"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}