"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
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
export function CompetitivenessRadar({ metrics, isLoading }: RadarProps) {
  if (isLoading) {
    return (
      <div className="w-full h-[500px] bg-white/70 backdrop-blur-xl border border-slate-200/70 rounded-xl p-5 flex items-center justify-center shadow-sm shadow-slate-200/50">
        <span className="text-slate-600 text-sm animate-pulse">
          Computing vector benchmarks...
        </span>
      </div>
    );
  }
  const chartData = [
    {
      subject: "Top 6 Avg",
      applicant: metrics?.applicantTop6 ?? 0,
      medianAdmitted: metrics?.medianTop6 ?? 90,
    },
    {
      subject: "STEM Contests",
      applicant: metrics?.applicantContest ?? 0,
      medianAdmitted: metrics?.medianContest ?? 0,
    },
    {
      subject: "EC Leadership",
      applicant: metrics?.applicantEC ?? 0,
      medianAdmitted: metrics?.medianEC ?? 80,
    },
    {
      subject: "Course Rigor",
      applicant: metrics?.applicantRigor ?? 0,
      medianAdmitted: metrics?.medianRigor ?? 95,
    },
    {
      subject: "Adj. Factor",
      applicant: metrics?.applicantAdjFactor ?? 0,
      medianAdmitted: metrics?.medianAdjFactor ?? 90,
    },
  ];

  return (
    <div className="w-full max-w-[769px] md:w-1/2 bg-white/70 backdrop-blur-xl border border-slate-200/70 rounded-xl p-5 flex flex-col justify-between shadow-sm shadow-slate-200/50 h-[500px]">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-base sm:text-lg text-slate-900">
            5-Vector Profile Analysis
          </h3>
          <p className="text-xs mt-0.5 text-slate-500">
            Applicant Vector vs. Institutional Baseline
          </p>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
          Verified CUDO Vector
        </span>
      </div>

      <div className="w-full h-[230px] sm:h-[260px] my-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis
              dataKey="subject"
              stroke="#64748B"
              tick={{ fontSize: 11, fill: "#475569" }}
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
            />
            <Radar
              name="Enrolled Median"
              dataKey="medianAdmitted"
              stroke="#94A3B8"
              fill="#94A3B8"
              fillOpacity={0.15}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E2E8F0",
                borderRadius: "8px",
                color: "#1E293B",
                fontSize: "12px",
              }}
              formatter={(value: any) => [`${value}%`, "Enrolled Median"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center items-center gap-6 text-xs pt-2 border-t border-slate-200">
        <span className="flex items-center gap-2 text-emerald-600 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>{" "}
          Your Profile
        </span>
        <span className="flex items-center gap-2 text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Target
          Median
        </span>
      </div>
    </div>
  );
}
