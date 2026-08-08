"use client";

import React from "react";
import { Sliders, Award, UserCheck } from "lucide-react";

interface ScenarioState {
  simulatedAverage: number;
  simulatedEuclid: number;
  simulatedEC: number;
}

interface MultiSliderProps {
  scenario: ScenarioState;
  defaults: {
    originalAverage: number;
    originalEuclid?: number;
    originalEC?: number;
  };
  onChange: (updated: ScenarioState) => void;
}

export default function ScenarioSliderPanel({
  scenario,
  defaults,
  onChange,
}: MultiSliderProps) {
  const handleAverageChange = (val: number) => {
    onChange({ ...scenario, simulatedAverage: val });
  };

  const handleEuclidChange = (val: number) => {
    onChange({ ...scenario, simulatedEuclid: val });
  };

  const handleECChange = (val: number) => {
    onChange({ ...scenario, simulatedEC: val });
  };

  return (
    <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/90 shadow-sm no-print space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders size={16} className="text-emerald-600" />
          Interactive "What-If" Scenario Engine
        </h4>
        <span className="text-[11px] font-semibold text-slate-400">
          Slide parameters to test impact
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders size={13} className="text-emerald-600" />
              Top 6 Avg
            </label>
            <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-md">
              {scenario.simulatedAverage.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="80"
            max="99"
            step="0.5"
            value={scenario.simulatedAverage}
            onChange={(e) => handleAverageChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-0.5">
            <span>80.0%</span>
            <span>Base: {defaults.originalAverage}%</span>
            <span>99.0%</span>
          </div>
        </div>
        <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Award size={13} className="text-emerald-600" />
              Euclid Score
            </label>
            <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-md">
              {scenario.simulatedEuclid} / 100
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            step="1"
            value={scenario.simulatedEuclid}
            onChange={(e) => handleEuclidChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-0.5">
            <span>30</span>
            <span>Base: {defaults.originalEuclid ?? "N/A"}</span>
            <span>100</span>
          </div>
        </div>
        <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <UserCheck size={13} className="text-emerald-600" />
              EC &amp; Supplemental
            </label>
            <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-md">
              {scenario.simulatedEC} / 100
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="1"
            value={scenario.simulatedEC}
            onChange={(e) => handleECChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-0.5">
            <span>50</span>
            <span>Base: {defaults.originalEC ?? 75}</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
