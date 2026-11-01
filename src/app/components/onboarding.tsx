"use client";

import React, { useState, useMemo, useEffect } from "react";
import { UNIVERSITIES } from "@/app/data/universities";
import { PROGRAMS } from "@/app/data/programs";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  X,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { db, auth } from "../services/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import CourseInfoModal from "@/app/components/infoModal";

export interface TargetChoice {
  university: string;
  program: string;
}

export interface CourseEntry {
  code: string;
  grade: number | "";
  isSummerSchool: boolean;
  isRepeated: boolean;
  isRequired?: boolean;
}

export interface ExtracurricularEntry {
  title: string;
  role: string;
  category: string;
  impact: string;
}

export interface UserProfileData {
  university: string;
  program: string;
  targetChoices: TargetChoice[];
  applicantType: "101" | "105";
  courses: CourseEntry[];
  top6Average: number;
  contests: {
    euclid: number | "";
    csmc: number | "";
    ccc: number | "";
  };
  hasOvsOrNightSchool: boolean;
  extracurriculars: ExtracurricularEntry[] | string;
}

interface OnboardingModalProps {
  onComplete: (data: UserProfileData) => void;
  userDisplayName?: string;
  onChoicesChange?: (choices: TargetChoice[]) => void;
}

const EC_CATEGORIES = [
  "Leadership",
  "STEM",
  "Volunteer",
  "Athletics",
  "Arts",
  "Business",
  "Other",
] as const;

const DEFAULT_COURSES: CourseEntry[] = [
  {
    code: "ENG4U",
    grade: "",
    isSummerSchool: false,
    isRepeated: false,
    isRequired: true,
  },
  {
    code: "MHF4U",
    grade: "",
    isSummerSchool: false,
    isRepeated: false,
    isRequired: true,
  },
  {
    code: "MCV4U",
    grade: "",
    isSummerSchool: false,
    isRepeated: false,
    isRequired: true,
  },
  {
    code: "SPH4U",
    grade: "",
    isSummerSchool: false,
    isRepeated: false,
    isRequired: false,
  },
  {
    code: "SCH4U",
    grade: "",
    isSummerSchool: false,
    isRepeated: false,
    isRequired: false,
  },
  {
    code: "ICS4U",
    grade: "",
    isSummerSchool: false,
    isRepeated: false,
    isRequired: false,
  },
  {
    code: "SBI4U",
    grade: "",
    isSummerSchool: false,
    isRepeated: false,
    isRequired: false,
  },
  {
    code: "",
    grade: "",
    isSummerSchool: false,
    isRepeated: false,
    isRequired: false,
  },
];

const emptyEC = (): ExtracurricularEntry => ({
  title: "",
  role: "",
  category: "Leadership",
  impact: "",
});
export function calculateOUACTop6(
  courses: CourseEntry[],
  requiredCodes: string[] = ["ENG4U", "MHF4U", "MCV4U"]
): number {
  const validCourses = courses.filter(
    (c) =>
      c.code.trim() !== "" && typeof c.grade === "number" && !isNaN(c.grade)
  ) as (CourseEntry & { grade: number })[];

  if (validCourses.length === 0) return 0;

  const required: (CourseEntry & { grade: number })[] = [];
  const electives: (CourseEntry & { grade: number })[] = [];

  validCourses.forEach((course) => {
    const code = course.code.trim().toUpperCase();
    const isReq =
      course.isRequired ||
      requiredCodes.some((req) => code.includes(req.toUpperCase()));
    if (isReq) required.push(course);
    else electives.push(course);
  });

  required.sort((a, b) => b.grade - a.grade);
  electives.sort((a, b) => b.grade - a.grade);

  const selected: (CourseEntry & { grade: number })[] = [];
  for (const c of required) {
    if (selected.length >= 6) break;
    selected.push(c);
  }
  for (const c of electives) {
    if (selected.length >= 6) break;
    selected.push(c);
  }

  if (selected.length === 0) return 0;
  const total = selected.reduce((sum, c) => sum + c.grade, 0);
  return Number((total / selected.length).toFixed(1));
}

