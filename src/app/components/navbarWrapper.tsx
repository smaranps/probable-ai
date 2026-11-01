"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/app/components/navbar";
import { useAuth } from "@/app/context/authContext";
import { setLoggingOut } from "@/app/services/authFlags";
import { GUEST_MODE_EVENT, getGuestMode } from "@/app/services/guestMode";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const sync = () => setIsGuest(!user && getGuestMode());
    sync();
    window.addEventListener(GUEST_MODE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(GUEST_MODE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [user]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await logout();
  };

  if (pathname?.startsWith("/dashboard")) return null;
  if (pathname?.startsWith("/onboading")) return null;
  if (pathname?.startsWith("/login")) return null;

  return <Navbar user={user} isGuest={isGuest} onSignOut={handleSignOut} />;
}