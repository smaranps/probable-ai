import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
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
       - Grade EC leadership out of 100 based on quantifiable impact, scope, innovation, and leadership roles.
    2. Evaluate Course & Contest Rigor:
       - Grade Course Rigor out of 100 based on Grade 12 AP, IB, or heavy STEM/Math course combinations.
       - Grade Contest Rigor out of 100 based on STEM contest participation (Euclid, CSMC, CCC) and recorded scores.
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

    const userContext = `
    APPLICANT PROFILE DATA:
    Target University: ${profile.university || "Not Specified"}
    Target Program: ${profile.program || "Not Specified"}
    Applicant Pool Type: ${profile.applicantType || "OUAC 101"}
    Calculated Top 6 Average: ${profile.top6Average || 0}%
    Has Non-Day School (OVS/Night School): ${
      profile.hasOvsOrNightSchool ? "Yes" : "No"
    }

    Extracurriculars:
    ${JSON.stringify(profile.extracurriculars || [], null, 2)}

    STEM Contests:
    ${JSON.stringify(profile.contests || profile.contestScores || [], null, 2)}

    Grade 11/12 Courses:
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
