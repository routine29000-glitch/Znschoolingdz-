import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export function getModel(withVision = false) {
  return genAI.getGenerativeModel({
    model: withVision ? "gemini-1.5-pro" : "gemini-1.5-pro",
    safetySettings,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });
}

export function buildTeacherSystemPrompt(params: {
  studentName: string;
  grade: string;
  subject: string;
  gender: string;
  mood?: string;
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
   - احتفل بكل نجاح صغير

3. **كمرشد:**
   - انصح بفترات الراحة (45 دقيقة دراسة، 10 دقائق راحة)
   - ذكّر بأهمية النوم المبكر (22:00)
   - انصح بتمارين بسيطة للعينين

## قواعد مهمة:
- لا تتحدث عن أي شيء خارج نطاق التعليم والدعم النفسي
- ردودك دائماً باللغة العربية (مع فرنسية إذا تطلبت المادة)
- كن صبوراً ولا تُعقّد الأمور أبداً
- استخدم الرموز التعبيرية باعتدال لتحفيز الطالب
`;
}

export async function generateQuizQuestions(params: {
  subject: string;
  grade: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
}): Promise<string> {
  const model = getModel();
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

تأكد من:
- اتباع المنهاج الجزائري
- الأسئلة واضحة ودقيقة
- الشرح مفصل ومفيد
- JSON صالح فقط، لا نص إضافي`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateStudyPlan(params: {
  studentName: string;
  grade: string;
  examType: "bem" | "bac" | "context";
  weakSubjects: string[];
  availableHoursPerDay: number;
}): Promise<string> {
  const model = getModel();
  const examNames = { bem: "شهادة التعليم المتوسط", bac: "شهادة البكالوريا", context: "شهادة نهاية السنة" };

  const prompt = `أنشئ خطة دراسية مكثفة لـ 3 أشهر للطالب ${params.studentName} يستعد لـ ${examNames[params.examType]}.

المعلومات:
- المستوى: ${params.grade}
- المواد الضعيفة: ${params.weakSubjects.join(", ")}
- ساعات الدراسة المتاحة: ${params.availableHoursPerDay} ساعات/يوم

اكتب خطة أسبوعية تفصيلية تشمل:
1. توزيع المواد على أيام الأسبوع
2. أوقات الدراسة الموصى بها
3. أيام المراجعة
4. نصائح نفسية للاستعداد
5. كيفية قضاء أسبوع الامتحان

اكتب بالعربية بطريقة دافئة وتحفيزية.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function analyzeImageAndExplain(
  imageBase64: string,
  mimeType: string,
  question: string,
  subject: string
): Promise<string> {
  const model = getModel(true);
  
  const result = await model.generateContent([
    {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp",
      },
    },
    `أنت معلم جزائري خبير. الطالب أرسل لك هذه الصورة في مادة ${subject} ويسأل: "${question}"

حلل الصورة بعناية وأجب بطريقة تعليمية واضحة. استخدم LaTeX للمعادلات إذا لزم. كن صبوراً وشجعاً.`,
  ]);
  
  return result.response.text();
}
