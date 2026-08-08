//  Source: Skills UI for the Aurora Background, Claude for color palette

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

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

function makeNoise2D(seed = 1) {
  const rand = (() => {
    let s = seed;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  })();
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  return (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    );
  };
}
const AURORA_BLOBS = [
  { rgb: [16, 185, 129], scale: 1.6, speed: 0.055, offset: 0 },
  { rgb: [20, 184, 166], scale: 2.1, speed: 0.04, offset: 120 },
  { rgb: [6, 78, 59], scale: 1.2, speed: 0.07, offset: 340 },
];

// Used Claude to allow for building FPS-capped animations, in order to optimize performance on all devices.
const FluidAurora = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [isStatic, setIsStatic] = useState(false);
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isNarrowViewport = window.matchMedia("(max-width: 768px)").matches;
    setIsStatic(prefersReducedMotion || isNarrowViewport);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const RENDER_W = 96;
    const RENDER_H = 56;
    canvas.width = RENDER_W;
    canvas.height = RENDER_H;
    const noiseFns = AURORA_BLOBS.map((b) => makeNoise2D(b.offset + 7));
    let t = 0;
    let mounted = true;
    let isVisible = true;
    const paintFrame = () => {
      const imgData = ctx.createImageData(RENDER_W, RENDER_H);
      for (let y = 0; y < RENDER_H; y++) {
        for (let x = 0; x < RENDER_W; x++) {
          let r = 0,
            g = 0,
            b = 0,
            a = 0;

          for (let i = 0; i < AURORA_BLOBS.length; i++) {
            const blob = AURORA_BLOBS[i];
            const nx = (x / RENDER_W) * blob.scale;
            const ny = (y / RENDER_H) * blob.scale;
            const n = noiseFns[i](
              nx * 3 + t * blob.speed,
              ny * 3 - t * blob.speed * 0.7
            );
            const intensity = Math.pow(Math.max(0, (n + 1) / 2), 1.6);
            r += blob.rgb[0] * intensity;
            g += blob.rgb[1] * intensity;
            b += blob.rgb[2] * intensity;
            a += intensity;
          }
          const idx = (y * RENDER_W + x) * 4;
          imgData.data[idx] = Math.min(255, r);
          imgData.data[idx + 1] = Math.min(255, g);
          imgData.data[idx + 2] = Math.min(255, b);
          imgData.data[idx + 3] = Math.min(
            255,
            (a / AURORA_BLOBS.length) * 255
          );
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };
    if (isStatic) {
      paintFrame();
      return;
    }
    const FRAME_INTERVAL = 1000 / 24;
    let lastFrameTime = 0;

    const loop = (now: number) => {
      if (!mounted) return;
      rafRef.current = requestAnimationFrame(loop);
      if (!isVisible) return;
      if (now - lastFrameTime < FRAME_INTERVAL) return;
      lastFrameTime = now;

      paintFrame();
      t += 0.25;
    };
    rafRef.current = requestAnimationFrame(loop);
    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);
    let observer: IntersectionObserver | null = null;
    if (containerRef.current && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible =
            entry.isIntersecting && document.visibilityState === "visible";
        },
        { threshold: 0 }
      );
      observer.observe(containerRef.current);
    }
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer?.disconnect();
    };
  }, [isStatic]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          filter: "blur(40px) saturate(1.3)",
          opacity: 0.85,
          transform: "scale(1.15)",
        }}
      />
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
        <FluidAurora />
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
