"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Trash2,
  AlertCircle,
  ExternalLink,
  Calendar,
  ClipboardList,
  Check,
  Loader2,
} from "lucide-react";
import { db, auth } from "@/app/services/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Actor } from 'next/font/google';
const actor = Actor({ weight: '400', style: 'normal', variable: '--font-actor' });


interface SuppPrompt {
  id: string;
  question: string;
  draft: string;
  maxCharacters: number;
}

interface SuppApplication {
  id: string;
  university: string;
  program: string;
  deadline: string;
  portalUrl: string;
  status: "Not Started" | "Drafting" | "In Review" | "Submitted";
  prompts: SuppPrompt[];
}

interface TargetChoice {
  university: string;
  program: string;
}

const PROFILE_KEY = "ouac_user_profile";
const TRACKER_KEY = "supp_tracker_state";
const SAVE_DEBOUNCE_MS = 800;

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeEmptyApp(choice: TargetChoice): SuppApplication {
  return {
    id: makeId("app"),
    university: choice.university,
    program: choice.program,
    deadline: "",
    portalUrl: "",
    status: "Not Started",
    prompts: [],
  };
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyStyles(days: number | null) {
  if (days === null)
    return { badge: "bg-slate-100 text-slate-400", label: "No date set" };
  if (days < 0) return { badge: "bg-rose-100 text-rose-700", label: "Past due" };
  if (days <= 7)
    return { badge: "bg-rose-100 text-rose-700", label: `${days}d left` };
  if (days <= 30)
    return { badge: "bg-amber-100 text-amber-700", label: `${days}d left` };
  return { badge: "bg-emerald-100 text-emerald-700", label: `${days}d left` };
}

function mergeChoicesWithSaved(
  choices: TargetChoice[],
  savedApps: SuppApplication[]
): SuppApplication[] {
  return choices.map((choice) => {
    const existing = savedApps.find(
      (a) => a.university === choice.university && a.program === choice.program
    );
    return existing ?? makeEmptyApp(choice);
  });
}

export default function SupplementalTrackerPage() {
  const [apps, setApps] = useState<SuppApplication[]>([]);
  const [activeAppId, setActiveAppId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<User | null | undefined>(undefined); 
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoadRef = useRef(true);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);
  useEffect(() => {
    if (user === undefined) return; 

    let cancelled = false;

    async function load() {
      try {
        const profileRaw = localStorage.getItem(PROFILE_KEY);
        const localProfile = profileRaw ? JSON.parse(profileRaw) : null;

        let choices: TargetChoice[] = (localProfile?.targetChoices ?? []).filter(
          (c: TargetChoice) => c?.university?.trim() && c?.program?.trim()
        );
        let savedApps: SuppApplication[] = [];

        if (user) {
          const snap = await getDoc(doc(db, "users", user.uid));
          const data = snap.exists() ? snap.data() : null;
          if (data?.targetChoices?.length) {
            choices = (data.targetChoices as TargetChoice[]).filter(
              (c) => c?.university?.trim() && c?.program?.trim()
            );
          }
          if (Array.isArray(data?.suppTracker)) {
            savedApps = data.suppTracker as SuppApplication[];
          }
        } else {
          const trackerRaw = localStorage.getItem(TRACKER_KEY);
          savedApps = trackerRaw ? JSON.parse(trackerRaw) : [];
        }

        if (cancelled) return;

        const merged = mergeChoicesWithSaved(choices, savedApps);
        setApps(merged);
        if (merged.length > 0) setActiveAppId(merged[0].id);
      } catch (e) {
        console.error("Failed to load tracker data", e);
      } finally {
        if (!cancelled) {
          isFirstLoadRef.current = true;
          setLoaded(true);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);
  useEffect(() => {
    if (!loaded || user === undefined) return;

    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    setSaveState("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (user) {
          await setDoc(
            doc(db, "users", user.uid),
            { suppTracker: apps, suppTrackerUpdatedAt: new Date().toISOString() },
            { merge: true }
          );
        } else {
          localStorage.setItem(TRACKER_KEY, JSON.stringify(apps));
        }
        setSaveState("saved");
      } catch (e) {
        console.error("Failed to save tracker data", e);
        setSaveState("idle");
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [apps, loaded, user]);

  const activeApp = apps.find((a) => a.id === activeAppId);

  const stats = useMemo(() => {
    const submitted = apps.filter((a) => a.status === "Submitted").length;
    const withDates = apps
      .map((a) => ({ a, d: daysUntil(a.deadline) }))
      .filter((x) => x.d !== null) as { a: SuppApplication; d: number }[];
    withDates.sort((x, y) => x.d - y.d);
    const nearest = withDates[0];
    return {
      total: apps.length,
      submitted,
      nearestLabel: nearest
        ? `${nearest.a.university} · ${nearest.d < 0 ? "overdue" : `${nearest.d}d`}`
        : "—",
    };
  }, [apps]);

  const updateApp = (appId: string, patch: Partial<SuppApplication>) => {
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, ...patch } : a)));
  };

  const updateDraft = (promptId: string, text: string) => {
    if (!activeApp) return;
    updateApp(activeApp.id, {
      prompts: activeApp.prompts.map((p) =>
        p.id === promptId ? { ...p, draft: text } : p
      ),
    });
  };

  const addPrompt = () => {
    if (!activeApp) return;
    const newPrompt: SuppPrompt = {
      id: makeId("p"),
      question: "New prompt — click to edit the question",
      draft: "",
      maxCharacters: 1000,
    };
    updateApp(activeApp.id, { prompts: [...activeApp.prompts, newPrompt] });
  };

  const removePrompt = (promptId: string) => {
    if (!activeApp) return;
    updateApp(activeApp.id, {
      prompts: activeApp.prompts.filter((p) => p.id !== promptId),
    });
  };

  const updatePromptField = (
    promptId: string,
    field: "question" | "maxCharacters",
    value: string | number
  ) => {
    if (!activeApp) return;
    updateApp(activeApp.id, {
      prompts: activeApp.prompts.map((p) =>
        p.id === promptId ? { ...p, [field]: value } : p
      ),
    });
  };

  if (!loaded) {
    return (
      <div className="max-w-2xl mx-auto mt-24 text-center text-sm text-gray-400">
        Loading your applications…
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-24 text-center space-y-3">
        <ClipboardList className="mx-auto text-slate-300" size={40} />
        <h1 className="text-xl font-bold text-slate-900">
          No applications found yet
        </h1>
        <p className="text-sm text-slate-500">
          Complete onboarding and pick at least one university &amp; program
          to start tracking supplemental applications.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-[70px]" style={{ fontFamily: actor.style.fontFamily }}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Supplemental Application Tracker
          </h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            Track deadlines, monitor character limits, and draft responses
            for your chosen universities.
            <SaveIndicator state={saveState} isGuest={!user} />
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Applications
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {stats.total}
            </div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
              Submitted
            </div>
            <div className="text-lg font-extrabold text-emerald-700">
              {stats.submitted}
            </div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm text-center">
            <div className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
              Next deadline
            </div>
            <div className="text-sm font-bold text-amber-700 mt-0.5">
              {stats.nearestLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Applications ({apps.length})
          </h2>
          <div className="space-y-3">
            {apps.map((app) => {
              const isSelected = app.id === activeAppId;
              const days = daysUntil(app.deadline);
              const urgency = urgencyStyles(days);
              const filledPrompts = app.prompts.filter((p) => p.draft.trim()).length;
              return (
                <button
                  key={app.id}
                  onClick={() => setActiveAppId(app.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? "ring-2 ring-emerald-600 border-transparent bg-emerald-50/40"
                      : "border-gray-200 hover:border-emerald-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md truncate">
                      {app.university}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        app.status === "Submitted"
                          ? "bg-emerald-100 text-emerald-700"
                          : app.status === "Drafting"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">{app.program}</h3>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${urgency.badge}`}>
                      {urgency.label}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {filledPrompts}/{app.prompts.length || 0} prompts drafted
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {activeApp ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col max-h-[80vh]">
            <div className="p-6 pb-4 border-b border-gray-100 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{activeApp.program}</h2>
                  <p className="text-xs text-gray-500">{activeApp.university}</p>
                </div>
                <select
                  value={activeApp.status}
                  onChange={(e) =>
                    updateApp(activeApp.id, {
                      status: e.target.value as SuppApplication["status"],
                    })
                  }
                  className="cursor-pointer px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-emerald-500"
                >
                  <option className="cursor-pointer" value="Not Started">Not Started</option>
                  <option className="cursor-pointer" value="Drafting">Drafting</option>
                  <option className="cursor-pointer" value="In Review">In Review</option>
                  <option className="cursor-pointer" value="Submitted">Submitted</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                    <Calendar size={11} /> Deadline
                  </label>
                  <input
                    type="date"
                    value={activeApp.deadline}
                    onChange={(e) => updateApp(activeApp.id, { deadline: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <ExternalLink size={11} /> Portal URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={activeApp.portalUrl}
                      onChange={(e) => updateApp(activeApp.id, { portalUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none cursor-type focus:border-emerald-500"
                    />
                    {activeApp.portalUrl && (
                      <a
                        href={activeApp.portalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-gray-500 hover:text-emerald-600 rounded-xl bg-gray-50 border border-gray-200 shrink-0"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {activeApp.prompts.length === 0 && (
                <div className="text-center py-10 text-xs text-gray-400">
                  No prompts added yet. Add the essay questions from this school's portal.
                </div>
              )}
              {activeApp.prompts.map((p, idx) => {
                const charCount = p.draft.length;
                const isOverLimit = charCount > p.maxCharacters;
                return (
                  <div key={p.id} className="space-y-2">
                    <div className="flex justify-between items-start gap-3">
                      <input
                        value={p.question}
                        onChange={(e) => updatePromptField(p.id, "question", e.target.value)}
                        className="flex-1 text-xs font-bold text-gray-800 bg-transparent  border-b border-transparent hover:border-gray-200 focus:border-emerald-500 outline-none pb-0.5"
                      />
                      <button
                        onClick={() => removePrompt(p.id)}
                        className="p-1 text-gray-300 hover:text-rose-500 transition shrink-0 cursor-pointer"
                        title="Remove prompt"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Prompt #{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-mono font-semibold ${
                            isOverLimit ? "text-rose-600" : "text-gray-400"
                          }`}
                        >
                          {charCount} /
                        </span>
                        <input
                          type="number"
                          value={p.maxCharacters}
                          onChange={(e) =>
                            updatePromptField(p.id, "maxCharacters", Number(e.target.value) || 0)
                          }
                          className="w-16 text-[11px] font-mono font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none focus:border-emerald-500"
                        />
                        <span className="text-[11px] text-gray-400">chars</span>
                      </div>
                    </div>
                    <textarea
                      rows={5}
                      value={p.draft}
                      onChange={(e) => updateDraft(p.id, e.target.value)}
                      placeholder="Type your essay draft here..."
                      className={`w-full p-3.5 bg-gray-50 border rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white transition-all ${
                        isOverLimit
                          ? "border-rose-400 focus:border-rose-500"
                          : "border-gray-200 focus:border-emerald-500"
                      }`}
                    />
                    {isOverLimit && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium">
                        <AlertCircle size={12} /> {charCount - p.maxCharacters} characters over the
                        limit.
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={addPrompt}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
              >
                <Plus size={14} /> Add prompt
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center p-12 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-400">
            Select an application to manage drafts and deadlines.
          </div>
        )}
      </div>
    </div>
  );
}

function SaveIndicator({
  state,
  isGuest,
}: {
  state: "idle" | "saving" | "saved";
  isGuest: boolean;
}) {
  if (state === "idle") return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
      {state === "saving" ? (
        <>
          <Loader2 size={11} className="animate-spin" /> Saving…
        </>
      ) : (
        <>
          <Check size={11} className="text-emerald-600" />
          {isGuest ? "Saved on this device" : "Saved to your account"}
        </>
      )}
    </span>
  );
}