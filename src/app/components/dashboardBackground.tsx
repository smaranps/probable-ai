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
const RIBBONS = [
  {
    color: "16, 185, 129",
    speed: 0.011,
    radiusX: 0.5,
    radiusY: 0.18,
    angle: -0.35,
    yPos: 0.28,
  },
  {
    color: "20, 184, 166",
    speed: 0.008,
    radiusX: 0.55,
    radiusY: 0.2,
    angle: 0.22,
    yPos: 0.55,
  },
  {
    color: "6, 78, 59",
    speed: 0.006,
    radiusX: 0.45,
    radiusY: 0.16,
    angle: -0.15,
    yPos: 0.78,
  },
];

export const LiquidBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noises = RIBBONS.map((_, i) => new SimplexNoise(i * 17.3 + 1));
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

      RIBBONS.forEach((ribbon, i) => {
        const n = noises[i];
        const drift = n.noise(elapsed * ribbon.speed, 0);
        const cx = width * (0.5 + drift * 0.35);
        const cy = height * ribbon.yPos;
        const rx = width * ribbon.radiusX;
        const ry = height * ribbon.radiusY;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ribbon.angle + drift * 0.15);
        const gradient = ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          Math.max(rx, ry)
        );
        gradient.addColorStop(0, `rgba(${ribbon.color}, 0.34)`);
        gradient.addColorStop(0.55, `rgba(${ribbon.color}, 0.16)`);
        gradient.addColorStop(1, `rgba(${ribbon.color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.scale(1, ry / rx);
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
        className="w-full h-full filter blur-[90px] saturate-[1.3]"
        style={{ width: "100%", height: "100%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(15,23,42,0.03) 100%)",
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-multiply pointer-events-none">
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
