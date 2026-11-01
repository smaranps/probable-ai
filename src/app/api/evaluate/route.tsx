
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }
    const ai = new GoogleGenAI({ apiKey });

    const profile = await req.json();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile data is required." },
        { status: 400 }
      );
    }
    const filePath = path.join(process.cwd(), "public", "data.json");
    let programBenchmarkContext = "No specific dataset entry found.";

    if (fs.existsSync(filePath)) {
      try {
        const rawData = fs.readFileSync(filePath, "utf-8");
        const parsedData = JSON.parse(rawData);
        const institutions: any[] = parsedData.institutions || [];
        const targetUni = (profile.university || "").toLowerCase().trim();
        const targetProg = (profile.program || "").toLowerCase().trim();

        const matchedInst = institutions.find((inst: any) => {
          const name = (inst.name || "").toLowerCase();
          const id = (inst.id || "").toLowerCase();
          return (
            name.includes(targetUni) ||
            targetUni.includes(name) ||
            id.includes(targetUni)
          );
        });

        if (matchedInst) {
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

          if (matchedProg) {
            programBenchmarkContext = JSON.stringify({
              universityName: matchedInst.name,
              programName: matchedProg.program_name,
              historicalMid50Range: matchedProg.historical_mid_50_range,
              cutoffMinimum: matchedProg.cutoff_minimum,
              competitivenessTier: matchedProg.competitiveness_tier,
              adjustmentSensitivity: matchedProg.adjustment_sensitivity,
            });
          }
        }
      } catch (e) {
        console.warn("Could not read public/data.json for benchmark context");
      }
    }

    const systemPrompt = `
    You are an admissions evaluation engine for competitive Canadian Universities (e.g., Waterloo, U of T, McMaster, UBC).
    
    BENCHMARK DATASET CONTEXT FOR TARGET PROGRAM:
    ${programBenchmarkContext}

    EVALUATION INSTRUCTIONS:
    1. Evaluate Extracurriculars:
       - Grade EC leadership out of 100 using the STRUCTURED extracurricular list below.
       - Weigh: (a) role seniority, (b) category relevance to the target program, (c) quantified impact
         (hours, people reached, awards, outcomes). Vague or empty impact = lower score.
       - Do NOT treat a raw string dump as equal to structured role+impact entries.
    2. Evaluate Course & Contest Rigor:
       - Grade Course Rigor out of 100 based on Grade 12 AP, IB, or heavy STEM/Math course combinations.
         Applicant may list 8+ courses; Top 6 already locks prerequisites then highest electives.
       - Grade Contest Rigor out of 100 based on STEM contest participation (Euclid, CSMC, CCC) and recorded scores.
         Missing contests is common — score neutrally, do not punish absence heavily unless the program is known for contest weighting.
    3. Evaluate Adjustment Factor:
       - Score from 0 to 100. Deduct heavily if Non-Day School (OVS, Night School, Private) is detected for required courses.
    4. Generate Calculation Proof:
       - Create an array of transparent scoring line items explaining how the net adjusted grade index was calculated.
       - Include base Top 6, OVS penalties, contest boosts, and EC multiplier adjustments.

    Output ONLY raw JSON matching this structure EXACTLY:
    {
      "ecLeadershipScore": number (0-100),
      "courseRigorScore": number (0-100),
      "contestRigorScore": number (0-100),
      "adjustmentFactorScore": number (0-100),
      "calculationProof": [
        {
          "label": "string",
          "impact": "string (e.g. '+95.2%' or '-3.5%')",
          "type": "base" | "penalty" | "boost" | "neutral"
        }
      ],
      "opportunityItems": [
        {
          "id": 1,
          "title": "string",
          "impact": "string (e.g. '+4% Odds')",
          "desc": "string"
        },
        {
          "id": 2,
          "title": "string",
          "impact": "string",
          "desc": "string"
        },
        {
          "id": 3,
          "title": "string",
          "impact": "string",
          "desc": "string"
        }
      ]
    }
    `;

    const formatECs = (ecs: unknown) => {
      if (!ecs) return "None provided";
      if (typeof ecs === "string") return ecs.trim() || "None provided";
      if (!Array.isArray(ecs) || ecs.length === 0) return "None provided";
      return ecs
        .map((e: any, i: number) => {
          if (typeof e === "string") return `${i + 1}. ${e}`;
          return [
            `${i + 1}. ${e.title || "Untitled"}`,
            e.role ? `Role: ${e.role}` : null,
            e.category ? `Category: ${e.category}` : null,
            e.impact ? `Impact: ${e.impact}` : null,
          ]
            .filter(Boolean)
            .join(" | ");
        })
        .join("\n");
    };

    const userContext = `
    APPLICANT PROFILE DATA:
    Target University: ${profile.university || "Not Specified"}
    Target Program: ${profile.program || "Not Specified"}
    Applicant Pool Type: ${profile.applicantType || "OUAC 101"}
    Calculated Top 6 Average: ${profile.top6Average || 0}%
    (Computed from prerequisites first, then highest electives among entered courses.)
    Has Non-Day School (OVS/Night School): ${
      profile.hasOvsOrNightSchool ? "Yes" : "No"
    }

    Extracurriculars (structured for EC leadership scoring):
    ${formatECs(profile.extracurriculars)}

    STEM Contests (optional — Euclid/CSMC/CCC):
    ${JSON.stringify(profile.contests || profile.contestScores || {}, null, 2)}

    Grade 11/12 Courses (full list; Top 6 already computed):
    ${JSON.stringify(profile.courses || [], null, 2)}
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userContext,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    if (!response.text) {
      throw new Error("Empty response returned from Gemini model.");
    }

    const evaluationResult = JSON.parse(response.text);
    return NextResponse.json(evaluationResult);
  } catch (error) {
    console.error("Gemini Profile Evaluation API Error:", error);
    return NextResponse.json(
      { error: "Failed to process profile evaluation with Gemini." },
      { status: 500 }
    );
  }
}
