"use client";

import React from "react";

export const AuroraBackground = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="relative min-h-screen bg-[#07120e] text-white overflow-hidden flex flex-col justify-between height-70">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.35) 0%, rgba(6, 78, 59, 0.25) 45%, transparent 75%)`,
          }}
        />
        <div
          className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] opacity-70 blur-[90px] animate-aurora-main"
          style={{
            background: `
              radial-gradient(ellipse at 35% 35%, rgba(20, 184, 166, 0.45) 0%, transparent 50%),
              radial-gradient(ellipse at 65% 45%, rgba(16, 185, 129, 0.4) 0%, transparent 55%),
              radial-gradient(ellipse at 50% 65%, rgba(4, 47, 38, 0.8) 0%, transparent 60%)
            `,
          }}
        />
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[120%] h-[120%] opacity-60 blur-[100px] animate-aurora-secondary"
          style={{
            background: `
              radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.35) 0%, transparent 50%),
              radial-gradient(circle at 40% 70%, rgba(6, 78, 59, 0.7) 0%, transparent 55%)
            `,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 0)`,
            backgroundSize: `24px 24px`,
          }}
        />
      </div>

      <div className="relative z-10 w-full flex-grow flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};
