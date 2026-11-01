"use client";

import { useState } from "react";
import DashboardSidebar from "@/app/components/sidebar";
import DashboardChatbot from "../components/chatbot";
import CommandMenu from "../components/menu";
import { LiquidBackground } from "@/app/components/dashboardBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <LiquidBackground />
      <CommandMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <DashboardSidebar />
      <DashboardChatbot />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}