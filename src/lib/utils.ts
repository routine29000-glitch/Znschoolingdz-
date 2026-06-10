import { Gender, ThemeColors } from "@/types";

export const genderThemes: Record<Gender, ThemeColors> = {
  male: {
    bg: "#EEF2F8",
    bgLight: "#F5F8FD",
    accent: "#4A6FA5",
    accentLight: "#D4E0F0",
    text: "#1E3A5F",
  },
  female: {
    bg: "#FDF0EC",
    bgLight: "#FDF7F5",
    accent: "#C97B5A",
    accentLight: "#F2D7CC",
    text: "#5C2D1E",
  },
  not_specified: {
    bg: "#F5F0E8",
    bgLight: "#FCFCFA",
    accent: "#4A7C59",
    accentLight: "#D8EDD9",
    text: "#2C3E2F",
  },
};

export function getTheme(gender: Gender): ThemeColors {
  return genderThemes[gender] || genderThemes["not_specified"];
}

export const GRADE_LABELS: Record<string, string> = {
  "1ap": "السنة الأولى ابتدائي",
  "2ap": "السنة الثانية ابتدائي",
  "3ap": "السنة الثالثة ابتدائي",
  "4ap": "السنة الرابعة ابتدائي",
  "5ap": "السنة الخامسة ابتدائي",
  "1am": "السنة الأولى متوسط",
  "2am": "السنة الثانية متوسط",
  "3am": "السنة الثالثة متوسط",
  "4am": "السنة الرابعة متوسط (BEM)",
  "1as": "السنة الأولى ثانوي",
  "2as": "السنة الثانية ثانوي",
  "3as": "السنة الثالثة ثانوي (BAC)",
  university: "الجامعة",
};

export const SUBJECTS: Record<string, string[]> = {
  primary: ["اللغة العربية", "الرياضيات", "التربية الإسلامية", "التربية المدنية", "اللغة الفرنسية", "الأنشطة العلمية"],
  middle: ["اللغة العربية", "الرياضيات", "العلوم الطبيعية", "التاريخ والجغرافيا", "التربية الإسلامية", "اللغة الفرنسية", "اللغة الإنجليزية", "الفيزياء والكيمياء", "التربية المدنية"],
  secondary: ["اللغة العربية", "الرياضيات", "الفيزياء والكيمياء", "العلوم الطبيعية", "التاريخ والجغرافيا", "الفلسفة", "اللغة الفرنسية", "اللغة الإنجليزية", "الاقتصاد والمناجمنت"],
};

export const MOTIVATIONAL_PHRASES = [
  "ما شاء الله عليك! أنت تتقدم بشكل رائع 🌟",
  "تبارك الله، أنت قادر على أكثر من هذا! 💪",
  "راك طاير يا بطل! استمر هكذا 🚀",
  "أحسنت! كل يوم تزداد قوة ومعرفة ✨",
  "أنت نجم المستقبل! لا تستسلم أبداً 🌙",
  "الله يبارك فيك! مجهودك يستحق الإعجاب 🎯",
  "واصل يا بطل، النجاح قريب منك 🏆",
  "أنت أفضل مما تظن، ثق بنفسك! 💫",
];

export function getRandomMotivation(): string {
  return MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ar-DZ")} دج`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getSubjectsByGrade(grade: string): string[] {
  if (grade.includes("ap")) return SUBJECTS.primary;
  if (grade.includes("am")) return SUBJECTS.middle;
  if (grade.includes("as") || grade === "university") return SUBJECTS.secondary;
  return SUBJECTS.secondary;
}

export function isExamGrade(grade: string): "bem" | "bac" | "context" | null {
  if (grade === "4am") return "bem";
  if (grade === "3as") return "bac";
  if (grade === "5ap") return "context";
  return null;
}
