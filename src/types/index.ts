export type Gender = "male" | "female" | "not_specified";
export type SubscriptionTier = "monthly" | "yearly" | "none";
export type ExamPackage = "bem" | "bac" | "context" | null;
export type GradeLevel = string;

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  grade_level: GradeLevel;
  gender: Gender;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  exam_package: ExamPackage;
  total_xp: number;
  is_banned: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  receipt_url: string;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user?: User;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  grade_level: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  subject: string;
  grade_level: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
  score: number | null;
  completed_at: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  user_answer?: number;
}

export interface SpacedRepetitionItem {
  id: string;
  user_id: string;
  question_id: string;
  question: string;
  subject: string;
  next_review: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  xp_reward: number;
  earned_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject: string;
  duration_minutes: number;
  xp_earned: number;
  date: string;
}

export type Plan = {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlight?: boolean;
  category: "base" | "exam";
};

export interface ThemeColors {
  bg: string;
  bgLight: string;
  accent: string;
  accentLight: string;
  text: string;
}
