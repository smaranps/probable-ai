//  Source: Skills UI for the Aurora Background, Claude for color palette
"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { MotionValue } from "framer-motion";

interface HeroBackgroundProps {
  children?: ReactNode;
  className?: string;
  scrollProgress?: MotionValue<number>;
}
export default function HeroBackground({ children, className = "", scrollProgress }: HeroBackgroundProps) {
  const scrollRef = useRef(0);
  useEffect(() => {
    if (!scrollProgress) return;
    const unsubscribe = scrollProgress.on("change", (v) => {
      scrollRef.current = v;
    });
    return () => unsubscribe();
  }, [scrollProgress]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl =
      canvas.getContext("webgl", { antialias: false, alpha: true, powerPreference: "low-power" }) ||
      (canvas.getContext(
        "experimental-webgl",
        { antialias: false, alpha: true, powerPreference: "low-power" }
      ) as WebGLRenderingContext | null);
    if (!gl) {
      console.error(
        "[HeroBackground] WebGL fail falling back to static background."
      );
      setFailed(true);
      return;
    }
    const cores =
      typeof navigator !== "undefined" && navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency
        : 4;
    const isLowPower = cores <= 4;
    const maxDpr = 1;
    const octaves = isLowPower ? 2 : 3;
    const renderScale = isLowPower ? 0.5 : 0.65;
    const targetFps = 30;
    const frameInterval = 1000 / targetFps;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vertexSrc = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
    const fragmentSrc = `
      precision mediump float;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec2 uMouse;
     const vec3 INK      = vec3(0.035, 0.051, 0.086);  // #090D16 (matches page bg)
      const vec3 TEAL     = vec3(0.078, 0.157, 0.208);  // #142835 deep teal
      const vec3 EMERALD  = vec3(0.063, 0.725, 0.506);  // #10B981 brand emerald
      const vec3 MINT     = vec3(0.204, 0.827, 0.600);  // #34D399 bright mint highlight
    const vec3 DEEP_BLUE = vec3(0.043, 0.078, 0.153);
const vec3 SLATE      = vec3(0.376, 0.416, 0.635);
      uniform float uScroll;
      vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                            -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      float fbm(vec2 p) {
        float value = 0.0;
        float amp = 0.5;
        for (int i = 0; i < OCTAVES; i++) {
          value += amp * snoise(p);
          p *= 2.02;
          amp *= 0.5;
        }
        return value;
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        vec2 p = uv;
        p.x *= uResolution.x / uResolution.y;
        vec2 mouse = uMouse;
        mouse.x *= uResolution.x / uResolution.y;
        vec2 diff = p - mouse;
        float dist = length(diff);
        float displacement = exp(-dist * 3.5);
        p -= diff * displacement * 0.15;
        float t = uTime * 0.012;
        vec2 q = vec2(fbm(p * 1.1 + vec2(0.0, 0.0) + t), fbm(p * 1.1 + vec2(5.2, 1.3) - t));
        vec2 r = vec2(
          fbm(p * 1.1 + 2.2 * q + vec2(1.7, 9.2) + 0.08 * t),
          fbm(p * 1.1 + 2.2 * q + vec2(8.3, 2.8) - 0.06 * t)
        );
        float f = fbm(p * 0.9 + 1.6 * r);
        float shade = f * 0.5 + 0.5;
        shade = smoothstep(0.15, 0.85, shade);
        shade = mix(0.5, shade, 0.35);
        float bands = 8.0;
        float banded = floor(shade * bands) / bands;
        shade = mix(shade, banded, 0.05);
        float vign = smoothstep(1.1, 0.2, length(uv - 0.5));
        vec3 emeraldMix = mix(EMERALD, DEEP_BLUE, uScroll);
        vec3 mintMix = mix(MINT, SLATE, uScroll);
        vec3 base = mix(INK, TEAL, smoothstep(0.25, 0.6, shade));
        base = mix(base, emeraldMix, smoothstep(0.62, 0.92, shade) * 0.55);
        float touch = exp(-dist * 4.0) * 0.6;
        base = mix(base, mintMix, touch);
        base *= mix(0.35, 0.85, vign);
        base = clamp(base, 0.0, 1.0);
        gl_FragColor = vec4(base, 1.0);
      }
    `.replace("OCTAVES", String(octaves));
    function compile(type: number, source: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(shader));
      }
      return shader;
    }
    const vertexShader = compile(gl.VERTEX_SHADER, vertexSrc);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSrc);
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(
        "[HeroBackground] Shader program failed to link:",
        gl.getProgramInfoLog(program)
      );
      setFailed(true);
      return;
    }
    gl.useProgram(program);
    const positions = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uScroll = gl.getUniformLocation(program, "uScroll");
    let animationFrame: number | null = null;
    let start = performance.now();
    let lastFrameTime = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    let isVisible = true;
    let isTabVisible = true;
    const targetMouse = { x: -10, y: -10 };
    const currentMouse = { x: -10, y: -10 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse.x = (e.clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    function resize() {
      const { clientWidth, clientHeight } = canvas as HTMLCanvasElement;
      canvas!.width = Math.max(1, Math.floor(clientWidth * dpr * renderScale));
      canvas!.height = Math.max(1, Math.floor(clientHeight * dpr * renderScale));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    function drawFrame(elapsed: number) {
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;
      gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, elapsed);
      gl!.uniform2f(uMouse, currentMouse.x, currentMouse.y);
      gl!.uniform1f(uScroll, scrollRef.current);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    function render(now: number) {
      if (!isVisible || !isTabVisible) return;
      animationFrame = requestAnimationFrame(render);
      const delta = now - lastFrameTime;
      if (delta < frameInterval) return;
      lastFrameTime = now - (delta % frameInterval);
      const elapsed = (now - start) / 1000;
      drawFrame(elapsed);
    }
    if (prefersReducedMotion) {
      drawFrame(0);
    } else {
      animationFrame = requestAnimationFrame(render);
    }
    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === "visible";
      if (isTabVisible && !prefersReducedMotion && animationFrame === null) {
        start = performance.now();
        lastFrameTime = 0;
        animationFrame = requestAnimationFrame(render);
      }
      if (!isTabVisible && animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !prefersReducedMotion && animationFrame === null) {
          start = performance.now();
          lastFrameTime = 0;
          animationFrame = requestAnimationFrame(render);
        }
        if (!isVisible && animationFrame !== null) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      gl!.deleteProgram(program);
      gl!.deleteShader(vertexShader);
      gl!.deleteShader(fragmentShader);
      gl!.deleteBuffer(buffer);
    };
  }, []);
  if (failed) {
    return (
      <div className={`relative overflow-hidden bg-[#090D16] ${className}`}>
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 45%, rgba(16,185,129,0.25) 0%, rgba(9,13,22,0) 70%)",
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-[#090D16] ${className}`}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full" />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 45%, rgba(9,13,22,0.55) 0%, rgba(9,13,22,0.3) 45%, rgba(9,13,22,0) 75%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-b from-transparent to-[#090D16]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}