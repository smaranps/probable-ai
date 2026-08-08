"use client";

import React, { useEffect, useState } from "react";
import { UserProfileData } from "@/app/components/onboarding";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Users, Sparkles, TrendingUp } from "lucide-react";

interface DashboardChartsProps {
  profile: UserProfileData;
  
}

interface BenchmarkData {
  sampleCount: number;
  benchmarkMean: number;
  isProgramSpecific: boolean;
}

export default function DashboardCharts({ profile }: DashboardChartsProps) {
  const userAvg = profile.top6Average || 0;
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBenchmark() {
      setLoading(true);
      try {
        const res = await fetch("/api/benchmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            university: profile.university,
            program: profile.program,
          }),
        });
        const data = await res.json();
        setBenchmark(data);
      } catch (err) {
        console.error("Error fetching university benchmark:", err);
      } finally {
        setLoading(false);
      }
    }

    if (profile.university) {
      fetchBenchmark();
    }
  }, [profile.university, profile.program]);

  const benchmarkMean = benchmark?.benchmarkMean ?? 92.5;
  const sampleCount = benchmark?.sampleCount ?? 0;

  const comparisonData = [
    {
      category: "Your Top 6",
      average: userAvg,
      fill: "#10b981",
    },
    {
      category: `${profile.university} Offer Avg`,
      average: benchmarkMean,
      fill: "#6366f1",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 w-full max-w-[769px] md:w-1/  md:h-[600]/ max-h-[500]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            Top 6 Average vs. Historical Admissions Data
          </h3>
          <p className="text-xs text-slate-500">
            Comparing your average directly against accepted applicants for{" "}
            <span className="font-semibold text-slate-800">
              {profile.university}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Users size={14} className="text-indigo-600" />
          {loading ? (
            <span className="animate-pulse">Loading dataset...</span>
          ) : (
            <span>
              Sample Size:{" "}
              <strong className="text-slate-900 font-mono">
                {sampleCount}
              </strong>{" "}
              entries
            </span>
          )}
        </div>
      </div>
      <div className="h-72 w-full pt-2">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400 animate-pulse gap-2">
            <Sparkles size={16} className="animate-spin text-indigo-500" />
            Filtering matching dataset records...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: -10, bottom: 10 }}
            >
              <XAxis
                dataKey="category"
                tick={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}
              />
              <YAxis
                domain={[70, 100]}
                tick={{ fontSize: 11, fill: "#64748b" }}
                unit="%"
              />
              <Tooltip
                formatter={(value: any) => [`${value}%`, "Top 6 Average"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine
                y={benchmarkMean}
                stroke="#6366f1"
                strokeDasharray="4 4"
                label={{
                  value: `Benchmark: ${benchmarkMean}%`,
                  fill: "#6366f1",
                  fontSize: 11,
                  fontWeight: 700,
                  position: "top",
                }}
              />
              <Bar dataKey="average" radius={[8, 8, 0, 0]} barSize={55}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {!loading && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-600">Difference from Accepted Mean:</span>
          <span
            className={`font-mono font-bold text-sm ${
              userAvg >= benchmarkMean ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {userAvg >= benchmarkMean ? "+" : ""}
            {(userAvg - benchmarkMean).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
