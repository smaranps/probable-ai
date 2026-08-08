import React from "react";
import { Check, GraduationCap } from "lucide-react";
import { TargetChoice } from "@/app/components/onboarding";

export function SelectionSummary({
  targetChoices,
}: {
  targetChoices: TargetChoice[];
}) {
  return (
    <aside className="w-72 bg-white/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 shadow-xl flex flex-col gap-4 text-slate-800 mt-[50px]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500 flex items-center gap-2">
          <GraduationCap size={16} className="text-emerald-500" />
          Target Programs
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] border border-emerald-200/50">
          Live
        </span>
      </div>
      <div className="space-y-2.5">
        {targetChoices.map((choice, idx) => {
          const hasUni = Boolean(choice.university?.trim());
          const hasProg = Boolean(choice.program?.trim());
          const isComplete = hasUni || hasProg;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all  ${
                isComplete
                  ? "bg-slate-50 border-slate-200/90 shadow-sm"
                  : "bg-slate-50/40 border-dashed border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ]">
                <span>{["1st Choice", "2nd Choice", "3rd Choice"][idx]}</span>
                {hasUni && hasProg && (
                  <Check size={13} className="text-emerald-500 stroke-[3]" />
                )}
              </div>
              <p className="font-semibold text-xs text-slate-900 truncate">
                {choice.university || (
                  <span className="italic text-slate-400 font-normal">
                    Select university...
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {choice.program || (
                  <span className="italic text-slate-300 font-normal">
                    Select program...
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
