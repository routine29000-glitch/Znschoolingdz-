import { NextRequest, NextResponse } from "next/server";
import { generateStudyPlan } from "@/lib/gemini";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentName, grade, examType, weakSubjects, availableHoursPerDay } = body;

    const plan = await generateStudyPlan({
      studentName,
      grade,
      examType,
      weakSubjects: weakSubjects ?? [],
      availableHoursPerDay: availableHoursPerDay ?? 3,
    });

    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: "فشل توليد الخطة الدراسية" }, { status: 500 });
  }
}
