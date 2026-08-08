// Source: Skills UI for the Aurora Background, Gemini for styling

"use client";

import React, { useState, useEffect, useMemo } from "react";

export const FloatingParticles = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      top: `${Math.floor(Math.random() * 80) + 10}%`,
      left: `${Math.floor(Math.random() * 90) + 5}%`,
      size: Math.random() * 3 + 2,
      duration: `${Math.floor(Math.random() * 8) + 10}s`,
      delay: `${(Math.random() * 5).toFixed(1)}s`,
    }));
  }, []);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#10B981] opacity-0 blur-[1px] animate-particle"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            boxShadow: `0 0 10px rgba(16, 185, 129, 0.8)`,
            //@ts-ignore
            "--duration": p.duration,
            "--delay": p.delay,
          }}
        />
      ))}
    </div>
  );
};

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const AuroraBackground = ({
  children,
  className = "",
}: AuroraBackgroundProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className={`relative bg-[#090D16] text-white overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <FloatingParticles />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(6, 78, 59, 0.45) 0%, rgba(9, 13, 22, 0) 70%)`,
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-500 opacity-60"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.08), transparent 40%)`,
          }}
        />
        <div
          className="absolute -top-[20%] -left-[10%] w-[130%] h-[130%] opacity-60 blur-[100px] animate-aurora-main"
          style={{
            background: `
              radial-gradient(ellipse at 35% 35%, rgba(20, 184, 166, 0.35) 0%, transparent 50%),
              radial-gradient(ellipse at 65% 45%, rgba(16, 185, 129, 0.3) 0%, transparent 55%)
            `,
          }}
        />
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[130%] h-[130%] opacity-50 blur-[120px] animate-aurora-secondary"
          style={{
            background: `
              radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.25) 0%, transparent 50%),
              radial-gradient(circle at 40% 70%, rgba(6, 78, 59, 0.6) 0%, transparent 55%)
            `,
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-emerald-500/10 opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-500/15 opacity-40 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `40px 40px`,
            maskImage: `radial-gradient(circle at 50% 45%, black 20%, transparent 75%)`,
            WebkitMaskImage: `radial-gradient(circle at 50% 45%, black 20%, transparent 75%)`,
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-overlay pointer-events-none">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
