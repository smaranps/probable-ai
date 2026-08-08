"use client";

import React from "react";
import Navbar from "@/app/components/navbar";
import { useAuth } from "@/app/context/authContext";
import { setLoggingOut } from "@/app/services/authFlags";

export default function NavbarWrapper() {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    setLoggingOut(true);
    await logout();
  };

  return <Navbar user={user} onSignOut={handleSignOut} />;
}
