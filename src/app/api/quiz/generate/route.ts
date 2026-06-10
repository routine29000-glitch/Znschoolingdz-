import { NextRequest, NextResponse } from "next/server";
import { generateQuizQuestions } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { subject, grade, difficulty, count = 5 } = await req.json();

    if (!subject || !grade || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const raw = await generateQuizQuestions({ subject, grade, difficulty, count });

    // Clean and parse JSON
    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "فشل توليد الاختبار، حاول مرة أخرى" },
      { status: 500 }
    );
  }
}
