"use client";

import React from "react";
import { X, BookOpen } from "lucide-react";

interface CourseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CourseInfo {
  code: string;
  name: string;
  category: string;
}
const COURSE_LIST: CourseInfo[] = [
  { code: "ENG4U", name: "English", category: "English" },
  { code: "MHF4U", name: "Advanced Functions", category: "Math" },
  { code: "MCV4U", name: "Calculus and Vectors", category: "Math" },
  { code: "MDM4U", name: "Mathematics of Data Management", category: "Math" },
  { code: "SPH4U", name: "Physics", category: "Science" },
  { code: "SCH4U", name: "Chemistry", category: "Science" },
  { code: "SBI4U", name: "Biology", category: "Science" },
  { code: "ICS4U", name: "Computer Science", category: "Science" },
  {
    code: "TEJ4M",
    name: "Computer Engineering Technology",
    category: "Technology",
  },
  {
    code: "HSB4U",
    name: "Challenge and Change in Society",
    category: "Social Science",
  },
  {
    code: "HSP4U",
    name: "Introduction to Anthropology, Psychology, and Sociology",
    category: "Social Science",
  },
  {
    code: "CIA4U",
    name: "Analysing Current Economic Issues",
    category: "Business",
  },
  {
    code: "BAT4M",
    name: "Financial Accounting Principles",
    category: "Business",
  },
  {
    code: "BBB4M",
    name: "International Business Fundamentals",
    category: "Business",
  },
  {
    code: "CHY4U",
    name: "World History Since the Fifteenth Century",
    category: "History",
  },
  {
    code: "CGW4U",
    name: "World Issues: A Geographic Analysis",
    category: "Geography",
  },
  { code: "HHG4M", name: "World Cultures", category: "Social Science" },
  { code: "AVI4M", name: "Media Arts", category: "Arts" },
  {
    code: "AWQ4M",
    name: "Studio Arts: Photography and Film",
    category: "Arts",
  },
  { code: "FSF4U", name: "French", category: "Language" },
];

export default function CourseInfoModal({
  isOpen,
  onClose,
}: CourseInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 mt-[20px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Common Grade 12 Course Codes
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-3 text-xs text-slate-500 border-b border-slate-100">
          Ontario course codes follow a pattern: subject (3–4 letters
          abbreviation of subject), grade (1 being grade 9 and 4 being grade
          12), and type (U = University, M = University/College, C = College).
          Here are some of the most common ones:
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          <div className="divide-y divide-slate-100">
            {COURSE_LIST.map((course) => (
              <div
                key={course.code}
                className="flex items-center justify-between gap-4 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {course.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {course.category}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                  {course.code}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400">
          Don't see your course? You can still type its code directly into the
          form.
        </div>
      </div>
    </div>
  );
}
