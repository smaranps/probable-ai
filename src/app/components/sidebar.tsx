"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Compass,
  FileText,
  ChevronLeft,
  ChevronRight,
  ListCheck,
  Calendar,
  Menu,
  X,
  LogOut,
  ChevronUp,
  User as UserIcon,
} from 'lucide-react';
import { Actor } from 'next/font/google';
import { useAuth } from '@/app/context/authContext';
import { getGuestMode } from '@/app/services/guestMode';

const actor = Actor({ weight: '400', style: 'normal', variable: '--font-actor' });

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const { user, profile, logout } = useAuth();
const isGuest = typeof window !== 'undefined' && getGuestMode();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = isGuest
  ? 'Guest User'
  : profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Account';
const displayEmail = isGuest ? 'Demo mode' : profile?.email || user?.email || '';
const photoURL = isGuest ? undefined : profile?.photoURL || user?.photoURL;
const initial = (displayName?.[0] || 'G').toUpperCase();

const handleLogout = async () => {
  try {
    if (isGuest) {
      localStorage.removeItem('isGuestMode');
    } else {
      await logout();
    }
    router.push('/login');
  } catch (err) {
    console.error('Failed to log out:', err);
  }
};
  const navItems = [
    { name: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Supplemental Reviewer", href: "/dashboard/essay-reviewer", icon: FileText, badgeColor: "bg-gray-200 text-gray-500 border-gray-300" },
    { name: "Supplemental Tracker", href: "/dashboard/supplemental", icon: ListCheck },
    { name: "Scholarship Estimator", href: "/dashboard/scholarship", icon: GraduationCap },
    { name: "EC Finder", href: "/dashboard/extracurriculars", icon: Compass, badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  ];

  return (
    <>
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="sm:hidden fixed top-4 left-4 z-[9995] bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm active:scale-95 transition"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
      )}
      {isMobileOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9989]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-gray-50 border-r border-gray-200 transition-transform sm:transition-[width] duration-300 ease-in-out flex flex-col justify-between z-[9990] pt-8 sm:pt-24 w-64
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0
        ${isCollapsed ? "sm:w-20" : "sm:w-64"}`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden sm:flex cursor-pointer absolute -right-3 top-8 bg-white border border-gray-300 text-gray-500 p-1 rounded-full hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors shadow-sm"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="sm:hidden absolute right-3 top-3 text-gray-400 p-1.5 rounded-full hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        <div>
          <div className='flex items-center gap-2 cursor-pointer ml-[20px]' onClick={() => router.push('/')}>
            <div className="w-9 h-9 rounded-md bg-[#10B981] flex items-center justify-center font-bold text-white text-s">
              P
            </div>
            {!isCollapsed && (
              <span className="font-heading text-xl font-bold tracking-tight text-slate-900">
                Probable<span className="text-[#10B981]">.ai</span>
              </span>
            )}
          </div>
          <div className="px-4 py-6">
            <div className={`text-xs font-semibold text-emerald-600/70 uppercase tracking-wider mb-4 px-3 ${isCollapsed ? 'sm:hidden' : 'block'}`}>
              Core Tools
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                      {!isCollapsed && (
                        <span className="text-sm font-medium whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="relative p-3" ref={accountMenuRef}>
  {isAccountMenuOpen && !isCollapsed && (
    <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
        {displayEmail && (
          <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
      >
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  )}
  <button
    onClick={() => (isCollapsed ? handleLogout() : setIsAccountMenuOpen(!isAccountMenuOpen))}
    className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer ${
      isCollapsed ? 'justify-center' : 'justify-between'
    }`}
    title={isCollapsed ? `${displayName} — Log out` : undefined}
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-semibold text-white text-sm shrink-0 overflow-hidden">
        {photoURL ? (
          <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>
      {!isCollapsed && (
        <div className="min-w-0 text-left">
          <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
          <p className="text-xs text-gray-500 truncate">{isGuest ? 'Guest' : 'View account'}</p>
        </div>
      )}
    </div>
    {!isCollapsed && (
      <ChevronUp
        size={16}
        className={`text-gray-400 shrink-0 transition-transform ${isAccountMenuOpen ? '' : 'rotate-180'}`}
      />
    )}
  </button>
</div>
      </aside>
      <div
        className={`hidden sm:block transition-all duration-300 ease-in-out flex-shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        aria-hidden="true"
      />
    </>
  );
}