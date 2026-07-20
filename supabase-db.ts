/**
 * Supabase data-access hooks — replaces @workspace/api-client-react
 * All queries use React Query + Supabase client
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// ─────────────────────────────────────────────
// SUBJECTS
// ─────────────────────────────────────────────

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*, chapters(count)')
        .eq('is_active', true)
        .order('order');
      if (error) throw error;
      return (data || []).map((s: any) => ({
        id: s.id as number,
        name: s.name as string,
        description: s.description as string | null,
        icon: s.icon as string,
        color: s.color as string,
        order: s.order as number,
        chapterCount: (s.chapters?.[0]?.count ?? 0) as number,
      }));
    },
  });
}

export function useSubject(id: number) {
  return useQuery({
    queryKey: ['subjects', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*, chapters(count)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return {
        id: data.id as number,
        name: data.name as string,
        description: data.description as string | null,
        icon: data.icon as string,
        color: data.color as string,
        chapterCount: (data.chapters?.[0]?.count ?? 0) as number,
      };
    },
  });
}

// ─────────────────────────────────────────────
// CHAPTERS
// ─────────────────────────────────────────────

export function useChaptersBySubject(subjectId: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['chapters', 'by-subject', subjectId, user?.id],
    enabled: !!subjectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          subjects(name),
          practice_questions(count),
          notes(count)
        `)
        .eq('subject_id', subjectId)
        .eq('is_active', true)
        .order('order');
      if (error) throw error;

      // Get user progress for these chapters
      let progressMap: Record<number, { progress_percent: number; is_completed: boolean }> = {};
      if (user && data?.length) {
        const chapterIds = data.map((c: any) => c.id);
        const { data: prog } = await supabase
          .from('progress')
          .select('chapter_id, progress_percent, is_completed')
          .eq('user_id', user.id)
          .in('chapter_id', chapterIds);
        (prog || []).forEach((p: any) => {
          progressMap[p.chapter_id] = { progress_percent: p.progress_percent, is_completed: p.is_completed };
        });
      }

      return (data || []).map((c: any) => ({
        id: c.id as number,
        subjectId: c.subject_id as number,
        subjectName: c.subjects?.name as string,
        title: c.title as string,
        description: c.description as string | null,
        order: c.order as number,
        difficulty: c.difficulty as string,
        questionCount: (c.practice_questions?.[0]?.count ?? 0) as number,
        notesCount: (c.notes?.[0]?.count ?? 0) as number,
        progressPercent: progressMap[c.id]?.progress_percent ?? 0,
        isCompleted: progressMap[c.id]?.is_completed ?? false,
      }));
    },
  });
}

export function useChapter(id: number) {
  return useQuery({
    queryKey: ['chapters', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          subjects(name, color, icon),
          practice_questions(count),
          notes(count)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return {
        id: data.id as number,
        subjectId: data.subject_id as number,
        subjectName: data.subjects?.name as string,
        subjectColor: data.subjects?.color as string,
        title: data.title as string,
        description: data.description as string | null,
        difficulty: data.difficulty as string,
        questionCount: (data.practice_questions?.[0]?.count ?? 0) as number,
        notesCount: (data.notes?.[0]?.count ?? 0) as number,
      };
    },
  });
}

// ─────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────

export function useNotesByChapter(chapterId: number) {
  return useQuery({
    queryKey: ['notes', chapterId],
    enabled: !!chapterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('order');
      if (error) throw error;
      return (data || []).map((n: any) => ({
        id: n.id as number,
        chapterId: n.chapter_id as number,
        title: n.title as string,
        content: n.content as string,
        type: n.type as string,
        order: n.order as number,
      }));
    },
  });
}

// ─────────────────────────────────────────────
// FORMULA SHEETS
// ─────────────────────────────────────────────

export function useFormulaSheet(chapterId: number) {
  return useQuery({
    queryKey: ['formula-sheets', chapterId],
    enabled: !!chapterId,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formula_sheets')
        .select('*')
        .eq('chapter_id', chapterId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id as number,
        chapterId: data.chapter_id as number,
        title: data.title as string,
        content: data.content as string,
      };
    },
  });
}

export function useAllFormulaSheets() {
  return useQuery({
    queryKey: ['formula-sheets', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formula_sheets')
        .select(`
          *,
          chapters(title, subject_id, subjects(name, color, icon))
        `)
        .order('id');
      if (error) throw error;
      return (data || []).map((fs: any) => ({
        id: fs.id as number,
        chapterId: fs.chapter_id as number,
        title: fs.title as string,
        chapterTitle: fs.chapters?.title as string,
        subjectId: fs.chapters?.subject_id as number,
        subjectName: fs.chapters?.subjects?.name as string,
        color: fs.chapters?.subjects?.color as string,
      }));
    },
  });
}

// ─────────────────────────────────────────────
// PRACTICE QUESTIONS
// ─────────────────────────────────────────────

export function useQuestionsByChapter(chapterId: number) {
  return useQuery({
    queryKey: ['questions', 'chapter', chapterId],
    enabled: !!chapterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_questions')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('id');
      if (error) throw error;
      return (data || []).map((q: any) => ({
        id: q.id as number,
        chapterId: q.chapter_id as number,
        text: q.text as string,
        options: q.options as string[],
        correctAnswer: q.correct_answer as number,
        explanation: q.explanation as string | null,
        difficulty: q.difficulty as string,
        type: q.type as string,
        year: q.year as number | null,
      }));
    },
  });
}

// ─────────────────────────────────────────────
// MOCK TESTS
// ─────────────────────────────────────────────

export function useMockTests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['mock-tests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('is_active', true)
        .order('id');
      if (error) throw error;

      // Get user's attempt counts + best scores
      let attemptMap: Record<number, { count: number; best: number | null }> = {};
      if (user && data?.length) {
        const testIds = data.map((t: any) => t.id);
        const { data: attempts } = await supabase
          .from('test_results')
          .select('mock_test_id, score')
          .eq('user_id', user.id)
          .in('mock_test_id', testIds);
        (attempts || []).forEach((a: any) => {
          if (!attemptMap[a.mock_test_id]) attemptMap[a.mock_test_id] = { count: 0, best: null };
          attemptMap[a.mock_test_id].count++;
          if (attemptMap[a.mock_test_id].best === null || a.score > attemptMap[a.mock_test_id].best!) {
            attemptMap[a.mock_test_id].best = a.score;
          }
        });
      }

      return (data || []).map((t: any) => ({
        id: t.id as number,
        title: t.title as string,
        description: t.description as string | null,
        type: t.type as string,
        totalQuestions: t.total_questions as number,
        durationMinutes: t.duration_minutes as number,
        negativeMarking: t.negative_marking as boolean,
        attemptsCount: attemptMap[t.id]?.count ?? 0,
        bestScore: attemptMap[t.id]?.best ?? null,
      }));
    },
  });
}

export function useMockTest(id: number) {
  return useQuery({
    queryKey: ['mock-tests', id],
    enabled: !!id,
    queryFn: async () => {
      const { data: test, error } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      // Get questions via junction table
      const { data: junction } = await supabase
        .from('mock_test_questions')
        .select('order, practice_questions(*)')
        .eq('mock_test_id', id)
        .order('order');

      const questions = (junction || []).map((j: any) => {
        const q = j.practice_questions;
        return {
          id: q.id as number,
          chapterId: q.chapter_id as number,
          text: q.text as string,
          options: q.options as string[],
          correctAnswer: q.correct_answer as number,
          explanation: q.explanation as string | null,
          difficulty: q.difficulty as string,
          type: q.type as string,
          year: q.year as number | null,
        };
      });

      // If no questions in junction, fall back to random questions
      const finalQuestions = questions.length > 0 ? questions : [];

      return {
        id: test.id as number,
        title: test.title as string,
        description: test.description as string | null,
        type: test.type as string,
        totalQuestions: test.total_questions as number,
        durationMinutes: test.duration_minutes as number,
        negativeMarking: test.negative_marking as boolean,
        questions: finalQuestions,
      };
    },
  });
}

export function useSubmitTestResult() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mockTestId,
      answers,
      timeTakenSeconds,
      questions,
      negativeMarking,
    }: {
      mockTestId: number;
      answers: Record<number, number>;
      timeTakenSeconds: number;
      questions: { id: number; correctAnswer: number }[];
      negativeMarking: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      let correct = 0, wrong = 0, skipped = 0;
      questions.forEach((q) => {
        const selected = answers[q.id];
        if (selected === undefined || selected === null) skipped++;
        else if (selected === q.correctAnswer) correct++;
        else wrong++;
      });

      const baseScore = correct * 2;
      const penalty = negativeMarking ? wrong * 0.5 : 0;
      const score = Math.max(0, baseScore - penalty);

      const { data, error } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          mock_test_id: mockTestId,
          score,
          total_questions: questions.length,
          correct_answers: correct,
          wrong_answers: wrong,
          skipped_answers: skipped,
          time_taken_seconds: timeTakenSeconds,
          answers,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-results'] });
      qc.invalidateQueries({ queryKey: ['mock-tests'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useTestResults(mockTestId: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['test-results', mockTestId, user?.id],
    enabled: !!mockTestId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user!.id)
        .eq('mock_test_id', mockTestId)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id as number,
        mockTestId: r.mock_test_id as number,
        score: r.score as number,
        totalQuestions: r.total_questions as number,
        correct: r.correct_answers as number,
        incorrect: r.wrong_answers as number,
        skipped: r.skipped_answers as number,
        timeTakenSeconds: r.time_taken_seconds as number,
        accuracy: r.accuracy as number,
        percentile: r.percentile as number | null,
        completedAt: r.completed_at as string,
      }));
    },
  });
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

export function useDashboardStats() {
  const { user, profile } = useAuth();
  return useQuery({
    queryKey: ['dashboard', 'stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [chaptersRes, attemptsRes] = await Promise.all([
        supabase.from('chapters').select('id', { count: 'exact' }).eq('is_active', true),
        supabase
          .from('test_results')
          .select('score, accuracy, correct_answers, total_questions')
          .eq('user_id', user!.id),
      ]);

      const totalChapters = chaptersRes.count ?? 0;
      const attempts = attemptsRes.data || [];
      const testsAttempted = attempts.length;
      const overallAccuracy =
        testsAttempted > 0
          ? Math.round(attempts.reduce((s, a: any) => s + (a.accuracy || 0), 0) / testsAttempted)
          : 0;

      return {
        studyStreak: profile?.study_streak ?? 0,
        totalStudyMinutes: profile?.total_study_minutes ?? 0,
        completedChapters: profile?.completed_chapters ?? 0,
        totalChapters,
        testsAttempted,
        overallAccuracy,
        dailyProgressMinutes: Math.min(profile?.total_study_minutes ?? 0, 120),
        dailyGoalMinutes: 120,
      };
    },
  });
}

export function useRecentActivity() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dashboard', 'activity', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('id, mock_test_id, completed_at, score, mock_tests(title)')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id as number,
        type: 'test_attempted',
        title: (r.mock_tests?.title ?? 'Mock Test') as string,
        score: r.score as number,
        createdAt: r.completed_at as string,
      }));
    },
  });
}

// ─────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────

export function useLeaderboard(period: 'weekly' | 'monthly' | 'alltime') {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      // Score = total score from test_results within period
      let query = supabase
        .from('test_results')
        .select('user_id, score, completed_at, users(name, avatar_url, study_streak, completed_chapters)');

      if (period === 'weekly') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('completed_at', weekAgo);
      } else if (period === 'monthly') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('completed_at', monthAgo);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate scores per user
      const userScores: Record<string, {
        user_id: string;
        name: string;
        avatar_url: string | null;
        study_streak: number;
        completed_chapters: number;
        total_score: number;
      }> = {};

      (data || []).forEach((r: any) => {
        const uid = r.user_id;
        if (!userScores[uid]) {
          userScores[uid] = {
            user_id: uid,
            name: r.users?.name ?? 'Student',
            avatar_url: r.users?.avatar_url ?? null,
            study_streak: r.users?.study_streak ?? 0,
            completed_chapters: r.users?.completed_chapters ?? 0,
            total_score: 0,
          };
        }
        userScores[uid].total_score += r.score;
      });

      const sorted = Object.values(userScores)
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, 20)
        .map((u, i) => ({
          rank: i + 1,
          userId: u.user_id,
          name: u.name,
          score: Math.round(u.total_score),
          studyStreak: u.study_streak,
          completedChapters: u.completed_chapters,
          avatarUrl: u.avatar_url,
        }));

      return sorted;
    },
  });
}

// ─────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    enabled: query.length > 2,
    queryFn: async () => {
      const q = `%${query}%`;
      const [subjectsRes, chaptersRes, notesRes] = await Promise.all([
        supabase
          .from('subjects')
          .select('id, name, description')
          .ilike('name', q)
          .limit(5),
        supabase
          .from('chapters')
          .select('id, title, description, subjects(name)')
          .ilike('title', q)
          .limit(10),
        supabase
          .from('notes')
          .select('id, title, content, chapter_id, chapters(title, subjects(name))')
          .ilike('title', q)
          .limit(5),
      ]);

      const results: any[] = [
        ...(subjectsRes.data || []).map((s: any) => ({
          id: s.id,
          type: 'subject',
          title: s.name,
          description: s.description,
          subjectName: null,
        })),
        ...(chaptersRes.data || []).map((c: any) => ({
          id: c.id,
          type: 'chapter',
          title: c.title,
          description: c.description,
          subjectName: c.subjects?.name ?? null,
        })),
        ...(notesRes.data || []).map((n: any) => ({
          id: n.chapter_id,
          type: 'note',
          title: n.title,
          description: n.content?.slice(0, 80) + '...',
          subjectName: n.chapters?.subjects?.name ?? null,
        })),
      ];

      return { results, total: results.length };
    },
  });
}

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────

export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<{
      name: string;
      bio: string;
      exam_target: string;
      preparation_level: string;
    }>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refreshProfile();
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// ─────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────

export function useBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bookmarks', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*, practice_questions(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAddBookmark() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: number) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, question_id: questionId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookmarks'] }),
  });
}

export function useRemoveBookmark() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: number) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user!.id)
        .eq('question_id', questionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookmarks'] }),
  });
}

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────

export function useAdminStats() {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: ['admin', 'stats'],
    enabled: isAdmin,
    queryFn: async () => {
      const [usersRes, subjectsRes, chaptersRes, questionsRes, testsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('chapters').select('id', { count: 'exact', head: true }),
        supabase.from('practice_questions').select('id', { count: 'exact', head: true }),
        supabase.from('mock_tests').select('id', { count: 'exact', head: true }),
      ]);

      // Active today: users who made test_results today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayData } = await supabase
        .from('test_results')
        .select('user_id')
        .gte('completed_at', today.toISOString());
      const activeToday = new Set((todayData || []).map((r: any) => r.user_id)).size;

      return {
        totalUsers: usersRes.count ?? 0,
        activeUsersToday: activeToday,
        totalSubjects: subjectsRes.count ?? 0,
        totalChapters: chaptersRes.count ?? 0,
        totalQuestions: questionsRes.count ?? 0,
        totalMockTests: testsRes.count ?? 0,
      };
    },
  });
}

export function useAdminUsers(limit = 10) {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: ['admin', 'users', limit],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('joined_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return {
        users: (data || []).map((u: any) => ({
          id: u.id as string,
          name: u.name as string,
          email: u.email as string,
          role: u.role as string,
          joinedAt: u.joined_at as string,
          avatarUrl: u.avatar_url as string | null,
          studyStreak: u.study_streak as number,
          completedChapters: u.completed_chapters as number,
        })),
      };
    },
  });
}

// ─────────────────────────────────────────────
// ANNOUNCEMENTS
// ─────────────────────────────────────────────

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// ─────────────────────────────────────────────
// PROGRESS
// ─────────────────────────────────────────────

export function useUpdateProgress() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chapterId,
      progressPercent,
      isCompleted,
      studyMinutes,
    }: {
      chapterId: number;
      progressPercent: number;
      isCompleted?: boolean;
      studyMinutes?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('progress').upsert(
        {
          user_id: user.id,
          chapter_id: chapterId,
          progress_percent: progressPercent,
          is_completed: isCompleted ?? progressPercent >= 100,
          study_minutes: studyMinutes ?? 0,
          last_studied: new Date().toISOString(),
        },
        { onConflict: 'user_id,chapter_id' }
      );
      if (error) throw error;

      // Update user's completed_chapters count
      if (isCompleted) {
        const { data: prog } = await supabase
          .from('progress')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('is_completed', true);
        const count = prog?.length ?? 0;
        await supabase
          .from('users')
          .update({ completed_chapters: count })
          .eq('id', user.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chapters'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
