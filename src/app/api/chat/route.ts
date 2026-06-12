import { NextRequest, NextResponse } from "next/server";
import { getModel, buildTeacherSystemPrompt } from "@/lib/gemini";
import { GRADE_LABELS } from "@/lib/utils";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, subject, grade, studentName, gender, history, image, imageMimeType } = body;

    const model = getModel(!!image);

    const systemPrompt = buildTeacherSystemPrompt({
      studentName,
      grade: GRADE_LABELS[grade] ?? grade,
      subject,
      gender,
    });

    const chatHistory = (history ?? []).slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "حسناً، أنا زن المعلم وأنا هنا لمساعدتك بكل ما تحتاجه. كيف تشعر اليوم وماذا تريد أن تتعلم؟" }] },
        ...chatHistory,
      ],
    });

    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

    if (image && imageMimeType) {
      parts.push({
        inlineData: {
          data: image,
          mimeType: imageMimeType,
        },
      });
    }

    parts.push({ text: message || "انظر إلى الصورة وأجب عليها" });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(parts);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              const data = `data: ${JSON.stringify({ text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const errMsg = `data: ${JSON.stringify({ text: "عذراً، حدث خطأ في المعلم الذكي. حاول مرة أخرى." })}\n\n`;
          controller.enqueue(encoder.encode(errMsg));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
