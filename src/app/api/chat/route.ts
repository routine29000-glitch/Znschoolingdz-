import { NextRequest, NextResponse } from "next/server";
import { streamChat, buildTeacherSystemPrompt } from "@/lib/gemini";
import { GRADE_LABELS } from "@/lib/utils";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, subject, grade, studentName, gender, history, image, imageMimeType } = body;

    const systemPrompt = buildTeacherSystemPrompt({
      studentName,
      grade: GRADE_LABELS[grade] ?? grade,
      subject,
      gender,
    });

    const chatHistory = (history ?? []).slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: m.content,
    }));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await streamChat({
            systemPrompt,
            history: chatHistory as { role: "user" | "model"; parts: string }[],
            message: message || "انظر إلى الصورة وأجب عليها",
            imagePart: image && imageMimeType
              ? { data: image, mimeType: imageMimeType }
              : undefined,
          });

          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              const data = `data: ${JSON.stringify({ text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
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
