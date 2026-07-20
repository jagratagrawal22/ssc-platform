import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Type definitions matching our Supabase tables
export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  exam_target: string | null;
  preparation_level: string | null;
  study_streak: number;
  total_study_minutes: number;
  completed_chapters: number;
  joined_at: string;
}

export interface Subject {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  order: number;
  is_active: boolean;
  created_at: string;
  chapter_count?: number;
}

export interface Chapter {
  id: number;
  subject_id: number;
  subject_name?: string;
  title: string;
  description: string | null;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  created_at: string;
  question_count?: number;
  notes_count?: number;
  progress_percent?: number;
  is_completed?: boolean;
}

export interface Note {
  id: number;
  chapter_id: number;
  title: string;
  content: string;
  type: 'concept' | 'summary' | 'important_points' | 'tricks';
  order: number;
  created_at: string;
}

export interface FormulaSheet {
  id: number;
  chapter_id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface PracticeQuestion {
  id: number;
  chapter_id: number;
  text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'practice' | 'pyq';
  year: number | null;
  created_at: string;
}

export interface MockTest {
  id: number;
  title: string;
  description: string | null;
  type: 'full' | 'subject' | 'chapter' | 'weekly' | 'pyp';
  total_questions: number;
  duration_minutes: number;
  negative_marking: boolean;
  is_active: boolean;
  created_at: string;
  attempts_count?: number;
  best_score?: number | null;
  questions?: PracticeQuestion[];
}

export interface TestResult {
  id: number;
  user_id: string;
  mock_test_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  skipped_answers: number;
  time_taken_seconds: number;
  accuracy: number;
  answers: Record<string, number> | null;
  percentile: number | null;
  completed_at: string;
  correct?: number;
  incorrect?: number;
  skipped?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  score: number;
  study_streak: number;
  completed_chapters: number;
  avatar_url: string | null;
}
