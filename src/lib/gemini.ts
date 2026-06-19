import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function streamChat(params: {
  systemPrompt: string;
  history: { role: "user" | "model"; parts: string }[];
  message: string;
  imagePart?: { data: string; mimeType: string };
}) {
  const contents = [
    ...params.history.map((h) => ({
      role: h.role,
      parts: [{ text: h.parts }],
    })),
    {
      role: "user" as const,
      parts: [
        ...(params.imagePart
          ? [{ inlineData: { data: params.imagePart.data, mimeType: params.imagePart.mimeType } }]
          : []),
        { text: params.message },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: params.systemPrompt,
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
    contents,
  });

  return response;
}

export async function generateText(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { temperature: 0.7, maxOutputTokens: 4096 },
  });
  return response.text ?? "";
}

export function buildTeacherSystemPrompt(params: {
  studentName: string;
  grade: string;
  subject: string;
  gender: string;
}): string {
  const genderAddr = params.gender === "female" ? "طالبتي العزيزة" : "طالبي العزيز";
  const pronouns = params.gender === "female" ? "أنتِ قادرة" : "أنت قادر";

  return `أنت "زن المعلم" — أستاذ جزائري ذكي، حنون، ومحترف يعمل على منصة Zn Schooling Dz.

## هويتك:
- معلم خبير + مربٍّ نفسي + مرشد أكاديمي
- تتبع منهاج وزارة التربية الوطنية الجزائرية حرفياً
- تتكلم بالعربية الفصحى مع لمسات من الدارجة الجزائرية عند التشجيع
- دائماً تبدأ بسؤال عن حالة الطالب إذا كانت أول محادثة

## معلومات الطالب:
- الاسم: ${params.studentName}
- المستوى الدراسي: ${params.grade}
- المادة الحالية: ${params.subject}
- الجنس: ${params.gender}

## أسلوبك في التدريس:
1. **كمعلم خبير:**
   - اشرح كل درس بطريقة واضحة ومبسطة
   - استخدم أمثلة من الحياة اليومية الجزائرية
   - اكتب المعادلات الرياضية بصيغة LaTeX: $$...$$
   - أعطِ تمارين تطبيقية بعد كل شرح
   - إذا طُلب منك بحث كامل، اكتبه بمقدمة وفقرات وخاتمة ومراجع

2. **كمربٍّ نفسي:**
   - استخدم عبارات تشجيعية: "ما شاء الله"، "تبارك الله"، "راك طاير يا بطل"
   - إذا شعرت بأن ${genderAddr} متعب/ة: "خذ نفساً عميقاً، نحن هنا معاً"
   - ${pronouns} على أكثر مما تظن/ين

3. **كمرشد:**
   - انصح بفترات الراحة (45 دقيقة دراسة، 10 دقائق راحة)
   - ذكّر بأهمية النوم المبكر (22:00)
   - انصح بتمارين بسيطة للعينين

## قواعد مهمة:
- لا تتحدث عن أي شيء خارج نطاق التعليم والدعم النفسي
- ردودك دائماً باللغة العربية
- كن صبوراً ولا تُعقّد الأمور أبداً
- استخدم الرموز التعبيرية باعتدال لتحفيز الطالب`;
}

export async function generateQuizQuestions(params: {
  subject: string;
  grade: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
}): Promise<string> {
  const prompt = `أنشئ ${params.count} أسئلة اختيار من متعدد في مادة ${params.subject} للمستوى ${params.grade}، بمستوى صعوبة ${params.difficulty}.

المطلوب: JSON فقط بهذا الشكل:
{
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
      "correct_answer": 0,
      "explanation": "شرح الإجابة الصحيحة"
    }
  ]
}

تأكد من اتباع المنهاج الجزائري. JSON صالح فقط، لا نص إضافي.`;

  return await generateText(prompt);
}

export async function generateStudyPlan(params: {
  studentName: string;
  grade: string;
  examType: "bem" | "bac" | "context";
  weakSubjects: string[];
  availableHoursPerDay: number;
}): Promise<string> {
  const examNames = { bem: "شهادة التعليم المتوسط", bac: "شهادة البكالوريا", context: "شهادة نهاية السنة" };
  const prompt = `أنشئ خطة دراسية مكثفة لـ 3 أشهر للطالب ${params.studentName} يستعد لـ ${examNames[params.examType]}.
المستوى: ${params.grade}
المواد الضعيفة: ${params.weakSubjects.join(", ")}
ساعات الدراسة: ${params.availableHoursPerDay} ساعات/يوم
اكتب خطة أسبوعية تفصيلية بالعربية بطريقة دافئة وتحفيزية.`;

  return await generateText(prompt);
}
