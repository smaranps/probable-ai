"use client";

import React, { useState, useEffect, useMemo } from "react";

export const FloatingParticles = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      top: `${Math.floor(Math.random() * 85) + 5}%`,
      left: `${Math.floor(Math.random() * 90) + 5}%`,
      size: Math.floor(Math.random() * 7) + 6,
      duration: `${(Math.random() * 4 + 4).toFixed(1)}s`,
      delay: `${(Math.random() * 1.5).toFixed(1)}s`,
    }));
  }, []);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#10B981] opacity-0 blur-[0.5px] animate-particle"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            boxShadow: `0 0 12px rgba(16, 185, 129, 0.9)`,
            //@ts-ignore
            "--duration": p.duration,
            "--delay": p.delay,
          }}
        />
      ))}
    </div>
  );
};
