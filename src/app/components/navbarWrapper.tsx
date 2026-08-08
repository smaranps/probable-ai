"use client";

import React from "react";
import Navbar from "@/app/components/navbar";
import { useAuth } from "@/app/context/authContext";

export default function NavbarWrapper() {
  const { user, logout } = useAuth();

  return <Navbar user={user} onSignOut={logout} />;
}
