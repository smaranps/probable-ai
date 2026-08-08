"use client";

import React, { useState, useMemo } from "react";
import { UNIVERSITIES } from "@/app/data/universities";
import {
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { db, auth } from "../services/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

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
  extracurriculars: string;
}
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
];

export function calculateOUACTop6(
  courses: CourseEntry[],
  requiredCodes: string[] = ["ENG4U", "MHF4U", "MCV4U"]
): number {
  const validCourses = courses.filter(
    (c) =>
      c.code.trim() !== "" && typeof c.grade === "number" && !isNaN(c.grade)
  ) as (CourseEntry & { grade: number })[];

  if (validCourses.length === 0) return 0;

  const top6: (CourseEntry & { grade: number })[] = [];
  const remaining: (CourseEntry & { grade: number })[] = [];

  validCourses.forEach((course) => {
    const isReq = requiredCodes.some((req) =>
      course.code.trim().toUpperCase().includes(req.toUpperCase())
    );
    if (isReq) {
      top6.push(course);
    } else {
      remaining.push(course);
    }
  });

  remaining.sort((a, b) => b.grade - a.grade);

  while (top6.length < 6 && remaining.length > 0) {
    top6.push(remaining.shift()!);
  }

  const total = top6.reduce((sum, c) => sum + c.grade, 0);
  return Number((total / top6.length).toFixed(1));
}

interface OnboardingModalProps {
  onComplete: (data: UserProfileData) => void;
  userDisplayName?: string;
}

