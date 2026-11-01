import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { university, program } = await req.json();

    if (!university) {
      return NextResponse.json(
        { error: "University is required" },
        { status: 400 }
      );
    }
    const filePath = path.join(process.cwd(), "public", "data.json");
    let institutions: any[] = [];
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, "utf-8");
      const parsedData = JSON.parse(rawData);
      institutions = parsedData.institutions || [];
    }
    const targetUni = university.toLowerCase().trim();
    const targetProg = program ? program.toLowerCase().trim() : "";
    const matchedInst = institutions.find((inst: any) => {
      const name = (inst.name || "").toLowerCase();
      const id = (inst.id || "").toLowerCase();
      return (
        name.includes(targetUni) ||
        targetUni.includes(name) ||
        id.includes(targetUni)
      );
    });
    if (!matchedInst) {
      return NextResponse.json({
        university,
        status: "no_data",
        sampleCount: 0,
        benchmarkMean: null,
        isProgramSpecific: false,
      });
    }

    const programs: any[] = matchedInst.programs || [];
    const matchedProg = targetProg
      ? programs.find((p: any) => {
          const pName = (p.program_name || "").toLowerCase();
          const pId = (p.program_id || "").toLowerCase();
          return (
            pName.includes(targetProg) ||
            targetProg.includes(pName) ||
            pId.includes(targetProg)
          );
        })
      : programs[0];

    const targetProgramObj = matchedProg || programs[0];
    if (!targetProgramObj) {
      if (matchedInst.verified && matchedInst.general_admission_minimum) {
        return NextResponse.json({
          university: matchedInst.name,
          status: "floor_only",
          sampleCount: 0,
          benchmarkMean: null,
          eligibilityFloor: matchedInst.general_admission_minimum,
          isProgramSpecific: false,
          note: "This is the university-wide minimum eligibility average, not a program-specific competitive average. We don't have verified program-level data for this school/program yet.",
        });
      }
      return NextResponse.json({
        university: matchedInst.name,
        status: "no_data",
        sampleCount: 0,
        benchmarkMean: null,
        isProgramSpecific: false,
      });
    }

    let computedMean: number | null = null;
    let sampleCount = 0;
    const dist = targetProgramObj.cudo_entering_distribution;
    const midRange = targetProgramObj.historical_mid_50_range;
    if (dist) {
      const p95 = dist["95_plus"] || 0;
      const p90 = dist["90_94.9"] || 0;
      const p85 = dist["85_89.9"] || 0;
      const pUnder = dist["under_85"] || 0;
      computedMean = Number(
        ((p95 * 97.5 + p90 * 92.5 + p85 * 87.5 + pUnder * 81.0) / 100).toFixed(1)
      );
      sampleCount = targetProgramObj.sample_count || 0;
    } else if (midRange && midRange.length === 2) {
      computedMean = Number(((midRange[0] + midRange[1]) / 2).toFixed(1));
      sampleCount = targetProgramObj.sample_count || 0;
    }

    if (computedMean === null) {
      return NextResponse.json({
        university: matchedInst.name,
        program: targetProgramObj.program_name,
        status: "no_data",
        sampleCount: 0,
        benchmarkMean: null,
        isProgramSpecific: Boolean(matchedProg),
      });
    }

    return NextResponse.json({
      university: matchedInst.name,
      program: targetProgramObj.program_name,
      status: "estimated",
      sampleCount,
      benchmarkMean: computedMean,
      isProgramSpecific: Boolean(matchedProg),
      cutoffMinimum: targetProgramObj.cutoff_minimum,
      competitivenessTier: targetProgramObj.competitiveness_tier,
      mid50Range: targetProgramObj.historical_mid_50_range,
    });
  } catch (error) {
    console.error("Benchmark API Error:", error);
    return NextResponse.json(
      { error: "Failed to compute benchmark" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    message:
      "CUDO Institutional Benchmark API active. Send a POST request with { university, program }.",
  });
}