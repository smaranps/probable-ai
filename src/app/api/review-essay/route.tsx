import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
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
    const body = await req.json();
    const essayText = body?.essayText;

    if (!essayText || typeof essayText !== "string" || essayText.trim().length < 50) {
      return NextResponse.json(
        { error: "Essay text is required and must be at least 50 characters long." },
        { status: 400 }
      );
    }
    const systemPrompt = `
    You are an expert high school admissions counselor and writing evaluator specializing in university supplements (e.g., Waterloo AIF, U of T essays).
    Analyze the submitted essay for authentic human writing vs. synthetic/AI-generated writing patterns.

    EVALUATION HEURISTICS:
    1. Burstiness & Flow: Evaluate sentence length variation and natural voice transitions.
    2. Overused AI Patterns: Check for cliché "AI essay" vocabulary (e.g., "testament", "tapestry", "fostering", "beacon", "pivotal", "delve").
    3. Specificity: Look for real, concrete personal anecdotes versus generic claims.

    OUTPUT INSTRUCTIONS:
    Output ONLY raw JSON matching this structure EXACTLY:
    {
      "humanScore": number (0-100),
      "aiScore": number (0-100),
      "summary": "string (Short 2-sentence structural assessment)",
      "flaggedPhrases": ["string"],
      "feedback": ["string (Actionable tip to make the essay feel more authentic and impactful)"]
    }
    `;

    const userPrompt = `
    APPLICANT ESSAY TEXT TO EVALUATE:
    """
    ${essayText}
    """
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    if (!response.text) {
      throw new Error("Empty response returned from Gemini engine.");
    }

    const evaluationResult = JSON.parse(response.text);
    return NextResponse.json(evaluationResult);

  } catch (error) {
    console.error("Gemini Essay Review API Error:", error);
    return NextResponse.json(
      { error: "Failed to review essay with Gemini." },
      { status: 500 }
    );
  }
}