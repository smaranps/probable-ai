// Source: Skills UI for liquid background, Claude/Gemini for styling/icons

"use client";
import React, { useEffect, useRef } from "react";

class SimplexNoise {
  private perm = new Uint8Array(512);
  constructor(seed = Math.random()) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let n = 256,
      s = seed * 10000;
    while (n > 1) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * n--);
      [p[n], p[j]] = [p[j], p[n]];
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }
  private grad(hash: number, x: number, y: number) {
    const h = hash & 7;
    const u = h < 4 ? x : y,
      v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  noise(xin: number, yin: number) {
    const F2 = 0.5 * (Math.sqrt(3) - 1),
      G2 = (3 - Math.sqrt(3)) / 6;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s),
      j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t,
      Y0 = j - t;
    const x0 = xin - X0,
      y0 = yin - Y0;
    const i1 = x0 > y0 ? 1 : 0,
      j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2,
      y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2,
      y2 = y0 - 1 + 2 * G2;
    const ii = i & 255,
      jj = j & 255;
    const g0 = this.grad(this.perm[ii + this.perm[jj]], x0, y0);
    const g1 = this.grad(this.perm[ii + i1 + this.perm[jj + j1]], x1, y1);
    const g2 = this.grad(this.perm[ii + 1 + this.perm[jj + 1]], x2, y2);
    let n0 = Math.max(0, 0.5 - x0 * x0 - y0 * y0) ** 4 * g0;
    let n1 = Math.max(0, 0.5 - x1 * x1 - y1 * y1) ** 4 * g1;
    let n2 = Math.max(0, 0.5 - x2 * x2 - y2 * y2) ** 4 * g2;
    return 70 * (n0 + n1 + n2);
  }
}
const BLOBS = [
  { color: "110, 231, 183", scale: 0.9, speed: 0.012, radius: 0.42 },
  { color: "94, 234, 212", scale: 1.3, speed: 0.009, radius: 0.38 },
  { color: "165, 180, 252", scale: 0.7, speed: 0.01, radius: 0.42 },
  { color: "240, 171, 252", scale: 1.1, speed: 0.007, radius: 0.32 },
];

export const LiquidBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noises = BLOBS.map((_, i) => new SimplexNoise(i * 13.7 + 1));
    let raf = 0;
    let elapsed = 0;
    let lastTime = 0;
    let visible = true;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const resize = () => {
      canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 1.5);
      canvas.height =
        window.innerHeight * Math.min(window.devicePixelRatio, 1.5);
    };
    resize();
    window.addEventListener("resize", resize);

    const onVisibility = () => (visible = !document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    const draw = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;
      elapsed += dt;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#F8FAFC";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "multiply";

      BLOBS.forEach((blob, i) => {
        const n = noises[i];
        const nx = n.noise(elapsed * blob.speed, 0);
        const ny = n.noise(0, elapsed * blob.speed);
        const cx = width * (0.5 + nx * 0.4 * blob.scale);
        const cy = height * (0.5 + ny * 0.4 * blob.scale);
        const r = Math.max(width, height) * blob.radius;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, `rgba(${blob.color}, 0.32)`);
        gradient.addColorStop(0.6, `rgba(${blob.color}, 0.14)`);
        gradient.addColorStop(1, `rgba(${blob.color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      if (visible && !reduceMotion) raf = requestAnimationFrame(draw);
    };

    if (!reduceMotion) {
      raf = requestAnimationFrame(draw);
    } else {
      draw(0);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#F8FAFC]">
      <canvas
        ref={canvasRef}
        className="w-full h-full filter blur-[70px]"
        style={{ width: "100%", height: "100%" }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-multiply pointer-events-none">
        <filter id="noise-light">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-light)" />
      </svg>
    </div>
  );
};
