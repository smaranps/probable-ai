"use client";

import React, { useState } from "react";
import { CheckSquare, Flame, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Google_Sans_Flex } from "next/font/google";
const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-google-sans-flex",
});

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: "Grades" | "Supps" | "Finance" | "Admin";
  completed: boolean;
}
const INITIAL_TASKS: ChecklistItem[] = [
  {
    id: "1",
    title: "Audit Grade 12 Prerequisites",
    description: "Verify your Top 6 courses match your target program requirements.",
    category: "Grades",
    completed: false,
  },
  {
    id: "2",
    title: "Draft Supplemental Essay Prompts",
    description: "Write initial drafts for your Supplementary Applicaion.",
    category: "Supps",
    completed: false,
  },
  {
    id: "3",
    title: "Check Automatic Entrance Scholarship Tiers",
    description: "Run your current average through the scholarship estimator.",
    category: "Finance",
    completed: false,
  },
  {
    id: "4",
    title: "Confirm OUAC Account & OUAC Number",
    description: "Ensure your secondary school reference number is linked properly.",
    category: "Admin",
    completed: false,
  },
  {
    id: "5",
    title: "Set Up Important Deadline Alerts",
    description: "Add major application cutoffs and document deadlines to your calendar.",
    category: "Admin",
    completed: false,
  },
];

export default function ReadinessChecklistCard() {
  const [tasks, setTasks] = useState<ChecklistItem[]>(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6" style={{ fontFamily: googleSansFlex.style.fontFamily }}>
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
             Action Plan Checklist
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Feeling lost? Complete these steps first to get your application on track.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-right">
          <div className="text-[10px] font-bold text-gray-400 uppercase">Readiness Score</div>
          <div className="text-lg font-mono font-bold text-emerald-600">
            {progressPercent}% <span className="text-xs text-gray-400">({completedCount}/{tasks.length})</span>
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              task.completed
                ? "bg-emerald-50/40 border-emerald-200/60 opacity-80"
                : "bg-gray-50/70 border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => {}}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold text-xs ${
                    task.completed ? "line-through text-gray-400" : "text-gray-900"
                  }`}
                >
                  {task.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-gray-200/60 text-gray-600 rounded font-mono">
                  {task.category}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">{task.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}