"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/app/context/authContext";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Link from "next/link";
import { Plus_Jakarta_Sans, Inter, Google_Sans_Flex } from "next/font/google";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { getGuestMode, GUEST_MODE_EVENT } from "@/app/services/guestMode";
import { setGuestMode } from "@/app/services/guestMode";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-google-sans-flex",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const leftContentVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

const rightCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.1,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};
const formFieldVariants: Variants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: 16,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};
const GAUGE_PERCENT = 78;
const GAUGE_PROGRAM = "Your University Program";

function ChanceGauge() {
  const cx = 110;
  const cy = 110;
  const r = 84;
  const startAngle = 180;
  const endAngle = 0;
  const valueAngle = startAngle - (GAUGE_PERCENT / 100) * (startAngle - endAngle);

  const polar = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  };

  const start = polar(startAngle);
  const end = polar(endAngle);
  const valuePoint = polar(valueAngle);
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = startAngle - i * ((startAngle - endAngle) / 10);
    const inner = {
      x: cx + (r - 8) * Math.cos((a * Math.PI) / 180),
      y: cy - (r - 8) * Math.sin((a * Math.PI) / 180),
    };
    const outer = {
      x: cx + (r + 2) * Math.cos((a * Math.PI) / 180),
      y: cy - (r + 2) * Math.sin((a * Math.PI) / 180),
    };
    return { inner, outer, major: i % 5 === 0 };
  });

  return (
    <svg viewBox="0 0 220 145" className="w-full max-w-[280px]" aria-hidden="true">
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
        fill="none"
        stroke="#1E2A3B"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${valuePoint.x} ${valuePoint.y}`}
        fill="none"
        stroke="#10B981"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.inner.x}
          y1={t.inner.y}
          x2={t.outer.x}
          y2={t.outer.y}
          stroke={t.major ? "#3A4A5E" : "#25334524"}
          strokeWidth={t.major ? 1.5 : 1}
        />
      ))}
      <circle cx={valuePoint.x} cy={valuePoint.y} r="6" fill="#F5F7F5" stroke="#10B981" strokeWidth="3" />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="#F5F7F5"
        fontSize="34"
        fontWeight="800"
        style={{ fontFamily: `var(${plusJakarta.variable})` }}
      >
        {GAUGE_PERCENT}%
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fill="#7C8A9A"
        fontSize="10"
        style={{ fontFamily: `var(${inter.variable})` }}
      >
        estimated chance
      </text>
    </svg>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const [isSignUp, setIsSignUp] = useState(modeParam === "signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading } = useAuth();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleFormValidation = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      setError("Email address is required.");
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Invalid email address.");
      return false;
    }
    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Full name is required.");
        return false;
      }
      if (!password) {
        setError("Password is required.");
        return false;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return false;
      }
    } else {
      if (!password) {
        setError("Password is required.");
        return false;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return false;
      }
    }

    setError("");
    return true;
  };

  useEffect(() => {
    if (modeParam === "signup") {
      setIsSignUp(true);
    } else if (modeParam === "login") {
      setIsSignUp(false);
    }
  }, [modeParam]);
  useEffect(() => {
    localStorage.removeItem("user_profile");
    localStorage.removeItem("auth_token");
  }, []);

  const handleGoogleAuth = async () => {
    setError("");
    setIsSubmitting(true);
    localStorage.removeItem("isGuestMode");
    try {
      const result = await signInWithGoogle();
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data()?.onboardingCompleted) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      if (err?.code === "auth/popup-closed-by-user") {
        return;
      }
      setError(err?.message || "Failed to authenticate with Google.");
    }
  };
  const handleGuestLogin = () => {
    if (typeof window !== "undefined") {
      setGuestMode(true);
      const guestCompleted = localStorage.getItem("guestOnboardingCompleted");
      if (guestCompleted === "true") {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const isValid = handleFormValidation();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }
    const cleanEmail = email.trim();
    try {
      if (isSignUp) {
        await signUpWithEmail(cleanEmail, password, fullName);
        router.push("/onboarding");
      } else {
        const cred = await signInWithEmail(cleanEmail, password);
        try {
          const userRef = doc(db, "users", cred.user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists() && userSnap.data()?.onboardingCompleted) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } catch (firestoreErr) {
          console.error("Firestore Error:", firestoreErr);
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      setIsSubmitting(false);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password. Did you sign up with Google?");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-[#F5F7F5]">
      {/* LEFT — brand + hero */}
      <motion.div
        variants={leftContentVariants}
        initial="hidden"
        animate="visible"
        className="md:w-1/2 bg-[#0B1220] text-white px-8 py-10 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#1E2A3B]"
        style={{ fontFamily: `var(${inter.variable})` }}
      >
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 mb-14 md:mb-20">
            <div className="w-8 h-8 rounded-md bg-[#10B981] flex items-center justify-center font-bold text-[#0B1220] text-base">
              P
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: `var(${plusJakarta.variable})` }}
            >
              Probable<span className="text-[#10B981]">.ai</span>
            </span>
          </Link>

          <div className="max-w-md space-y-5">
            <p
              className="flex items-center gap-2 text-sm text-[#8FA79B]"
              style={{ fontFamily: `var(${googleSansFlex.variable})` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Admissions intelligence for Ontario applicants
            </p>
            <h1
              className="text-3xl md:text-[2.6rem] font-bold tracking-tight leading-[1.15] text-white"
              style={{ fontFamily: `var(${plusJakarta.variable})` }}
            >
              Know your real odds before you apply.
            </h1>
            <p className="text-[#8FA79B] leading-relaxed text-[15px]">
              We weigh your Top 6 average, target programs, extracurriculars,
              contest scores, and school-specific factors against historical
              Ontario admissions outcomes.
            </p>
          </div>
        </div>

        {/* Hero illustration — grounded in the product itself */}
        <div className="hidden md:flex flex-col items-center py-4">
          <ChanceGauge />
          <p className="text-xs text-[#5C6E7E] mt-1">{GAUGE_PROGRAM}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-[#5C6E7E] pt-8 md:pt-0">
          <span>Built on real Ontario applicant data</span>
          <span className="hidden sm:inline">Gemini-assisted analysis</span>
        </div>
      </motion.div>

      {/* RIGHT — auth card */}
      <div className="md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <motion.div
          variants={rightCardVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md bg-white border border-[#E3E8E4] p-8 rounded-2xl shadow-[0_1px_2px_rgba(15,23,20,0.04),0_12px_32px_-16px_rgba(15,23,20,0.12)]"
          style={{ fontFamily: `var(${inter.variable})` }}
        >
          <div className="mb-7">
            <motion.h2
              key={isSignUp ? "signup-title" : "login-title"}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold text-[#0B1220] tracking-tight mb-1.5"
              style={{ fontFamily: `var(${plusJakarta.variable})` }}
            >
              {isSignUp ? "Create your account" : "Welcome back"}
            </motion.h2>
            <motion.p
              key={isSignUp ? "signup-sub" : "login-sub"}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-[#5B6B63]"
            >
              {isSignUp
                ? "Start calculating your admissions odds in minutes."
                : "Log in to pick up where you left off."}
            </motion.p>
          </div>

          <div className="space-y-2.5 mb-6">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleAuth}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#F5F7F5] border border-[#D8DEDA] text-[#111827] font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.3s.7 2.6 1.9 5l3.7-2.5z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              {isSubmitting ? "Authenticating…" : "Continue with Google"}
            </motion.button>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2.5 px-4 bg-[#F5F7F5] hover:bg-[#EBEFEC] border border-[#D8DEDA] text-[#3F4A45] font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue as guest
            </motion.button>
          </div>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-[#E3E8E4] w-full" />
            <span className="bg-white px-3 text-xs text-[#8B978F] absolute">
              or
            </span>
          </div>

          <form onSubmit={handleEmailAuth}>
            <AnimatePresence initial={false}>
              {isSignUp && (
                <motion.div
                  key="fullNameInput"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white border border-[#D8DEDA] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 text-[#0B1220] text-sm rounded-lg p-2.5 outline-none transition"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white border border-[#D8DEDA] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 text-[#0B1220] text-sm rounded-lg p-2.5 outline-none transition"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#3F4A45] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#D8DEDA] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 text-[#0B1220] text-sm rounded-lg p-2.5 outline-none transition"
              />
            </div>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#0B1220] hover:bg-[#151F30] text-white font-semibold text-sm rounded-lg transition-colors mt-1 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontFamily: `var(${plusJakarta.variable})` }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing…
                </>
              ) : isSignUp ? (
                "Sign up"
              ) : (
                "Log in"
              )}
            </motion.button>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-[#FDECEC] border border-[#F3C6C6] text-[#B3261E] text-xs p-3 rounded-lg overflow-hidden mt-[10px]"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          <p className="text-xs text-center text-[#5B6B63] mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setIsSignUp(!isSignUp);
              }}
              className="text-[#059669] hover:underline font-semibold ml-1 cursor-pointer"
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1220]" />}>
      <LoginContent />
    </Suspense>
  );
}