export default function OnboardingModal({
  onComplete,
  userDisplayName = "Student",
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [choiceIndex, setChoiceIndex] = useState<0 | 1 | 2>(0);
  const [targetChoices, setTargetChoices] = useState<TargetChoice[]>([
    { university: "", program: "" },
    { university: "", program: "" },
    { university: "", program: "" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [courses, setCourses] = useState<CourseEntry[]>(DEFAULT_COURSES);
  const router = useRouter();
  const currentChoice = targetChoices[choiceIndex];

  const updateCurrentChoice = (
    field: "university" | "program",
    value: string
  ) => {
    setTargetChoices((prev) => {
      const updated = [...prev];
      updated[choiceIndex] = { ...updated[choiceIndex], [field]: value };
      return updated;
    });
  };

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
        ],
        contests: { euclid: 78, csmc: 48, ccc: 52 },
        hasOvsOrNightSchool: false,
        extracurriculars:
          "Robotics Captain, Founder of a non-profit, DECA ICDC Finalist",
      },
    },
    {
      label: " 92% + OVS Flag",
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
        ],
        contests: { euclid: "", csmc: "", ccc: "" },
        hasOvsOrNightSchool: true,
        extracurriculars: "Math Club Vice President, Peer Tutor (100+ hrs)",
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
  const [extracurriculars, setExtracurriculars] = useState("");
  const totalUnits = 6;
  const currentUnit = step === 1 ? choiceIndex + 1 : 3 + (step - 1);

  const filteredUniversities = useMemo(() => {
    const query = currentChoice.university;
    if (!query.trim()) return UNIVERSITIES;
    return UNIVERSITIES.filter((uni) =>
      uni.toLowerCase().includes(query.toLowerCase())
    );
  }, [currentChoice.university]);
  const calculatedAverage = useMemo(() => {
    return calculateOUACTop6(courses);
  }, [courses]);

  const handleCourseChange = (
    index: number,
    field: keyof CourseEntry,
    value: any
  ) => {
    const updated = [...courses];
    updated[index] = { ...updated[index], [field]: value };
    setCourses(updated);
  };

  const addCourseRow = () => {
    if (courses.length >= 8) return;
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
    setCourses(presetData.courses);
    setContests(presetData.contests);
    setHasOvsOrNightSchool(presetData.hasOvsOrNightSchool);
    setExtracurriculars(presetData.extracurriculars);
    setStep(2);
  };

  const removeCourseRow = (index: number) => {
    if (courses.length <= 1) return;
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    const profileData: UserProfileData = {
      university: targetChoices[0].university,
      program: targetChoices[0].program,
      targetChoices,
      applicantType,
      courses,
      top6Average: calculatedAverage,
      contests,
      hasOvsOrNightSchool,
      extracurriculars,
    };

    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found.");
        localStorage.setItem("ouac_user_profile", JSON.stringify(profileData));
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
    } catch (error) {
      console.error("Error saving profile to Firestore:", error);
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      if (choiceIndex < 2) {
        setChoiceIndex((i) => (i + 1) as 0 | 1 | 2);
      } else {
        setStep(2);
      }
      return;
    }
    setStep((s) => (s < 4 ? ((s + 1) as any) : s));
  };

  const handleBack = () => {
    if (step === 1) {
      if (choiceIndex > 0) setChoiceIndex((i) => (i - 1) as 0 | 1 | 2);
      return;
    }
    setStep((s) => (s > 1 ? ((s - 1) as any) : s));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ">
      <div className="relative w-full max-w-2xl bg-slate-50/95 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] mt-[50px] ">
        <div className="bg-slate-200/60 border-b border-slate-200/80 p-3 px-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Demo Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROFILES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset.data)}
                className="text-xs bg-white hover:bg-emerald-50 hover:border-emerald-500 border border-slate-300 text-slate-800 font-semibold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pt-4 pb-4 border-b border-slate-200/80 bg-white/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
              <Sparkles size={13} />
              {step === 1
                ? `Choice ${choiceIndex + 1} of 3`
                : `Step ${step} of 4`}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {step === 1 && choiceIndex === 0 && "First Choice Program"}
              {step === 1 && choiceIndex === 1 && "Second Choice Program"}
              {step === 1 && choiceIndex === 2 && "Third Choice Program"}
              {step === 2 && "Grades & Courses"}
              {step === 3 && "Contests & Applicant Pool"}
              {step === 4 && "Additional Background"}
            </span>
          </div>

          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300 ease-out"
              style={{ width: `${(currentUnit / totalUnits) * 100}%` }}
            />
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {choiceIndex === 0
                    ? `Nice to meet you, ${userDisplayName}!`
                    : choiceIndex === 1
                    ? "What's your second choice?"
                    : "Last one — your third choice"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {choiceIndex === 0
                    ? "Select your first-choice university and program to start your analysis."
                    : "Add another university and program you're considering."}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {["First", "Second", "Third"][choiceIndex]} Choice University
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-3.5 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={currentChoice.university}
                    onChange={(e) =>
                      updateCurrentChoice("university", e.target.value)
                    }
                    placeholder="Search over 40+ universities (e.g. Waterloo, UofT)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition shadow-sm"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl bg-white p-1 shadow-inner">
                  {filteredUniversities.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      No matching university found. Type custom name above.
                    </div>
                  ) : (
                    filteredUniversities.map((uni) => (
                      <button
                        key={uni}
                        type="button"
                        onClick={() => updateCurrentChoice("university", uni)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition ${
                          currentChoice.university === uni
                            ? "bg-slate-900 text-white font-semibold"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{uni}</span>
                        {currentChoice.university === uni && (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-400"
                          />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {["First", "Second", "Third"][choiceIndex]} Choice Program
                </label>
                <input
                  type="text"
                  value={currentChoice.program}
                  onChange={(e) =>
                    updateCurrentChoice("program", e.target.value)
                  }
                  placeholder="e.g. Computer Science, Software Engineering, Health Sci"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < choiceIndex
                        ? "bg-emerald-500"
                        : i === choiceIndex
                        ? "bg-slate-900"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Grade 12 Top 6 Courses
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Enter course codes and your projected or final grades.
                  </p>
                </div>
                <div className="text-right px-3 py-1.5 rounded-xl bg-slate-900 text-white">
                  <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    Calculated Top 6
                  </div>
                  <div className="text-base font-extrabold font-mono">
                    {calculatedAverage > 0 ? `${calculatedAverage}%` : "—"}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {courses.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 shadow-sm"
                  >
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
                      placeholder="Course (e.g. MHF4U)"
                      className="w-full sm:w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-lg text-sm text-slate-900 uppercase font-mono outline-none"
                    />
                    <div className="flex items-center gap-1 w-full sm:w-28">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={c.grade}
                        onChange={(e) =>
                          handleCourseChange(
                            i,
                            "grade",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="Grade"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-lg text-sm text-slate-900 font-mono outline-none"
                      />
                      <span className="text-xs font-bold text-slate-400">
                        %
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 ml-auto">
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
                          className="rounded border-slate-300 text-slate-900 focus:ring-0"
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
                          className="rounded border-slate-300 text-slate-900 focus:ring-0"
                        />
                        Repeated
                      </label>
                      <button
                        type="button"
                        onClick={() => removeCourseRow(i)}
                        className="text-slate-400 hover:text-red-500 p-1 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {courses.length < 8 && (
                <button
                  type="button"
                  onClick={addCourseRow}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-slate-700 transition"
                >
                  <Plus size={15} /> Add another course row
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Contest Scores & Applicant Pool
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Top STEM programs weigh competition scores heavily.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Applicant Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setApplicantType("101")}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      applicantType === "101"
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-semibold text-sm">OUAC 101</div>
                    <div
                      className={`text-xs mt-0.5 ${
                        applicantType === "101"
                          ? "text-slate-300"
                          : "text-slate-500"
                      }`}
                    >
                      Ontario High School Student
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplicantType("105")}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      applicantType === "105"
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-semibold text-sm">OUAC 105</div>
                    <div
                      className={`text-xs mt-0.5 ${
                        applicantType === "105"
                          ? "text-slate-300"
                          : "text-slate-500"
                      }`}
                    >
                      Out-of-Province / International
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  STEM Contests (Optional)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-xs text-slate-500 font-medium mb-1 block">
                      Euclid (/100)
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 78"
                      value={contests.euclid}
                      onChange={(e) =>
                        setContests({
                          ...contests,
                          euclid:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-sm text-slate-900 outline-none shadow-sm"
                    />
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 font-medium mb-1 block">
                      CSMC (/60)
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 45"
                      value={contests.csmc}
                      onChange={(e) =>
                        setContests({
                          ...contests,
                          csmc:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-sm text-slate-900 outline-none shadow-sm"
                    />
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 font-medium mb-1 block">
                      CCC (/75)
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 52"
                      value={contests.ccc}
                      onChange={(e) =>
                        setContests({
                          ...contests,
                          ccc:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-sm text-slate-900 outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Delivery & Extracurriculars
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Provide context to analyze non-day school adjustments.
                </p>
              </div>
              <label className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:border-slate-300 transition shadow-sm">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-slate-900">
                    Non-Day School Courses (OVS / Night School / Blyth)
                  </div>
                  <div className="text-xs text-slate-500">
                    Did you take required courses outside regular day school?
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasOvsOrNightSchool}
                  onChange={(e) => setHasOvsOrNightSchool(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                />
              </label>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Extracurricular Highlights & Leadership
                </label>
                <textarea
                  rows={4}
                  value={extracurriculars}
                  onChange={(e) => setExtracurriculars(e.target.value)}
                  placeholder="List 2-3 key ECs, executive roles, or projects (e.g. Robotics Club Captain, Lifeguard, DECA Provincial Finalist)..."
                  className="w-full p-3 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-200/80 bg-white/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 && choiceIndex === 0}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition ${
              step === 1
                ? "opacity-0 cursor-default"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>
          {step < 4 ? (
            <button
              type="button"
              disabled={
                step === 1 &&
                (!currentChoice.university || !currentChoice.program)
              }
              onClick={handleContinue}
              className="flex items-center gap-1.5 text-sm font-semibold
              bg-slate-900 hover:bg-slate-800 disabled:opacity-40
              disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl
              transition shadow-md cursor-pointer"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              Calculate My Odds <Sparkles size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