export function formatExtracurricularsForPrompt(
  extracurriculars: ExtracurricularEntry[] | string | undefined | null
): string {
  if (!extracurriculars) return "None provided";
  if (typeof extracurriculars === "string") {
    const trimmed = extracurriculars.trim();
    return trimmed || "None provided";
  }
  const filled = extracurriculars.filter((e) => e.title.trim() || e.impact.trim());
  if (filled.length === 0) return "None provided";
  return filled
    .map((e, i) => {
      const parts = [
        `${i + 1}. ${e.title.trim() || "Untitled activity"}`,
        e.role.trim() ? `Role: ${e.role.trim()}` : null,
        e.category ? `Category: ${e.category}` : null,
        e.impact.trim() ? `Impact: ${e.impact.trim()}` : null,
      ].filter(Boolean);
      return parts.join(" | ");
    })
    .join("\n");
}

export default function OnboardingModal({
  onComplete,
  userDisplayName = "Student",
  onChoicesChange,
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [choiceIndex, setChoiceIndex] = useState<0 | 1 | 2>(0);
  const [targetChoices, setTargetChoices] = useState<TargetChoice[]>([
    { university: "", program: "" },
    { university: "", program: "" },
    { university: "", program: "" },
  ]);
  const [courses, setCourses] = useState<CourseEntry[]>(DEFAULT_COURSES);
  const [showCourseInfo, setShowCourseInfo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (onChoicesChange) onChoicesChange(targetChoices);
  }, [targetChoices, onChoicesChange]);

  const PRESET_PROFILES: { label: string; data: UserProfileData }[] = [
    {
      label: "96% Waterloo SE",
      data: {
        university: "University of Waterloo",
        program: "Software Engineering",
        targetChoices: [
          {
            university: "University of Waterloo",
            program: "Software Engineering",
          },
          { university: "", program: "" },
          { university: "", program: "" },
        ],
        applicantType: "101",
        top6Average: 96.2,
        courses: [
          {
            code: "ENG4U",
            grade: 94,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: true,
          },
          {
            code: "MHF4U",
            grade: 98,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: true,
          },
          {
            code: "MCV4U",
            grade: 97,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: true,
          },
          {
            code: "SPH4U",
            grade: 95,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: false,
          },
          {
            code: "SCH4U",
            grade: 96,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: false,
          },
          {
            code: "ICS4U",
            grade: 98,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: false,
          },
          {
            code: "SBI4U",
            grade: 93,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: false,
          },
          {
            code: "MDM4U",
            grade: 91,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: false,
          },
        ],
        contests: { euclid: 78, csmc: 48, ccc: 52 },
        hasOvsOrNightSchool: false,
        extracurriculars: [
          {
            title: "FIRST Robotics",
            role: "Team Captain",
            category: "STEM",
            impact: "Led 25-person build team; regional finalist",
          },
          {
            title: "Community Coding Workshops",
            role: "Founder",
            category: "Leadership",
            impact: "Taught 80+ middle-school students over 2 years",
          },
          {
            title: "DECA",
            role: "ICDC Finalist",
            category: "Business",
            impact: "Provincial champion, international finals",
          },
        ],
      },
    },
    {
      label: "92% + OVS Flag",
      data: {
        university: "University of Toronto - St. George",
        program: "Computer Science",
        targetChoices: [
          {
            university: "University of Toronto - St. George",
            program: "Computer Science",
          },
          { university: "", program: "" },
          { university: "", program: "" },
        ],
        applicantType: "101",
        top6Average: 92.5,
        courses: [
          {
            code: "ENG4U",
            grade: 88,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: true,
          },
          {
            code: "MHF4U",
            grade: 96,
            isSummerSchool: true,
            isRepeated: false,
            isRequired: true,
          },
          {
            code: "MCV4U",
            grade: 95,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: true,
          },
          {
            code: "SPH4U",
            grade: 90,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: false,
          },
          {
            code: "SCH4U",
            grade: 91,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: false,
          },
          {
            code: "ICS4U",
            grade: 95,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: false,
          },
          {
            code: "SBI4U",
            grade: 89,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: false,
          },
          {
            code: "BBB4M",
            grade: 94,
            isSummerSchool: false,
            isRepeated: false,
            isRequired: false,
          },
        ],
        contests: { euclid: "", csmc: "", ccc: "" },
        hasOvsOrNightSchool: true,
        extracurriculars: [
          {
            title: "Math Club",
            role: "Vice President",
            category: "STEM",
            impact: "Organized weekly problem sets for 30 members",
          },
          {
            title: "Peer Tutoring",
            role: "Tutor",
            category: "Volunteer",
            impact: "100+ hours supporting Grade 9–11 math students",
          },
        ],
      },
    },
  ];

  const [applicantType, setApplicantType] = useState<"101" | "105">("101");
  const [contests, setContests] = useState({
    euclid: "" as number | "",
    csmc: "" as number | "",
    ccc: "" as number | "",
  });
  const [hasOvsOrNightSchool, setHasOvsOrNightSchool] = useState(false);
  const [extracurriculars, setExtracurriculars] = useState<
    ExtracurricularEntry[]
  >([emptyEC(), emptyEC()]);
  const totalUnits = 6;
  const [error, setError] = useState("");

  const currentUnit = step === 1 ? choiceIndex + 1 : 3 + (step - 1);

  const filteredUniversities = useMemo(() => {
    const query = targetChoices[choiceIndex].university;
    if (!query.trim()) return UNIVERSITIES;
    return UNIVERSITIES.filter((uni) =>
      uni.toLowerCase().includes(query.toLowerCase())
    );
  }, [targetChoices, choiceIndex]);

  const calculatedAverage = useMemo(
    () => calculateOUACTop6(courses),
    [courses]
  );

  const filteredPrograms = useMemo(() => {
    const query = targetChoices[choiceIndex].program;
    if (!query.trim()) return PROGRAMS;
    return PROGRAMS.filter((prog) =>
      prog.toLowerCase().includes(query.toLowerCase())
    );
  }, [targetChoices, choiceIndex]);

  const handleCourseChange = (
    index: number,
    field: keyof CourseEntry,
    value: unknown
  ) => {
    const updated = [...courses];
    updated[index] = { ...updated[index], [field]: value } as CourseEntry;
    setCourses(updated);
  };

  const addCourseRow = () => {
    if (courses.length >= 10) return;
    setCourses([
      ...courses,
      {
        code: "",
        grade: "",
        isSummerSchool: false,
        isRepeated: false,
        isRequired: false,
      },
    ]);
  };

  const applyPreset = (presetData: UserProfileData) => {
    setTargetChoices(
      presetData.targetChoices?.length === 3
        ? presetData.targetChoices
        : [
            { university: presetData.university, program: presetData.program },
            {
              university: "University of Waterloo",
              program: "Software Engineering",
            },
            { university: "McMaster University", program: "Computer Science" },
          ]
    );
    setChoiceIndex(0);
    setApplicantType(presetData.applicantType);
    setCourses(
      presetData.courses.length >= 8
        ? presetData.courses
        : [
            ...presetData.courses,
            ...Array.from(
              { length: 8 - presetData.courses.length },
              () =>
                ({
                  code: "",
                  grade: "" as const,
                  isSummerSchool: false,
                  isRepeated: false,
                  isRequired: false,
                }) satisfies CourseEntry
            ),
          ]
    );
    setContests(presetData.contests);
    setHasOvsOrNightSchool(presetData.hasOvsOrNightSchool);
    setExtracurriculars(
      Array.isArray(presetData.extracurriculars)
        ? presetData.extracurriculars
        : [
            {
              title: String(presetData.extracurriculars || ""),
              role: "",
              category: "Other",
              impact: "",
            },
          ]
    );
    setStep(2);
  };

  const removeCourseRow = (index: number) => {
    if (courses.length <= 6) return;
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateEC = (
    index: number,
    field: keyof ExtracurricularEntry,
    value: string
  ) => {
    setExtracurriculars((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFinish = async () => {
    const cleanedECs = extracurriculars.filter(
      (e) => e.title.trim() || e.role.trim() || e.impact.trim()
    );

    const profileData: UserProfileData = {
      university: targetChoices[0].university,
      program: targetChoices[0].program,
      targetChoices,
      applicantType,
      courses,
      top6Average: calculatedAverage,
      contests,
      hasOvsOrNightSchool,
      extracurriculars: cleanedECs,
    };

    try {
      const user = auth.currentUser;
      if (!user) {
        localStorage.setItem("ouac_user_profile", JSON.stringify(profileData));
        localStorage.setItem("guestOnboardingCompleted", "true");
        if (onComplete) onComplete(profileData);
        router.push("/dashboard");
        return;
      }
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...profileData,
          onboardingCompleted: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      localStorage.setItem("ouac_user_profile", JSON.stringify(profileData));
      if (onComplete) onComplete(profileData);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving profile to Firestore:", err);
    }
  };

  const updateTargetChoice = (
    field: "university" | "program",
    value: string
  ) => {
    setTargetChoices((prev) => {
      const updated = [...prev];
      updated[choiceIndex] = {
        ...updated[choiceIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const handleContinue = () => {
    if (step === 1) {
      const current = targetChoices[choiceIndex];
      const hasUni = Boolean(current?.university?.trim());
      const hasProg = Boolean(current?.program?.trim());
      if (choiceIndex === 0) {
        if (!hasUni || !hasProg) {
          setError(
            "Please select both a university and program for your first choice."
          );
          return;
        }
      } else if ((hasUni && !hasProg) || (!hasUni && hasProg)) {
        setError(
          "Please complete both university and program fields, or clear both to skip."
        );
        return;
      }
      setError("");
      if (choiceIndex < 2) {
        setChoiceIndex((i) => (i + 1) as 0 | 1 | 2);
      } else {
        setStep(2);
      }
      return;
    }
    setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
  };

  const handleBack = () => {
    if (step === 1) {
      if (choiceIndex > 0) setChoiceIndex((i) => (i - 1) as 0 | 1 | 2);
      return;
    }
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));
  };

  const stepLabel =
    step === 1
      ? [
          "First Choice Program",
          "Second Choice Program",
          "Third Choice Program",
        ][choiceIndex]
      : ["", "Grades & Courses", "Profile & Activities", "Contests (Optional)"][
          step
        ];

  return (
    <div className="w-full mt-[50px]">
      <div className="relative w-full max-w-2xl bg-[var(--paper)]/95 backdrop-blur-xl border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="bg-[var(--mist)]/80 border-b border-[var(--border)] p-3 px-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-soft)] block mb-2">
            Demo presets
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROFILES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset.data)}
                className="text-xs bg-[var(--paper)] hover:bg-[var(--accent-muted)] hover:border-[var(--accent)] border border-[var(--border)] text-[var(--ink)] font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pt-4 pb-4 border-b border-[var(--border)] bg-[var(--paper)]/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)] flex items-center gap-1.5">
              <Sparkles size={13} />
              {step === 1
                ? `Choice ${choiceIndex + 1} of 3`
                : `Step ${step} of 4`}
            </span>
            <span className="text-xs font-medium text-[var(--ink-soft)]">
              {stepLabel}
            </span>
          </div>
          <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--ink)] transition-all duration-300 ease-out"
              style={{ width: `${(currentUnit / totalUnits) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-[var(--ink)]">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[var(--ink)] tracking-tight">
                  {choiceIndex === 0
                    ? `Nice to meet you, ${userDisplayName}`
                    : choiceIndex === 1
                      ? "What's your second choice?"
                      : "Last one — your third choice"}
                </h2>
                <p className="text-sm text-[var(--ink-soft)] mt-1">
                  {choiceIndex === 0
                    ? "Select your first-choice university and program to start your analysis."
                    : "Add another university and program you're considering."}
                </p>
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider flex items-center justify-between">
                  <span>
                    {["First", "Second", "Third"][choiceIndex]} Choice
                    University
                  </span>
                  {choiceIndex === 0 ? (
                    <span className="text-red-500 font-bold">* Required</span>
                  ) : (
                    <span className="text-[var(--ink-soft)] font-normal normal-case">
                      (Optional)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-3.5 text-[var(--ink-soft)]"
                    size={18}
                  />
                  <input
                    type="text"
                    value={targetChoices[choiceIndex].university}
                    onChange={(e) =>
                      updateTargetChoice("university", e.target.value)
                    }
                    placeholder="Search universities (e.g. Waterloo, UofT)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--mist)] border border-[var(--border)] focus:border-[var(--ink)] focus:ring-0 rounded-lg text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)]/60 outline-none transition"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto border border-[var(--border)] rounded-lg bg-[var(--paper)] p-1">
                  {filteredUniversities.length === 0 ? (
                    <div className="p-3 text-xs text-[var(--ink-soft)] text-center">
                      No matching university found. Type a custom name above.
                    </div>
                  ) : (
                    filteredUniversities.map((uni) => {
                      const isSelected =
                        targetChoices[choiceIndex].university === uni;
                      return (
                        <div
                          key={uni}
                          className={`w-full px-3 py-2 text-sm rounded-md flex items-center justify-between transition ${
                            isSelected
                              ? "bg-[var(--ink)] text-white font-semibold"
                              : "text-[var(--ink)] hover:bg-[var(--mist)]"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateTargetChoice("university", uni)
                            }
                            className="flex-1 text-left"
                          >
                            {uni}
                          </button>
                          {isSelected && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTargetChoice("university", "");
                              }}
                              className="ml-2 p-1 text-white/60 hover:text-red-300 rounded-md transition"
                              title="Remove choice"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider flex items-center justify-between">
                  <span>
                    {["First", "Second", "Third"][choiceIndex]} Choice Program
                  </span>
                  {choiceIndex === 0 ? (
                    <span className="text-red-500 font-bold">* Required</span>
                  ) : (
                    <span className="text-[var(--ink-soft)] font-normal normal-case">
                      (Optional)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-3.5 text-[var(--ink-soft)]"
                    size={18}
                  />
                  <input
                    type="text"
                    value={targetChoices[choiceIndex].program}
                    onChange={(e) =>
                      updateTargetChoice("program", e.target.value)
                    }
                    placeholder="Search programs (e.g. Computer Science)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--mist)] border border-[var(--border)] focus:border-[var(--ink)] focus:ring-0 rounded-lg text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)]/60 outline-none transition"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto border border-[var(--border)] rounded-lg bg-[var(--paper)] p-1">
                  {filteredPrograms.length === 0 ? (
                    <div className="p-3 text-xs text-[var(--ink-soft)] text-center">
                      No matching program found. Type a custom program above.
                    </div>
                  ) : (
                    filteredPrograms.map((prog) => {
                      const isSelected =
                        targetChoices[choiceIndex].program === prog;
                      return (
                        <div
                          key={prog}
                          className={`w-full px-3 py-2 text-sm rounded-md flex items-center justify-between transition ${
                            isSelected
                              ? "bg-[var(--ink)] text-white font-semibold"
                              : "text-[var(--ink)] hover:bg-[var(--mist)]"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => updateTargetChoice("program", prog)}
                            className="flex-1 text-left"
                          >
                            {prog}
                          </button>
                          {isSelected && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTargetChoice("program", "");
                              }}
                              className="ml-2 p-1 text-white/60 hover:text-red-300 rounded-md transition"
                              title="Remove choice"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < choiceIndex
                        ? "bg-[var(--accent)]"
                        : i === choiceIndex
                          ? "bg-[var(--ink)]"
                          : "bg-[var(--border)]"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-[var(--ink)] tracking-tight">
                    Grade 12 courses
                  </h2>
                  <p className="text-sm text-[var(--ink-soft)] mt-0.5">
                    Enter up to 8 courses. We lock prerequisites, then take your
                    highest remaining grades for a Top 6 average.
                    <button
                      type="button"
                      onClick={() => setShowCourseInfo(true)}
                      className="inline-flex align-middle ml-1 text-[var(--ink-soft)] hover:text-[var(--ink)] transition cursor-pointer"
                    >
                      <Info size={16} />
                    </button>
                  </p>
                </div>
                <div className="text-right px-3 py-2 rounded-lg bg-[var(--ink)] text-white shrink-0">
                  <div className="text-[9px] uppercase font-semibold tracking-wider text-white/50">
                    Top 6 average
                  </div>
                  <div className="font-heading text-base font-semibold">
                    {calculatedAverage > 0 ? `${calculatedAverage}%` : "—"}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {courses.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-lg bg-[var(--mist)]/50 border border-[var(--border)]"
                  >
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {c.isRequired && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)] shrink-0">
                          Prereq
                        </span>
                      )}
                      <input
                        type="text"
                        value={c.code}
                        onChange={(e) =>
                          handleCourseChange(
                            i,
                            "code",
                            e.target.value.toUpperCase()
                          )
                        }
                        maxLength={6}
                        placeholder="Code"
                        className="w-full sm:w-28 px-3 py-1.5 bg-[var(--paper)] border border-[var(--border)] focus:border-[var(--ink)] rounded-md text-sm text-[var(--ink)] uppercase font-mono outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 w-full sm:w-28">
                      <input
                        type="number"
                        onKeyDown={(event) => {
                          if (["-", "e", "E", "+", "."].includes(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        min={50}
                        max={100}
                        value={c.grade}
                        onChange={(e) =>
                          handleCourseChange(i, "grade", e.target.value)
                        }
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val === "") return;
                          if (Number(val) < 50)
                            handleCourseChange(i, "grade", 50);
                          else if (Number(val) > 100)
                            handleCourseChange(i, "grade", 100);
                          else handleCourseChange(i, "grade", Number(val));
                        }}
                        placeholder="%"
                        className="w-full px-3 py-1.5 bg-[var(--paper)] border border-[var(--border)] focus:border-[var(--ink)] rounded-md text-sm text-[var(--ink)] font-mono outline-none"
                      />
                      <span className="text-xs font-semibold text-[var(--ink-soft)]">
                        %
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)] ml-auto">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={c.isSummerSchool}
                          onChange={(e) =>
                            handleCourseChange(
                              i,
                              "isSummerSchool",
                              e.target.checked
                            )
                          }
                          className="rounded border-[var(--border)] text-[var(--ink)] focus:ring-0"
                        />
                        Summer
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={c.isRepeated}
                          onChange={(e) =>
                            handleCourseChange(
                              i,
                              "isRepeated",
                              e.target.checked
                            )
                          }
                          className="rounded border-[var(--border)] text-[var(--ink)] focus:ring-0"
                        />
                        Repeated
                      </label>
                      <button
                        type="button"
                        onClick={() => removeCourseRow(i)}
                        disabled={courses.length <= 6}
                        className={`p-1 transition ${
                          courses.length <= 6
                            ? "text-[var(--border)] cursor-not-allowed"
                            : "text-[var(--ink-soft)] hover:text-red-500"
                        }`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {courses.length < 10 && (
                <button
                  type="button"
                  onClick={addCourseRow}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition cursor-pointer"
                >
                  <Plus size={15} /> Add another course
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-xl font-semibold text-[var(--ink)] tracking-tight">
                  Profile & extracurriculars
                </h2>
                <p className="text-sm text-[var(--ink-soft)] mt-0.5">
                  Structured activities help Gemini evaluate leadership, impact,
                  and fit — not just a freeform list.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">
                  Applicant category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      {
                        id: "101" as const,
                        title: "OUAC 101",
                        desc: "Ontario high school student",
                      },
                      {
                        id: "105" as const,
                        title: "OUAC 105",
                        desc: "Out-of-province / international",
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setApplicantType(opt.id)}
                      className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
                        applicantType === opt.id
                          ? "bg-[var(--ink)] border-[var(--ink)] text-white"
                          : "bg-[var(--paper)] border-[var(--border)] text-[var(--ink)] hover:border-[var(--ink)]/30"
                      }`}
                    >
                      <div className="font-semibold text-sm">{opt.title}</div>
                      <div
                        className={`text-xs mt-0.5 ${
                          applicantType === opt.id
                            ? "text-white/60"
                            : "text-[var(--ink-soft)]"
                        }`}
                      >
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="p-4 rounded-lg border border-[var(--border)] bg-[var(--mist)]/40 flex items-center justify-between cursor-pointer hover:border-[var(--ink)]/20 transition">
                <div className="space-y-0.5 pr-4">
                  <div className="text-sm font-semibold text-[var(--ink)]">
                    Non-day school courses
                  </div>
                  <div className="text-xs text-[var(--ink-soft)]">
                    OVS, night school, private, or online for required courses
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasOvsOrNightSchool}
                  onChange={(e) => setHasOvsOrNightSchool(e.target.checked)}
                  className="w-5 h-5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-0 cursor-pointer"
                />
              </label>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">
                    Extracurriculars
                  </label>
                  {extracurriculars.length < 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExtracurriculars((prev) => [...prev, emptyEC()])
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] cursor-pointer"
                    >
                      <Plus size={14} /> Add activity
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {extracurriculars.map((ec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-[var(--border)] bg-[var(--paper)] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-[var(--ink-soft)]">
                          Activity {i + 1}
                        </span>
                        {extracurriculars.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExtracurriculars((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                            className="text-[var(--ink-soft)] hover:text-red-500 p-1 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={ec.title}
                          onChange={(e) =>
                            updateEC(i, "title", e.target.value)
                          }
                          placeholder="Activity name"
                          className="w-full px-3 py-2 bg-[var(--mist)] border border-[var(--border)] focus:border-[var(--ink)] rounded-md text-sm outline-none"
                        />
                        <input
                          type="text"
                          value={ec.role}
                          onChange={(e) => updateEC(i, "role", e.target.value)}
                          placeholder="Role (e.g. Captain, Founder)"
                          className="w-full px-3 py-2 bg-[var(--mist)] border border-[var(--border)] focus:border-[var(--ink)] rounded-md text-sm outline-none"
                        />
                      </div>
                      <select
                        value={ec.category}
                        onChange={(e) =>
                          updateEC(i, "category", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-[var(--mist)] border border-[var(--border)] focus:border-[var(--ink)] rounded-md text-sm outline-none"
                      >
                        {EC_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <textarea
                        rows={2}
                        value={ec.impact}
                        onChange={(e) =>
                          updateEC(i, "impact", e.target.value)
                        }
                        placeholder="Impact — what you achieved, scope, hours, outcomes..."
                        className="w-full px-3 py-2 bg-[var(--mist)] border border-[var(--border)] focus:border-[var(--ink)] rounded-md text-sm outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-semibold text-[var(--ink)] tracking-tight">
                  Contests
                </h2>
                <p className="text-sm text-[var(--ink-soft)] mt-0.5">
                  Optional. CEMC and computing contests matter most for Waterloo
                  and other competitive STEM programs — leave blank if you
                  haven&apos;t written them.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--mist)]/40 p-4 space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                  Waterloo / CEMC contests
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-xs text-[var(--ink-soft)] font-medium mb-1 block">
                      Euclid (/100)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="e.g. 78"
                      value={contests.euclid}
                      onKeyDown={(event) => {
                        if (["-", "e", "E", "+", "."].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setContests({ ...contests, euclid: "" });
                          return;
                        }
                        setContests({
                          ...contests,
                          euclid: Math.min(100, Math.max(0, Number(val))),
                        });
                      }}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--border)] focus:border-[var(--ink)] rounded-lg text-sm outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--ink-soft)] font-medium mb-1 block">
                      CSMC (/60)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      placeholder="e.g. 45"
                      value={contests.csmc}
                      onKeyDown={(event) => {
                        if (event.key === "-") event.preventDefault();
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setContests({ ...contests, csmc: "" });
                          return;
                        }
                        setContests({
                          ...contests,
                          csmc: Math.min(60, Math.max(0, Number(val))),
                        });
                      }}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--border)] focus:border-[var(--ink)] rounded-lg text-sm outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--ink-soft)] font-medium mb-1 block">
                      CCC (/75)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={75}
                      placeholder="e.g. 52"
                      value={contests.ccc}
                      onKeyDown={(event) => {
                        if (["-", "e", "E", "+", "."].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setContests({ ...contests, ccc: "" });
                          return;
                        }
                        setContests({
                          ...contests,
                          ccc: Math.min(75, Math.max(0, Number(val))),
                        });
                      }}
                      className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--border)] focus:border-[var(--ink)] rounded-lg text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--paper)]/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 && choiceIndex === 0}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition ${
              step === 1 && choiceIndex === 0
                ? "opacity-0 cursor-default"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--mist)] cursor-pointer"
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleContinue}
              disabled={
                step === 1 &&
                choiceIndex === 0 &&
                (!targetChoices[0].university.trim() ||
                  !targetChoices[0].program.trim())
              }
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center gap-1.5 ${
                step === 1 &&
                choiceIndex === 0 &&
                (!targetChoices[0].university.trim() ||
                  !targetChoices[0].program.trim())
                  ? "bg-[var(--border)] text-[var(--ink-soft)] cursor-not-allowed"
                  : "bg-[var(--ink)] text-white hover:bg-[var(--ink)]/90 cursor-pointer"
              }`}
            >
              <span>Continue</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 text-sm font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-2.5 rounded-lg transition cursor-pointer"
            >
              Calculate my odds <Sparkles size={16} />
            </button>
          )}
        </div>
      </div>
      <CourseInfoModal
        isOpen={showCourseInfo}
        onClose={() => setShowCourseInfo(false)}
      />
    </div>
  );
}
