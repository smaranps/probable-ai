"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export interface RadarMetrics {
  applicantTop6: number;
  applicantContest: number;
  applicantEC: number;
  applicantRigor: number;
  applicantAdjFactor: number;
  medianTop6: number;
  medianContest: number;
  medianEC: number;
  medianRigor: number;
  medianAdjFactor: number;
}

interface RadarProps {
  metrics?: RadarMetrics;
  isLoading?: boolean;
}

function CustomRadarTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200 text-xs space-y-1.5 min-w-[140px]">
      <span className="font-semibold text-slate-700 block">{label}</span>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-mono font-bold text-slate-900">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function CompetitivenessRadar({ metrics, isLoading }: RadarProps) {
  
  if (isLoading) {
    return (
      <div className="w-full h-[420px] sm:h-[500px] bg-white/70 backdrop-blur-xl border border-slate-200/70 rounded-xl p-5 flex items-center justify-center shadow-sm shadow-slate-200/50">
        <span className="text-slate-600 text-sm animate-pulse">
          Computing vector benchmarks...
        </span>
      </div>
    );
  }
  if (!metrics) {
    return (
      <div className="w-full bg-white/70 backdrop-blur-xl border border-slate-200/70 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 shadow-sm shadow-slate-200/50 h-[420px] sm:h-[500px]">
        <span className="text-3xl">—</span>
        <p className="text-sm font-medium text-slate-700">No vector analysis yet</p>
        <p className="text-xs text-slate-500 max-w-xs">
          Run the AI evaluation above to see how your profile compares across
          all 5 vectors.
        </p>
      </div>
    );
  }

  const chartData = [
    { subject: "Top 6 Avg", applicant: metrics.applicantTop6, medianAdmitted: metrics.medianTop6 },
    { subject: "STEM Contests", applicant: metrics.applicantContest, medianAdmitted: metrics.medianContest },
    { subject: "EC Leadership", applicant: metrics.applicantEC, medianAdmitted: metrics.medianEC },
    { subject: "Course Rigor", applicant: metrics.applicantRigor, medianAdmitted: metrics.medianRigor },
    { subject: "Adj. Factor", applicant: metrics.applicantAdjFactor, medianAdmitted: metrics.medianAdjFactor },
  ];
  const gaps = chartData.map((d) => ({
    subject: d.subject,
    gap: Math.round((d.applicant - d.medianAdmitted) * 10) / 10,
  }));

  const overallGap =
    Math.round(
      (gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length) * 10
    ) / 10;

  return (
    <div className="w-full bg-white/70 backdrop-blur-xl border border-slate-200/70 rounded-xl p-5 flex flex-col shadow-sm shadow-slate-200/50">
      <div className="flex flex-wrap justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold text-base sm:text-lg text-slate-900">
            5-Vector Profile Analysis
          </h3>
          <p className="text-xs mt-0.5 text-slate-500">
            Applicant vector vs. institutional baseline
          </p>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-medium whitespace-nowrap">
          Verified CUDO Data
        </span>
      </div>
      <div className="w-full h-[220px] xs:h-[250px] sm:h-[280px] my-3">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="68%" data={chartData}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis
              dataKey="subject"
              stroke="#64748B"
              tick={{ fontSize: 10, fill: "#475569" }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Your Profile"
              dataKey="applicant"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.35}
              strokeWidth={2}
              animationDuration={600}
            />
            <Radar
              name="Enrolled Median"
              dataKey="medianAdmitted"
              stroke="#94A3B8"
              strokeDasharray="4 3"
              fill="#94A3B8"
              fillOpacity={0.12}
              strokeWidth={2}
              animationDuration={600}
            />
            <Tooltip content={<CustomRadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center items-center gap-6 text-xs pb-3 border-b border-slate-200">
        <span className="flex items-center gap-2 text-emerald-600 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          Your Profile
        </span>
        <span className="flex items-center gap-2 text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          Target Median
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3">
        {gaps.map((g) => (
          <div
            key={g.subject}
            className="bg-slate-50 rounded-lg px-2 py-2 text-center border border-slate-100"
          >
            <div className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold truncate">
              {g.subject}
            </div>
            <div
              className={`text-xs font-bold font-mono mt-0.5 ${
                g.gap >= 0 ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {g.gap >= 0 ? "+" : ""}
              {g.gap}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-500 text-center mt-3">
        {overallGap >= 0 ? (
          <>Your average vector sits <span className="font-semibold text-emerald-600">{overallGap} pts above</span> the enrolled median.</>
        ) : (
          <>Your average vector sits <span className="font-semibold text-rose-500">{Math.abs(overallGap)} pts below</span> the enrolled median.</>
        )}
      </p>
    </div>
  );
}