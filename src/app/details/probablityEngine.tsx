import { UserProfileData } from "@/app/components/onboarding";

export interface CalculationFactor {
  label: string;
  impact: string;
  type: "positive" | "negative" | "neutral";
}

export interface BenchmarkMetrics {
  userAverage: number;
  benchmarkAverage: number;
  userEuclid: number;
  benchmarkEuclid: number;
  userECScore: number;
  benchmarkECScore: number;

  tierLabel:
    | "High Chance"
    | "Moderate Chance"
    | "Low Chance"
    | "Unlikely Reach";
  tierColor: "emerald" | "amber" | "rose";
  minRange: number;
  maxRange: number;

  factors: CalculationFactor[];
}

export function calculateAdmissionsOdds(
  profile: UserProfileData
): BenchmarkMetrics {
  const avg = profile.top6Average || 0;
  const euclid = Number(profile.contests.euclid) || 0;
  const ecLength = profile.extracurriculars?.length || 0;
  const userECScore = Math.min(100, Math.max(40, ecLength * 12 + 40));

  const benchmarkAverage = 95.5;
  const benchmarkEuclid = 75;
  const benchmarkECScore = 80;

  let baseOdds = 50;
  const factors: CalculationFactor[] = [];
  const gradeDiff = avg - benchmarkAverage;
  const gradeImpact = gradeDiff * 7;
  baseOdds += gradeImpact;
  factors.push({
    label: `Top 6 Avg (${avg}% vs ${benchmarkAverage}% Target)`,
    impact:
      gradeImpact >= 0
        ? `+${gradeImpact.toFixed(1)}%`
        : `${gradeImpact.toFixed(1)}%`,
    type: gradeImpact >= 0 ? "positive" : "negative",
  });
  if (euclid > 0) {
    const contestDiff = euclid - benchmarkEuclid;
    const contestImpact = contestDiff * 0.5;
    baseOdds += contestImpact;
    factors.push({
      label: `Euclid Score (${euclid} vs ${benchmarkEuclid} Median)`,
      impact:
        contestImpact >= 0
          ? `+${contestImpact.toFixed(1)}%`
          : `${contestImpact.toFixed(1)}%`,
      type: contestImpact >= 0 ? "positive" : "negative",
    });
  } else {
    factors.push({
      label: "No Euclid Contest Score Provided",
      impact: "-5.0%",
      type: "negative",
    });
    baseOdds -= 5;
  }
  if (profile.hasOvsOrNightSchool) {
    baseOdds -= 12;
    factors.push({
      label: "Non-Day School / OVS Penalty Applied",
      impact: "-12.0%",
      type: "negative",
    });
  } else {
    factors.push({
      label: "Standard Day School Delivery",
      impact: "+0.0%",
      type: "neutral",
    });
  }
  const meanOdds = Math.min(95, Math.max(10, Math.round(baseOdds)));
  const minRange = Math.max(5, meanOdds - 5);
  const maxRange = Math.min(98, meanOdds + 5);

  let tierLabel: BenchmarkMetrics["tierLabel"] = "Moderate Chance";
  let tierColor: BenchmarkMetrics["tierColor"] = "amber";

  if (meanOdds >= 75) {
    tierLabel = "High Chance";
    tierColor = "emerald";
  } else if (meanOdds >= 50) {
    tierLabel = "Moderate Chance";
    tierColor = "amber";
  } else {
    tierLabel = "Unlikely Reach";
    tierColor = "rose";
  }

  return {
    userAverage: avg,
    benchmarkAverage,
    userEuclid: euclid,
    benchmarkEuclid,
    userECScore,
    benchmarkECScore,
    tierLabel,
    tierColor,
    minRange,
    maxRange,
    factors,
  };
}
