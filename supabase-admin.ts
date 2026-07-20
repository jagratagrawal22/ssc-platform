/**
 * Admin Panel data-access layer.
 *
 * Kept separate from `supabase-db.ts` (the student-facing hooks) on
 * purpose: nothing here is imported by any student-facing page, so this
 * file can evolve independently without any risk of touching the
 * student dashboard/experience.
 *
 * Every mutation here relies on the existing `admin_all_*` RLS policies
 * defined in supabase-schema.sql, which already grant full
 * insert/update/delete to any user whose `public.users.role = 'admin'`.
 * No new table-level RLS was needed for CRUD — only the storage
 * policies added in migrations/0002_admin_panel_storage.sql.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// ─────────────────────────────────────────────
// STORAGE UPLOAD HELPERS
// ─────────────────────────────────────────────

export type UploadBucket = 'images' | 'videos' | 'pdfs';

/** Uploads a file to the given public bucket and returns its public URL. */
export async function uploadFile(bucket: UploadBucket, file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Best-effort delete of a previously uploaded file, given its public URL. */
export async function deleteFileByUrl(bucket: UploadBucket, publicUrl: string | null | undefined) {
  if (!publicUrl) return;
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(bucket).remove([path]);
}

// ─────────────────────────────────────────────
// GENERIC CRUD HOOK FACTORY
// ─────────────────────────────────────────────

interface CrudOptions {
  table: string;
  /** react-query key used for the list view; also invalidated after mutations */
  queryKey: string[];
  orderBy?: string;
  ascending?: boolean;
  select?: string;
  entityLabel: string;
}

export function useAdminList({ table, queryKey, orderBy = 'id', ascending = false, select = '*' }: CrudOptions) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select(select).order(orderBy, { ascending });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useAdminCreate({ table, queryKey, entityLabel }: CrudOptions) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const { data, error } = await supabase.from(table).insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: `${entityLabel} created` });
    },
    onError: (err: any) => {
      toast({ title: `Failed to create ${entityLabel.toLowerCase()}`, description: err.message, variant: 'destructive' });
    },
  });
}

export function useAdminUpdate({ table, queryKey, entityLabel }: CrudOptions) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, values }: { id: number | string; values: Record<string, any> }) => {
      const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: `${entityLabel} updated` });
    },
    onError: (err: any) => {
      toast({ title: `Failed to update ${entityLabel.toLowerCase()}`, description: err.message, variant: 'destructive' });
    },
  });
}

export function useAdminDelete({ table, queryKey, entityLabel }: CrudOptions) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: `${entityLabel} deleted` });
    },
    onError: (err: any) => {
      toast({ title: `Failed to delete ${entityLabel.toLowerCase()}`, description: err.message, variant: 'destructive' });
    },
  });
}

// ─────────────────────────────────────────────
// ENTITY-SPECIFIC HOOKS
// (thin, typed wrappers over the generic factory above)
// ─────────────────────────────────────────────

const SUBJECTS: CrudOptions = { table: 'subjects', queryKey: ['admin', 'subjects'], orderBy: 'order', ascending: true, entityLabel: 'Subject' };
export const useAdminSubjects = () => useAdminList(SUBJECTS);
export const useCreateSubject = () => useAdminCreate(SUBJECTS);
export const useUpdateSubject = () => useAdminUpdate(SUBJECTS);
export const useDeleteSubject = () => useAdminDelete(SUBJECTS);

const CHAPTERS: CrudOptions = { table: 'chapters', queryKey: ['admin', 'chapters'], orderBy: 'order', ascending: true, select: '*, subjects(name)', entityLabel: 'Chapter' };
export const useAdminChapters = () => useAdminList(CHAPTERS);
export const useCreateChapter = () => useAdminCreate(CHAPTERS);
export const useUpdateChapter = () => useAdminUpdate(CHAPTERS);
export const useDeleteChapter = () => useAdminDelete(CHAPTERS);

const NOTES: CrudOptions = { table: 'notes', queryKey: ['admin', 'notes'], orderBy: 'order', ascending: true, select: '*, chapters(title)', entityLabel: 'Note' };
export const useAdminNotes = () => useAdminList(NOTES);
export const useCreateNote = () => useAdminCreate(NOTES);
export const useUpdateNote = () => useAdminUpdate(NOTES);
export const useDeleteNote = () => useAdminDelete(NOTES);

const FORMULA_SHEETS: CrudOptions = { table: 'formula_sheets', queryKey: ['admin', 'formula-sheets'], orderBy: 'id', ascending: true, select: '*, chapters(title)', entityLabel: 'Formula sheet' };
export const useAdminFormulaSheets = () => useAdminList(FORMULA_SHEETS);
export const useCreateFormulaSheet = () => useAdminCreate(FORMULA_SHEETS);
export const useUpdateFormulaSheet = () => useAdminUpdate(FORMULA_SHEETS);
export const useDeleteFormulaSheet = () => useAdminDelete(FORMULA_SHEETS);

const QUESTIONS: CrudOptions = { table: 'practice_questions', queryKey: ['admin', 'questions'], orderBy: 'id', ascending: false, select: '*, chapters(title)', entityLabel: 'Question' };
export const useAdminQuestions = () => useAdminList(QUESTIONS);
export const useCreateQuestion = () => useAdminCreate(QUESTIONS);
export const useUpdateQuestion = () => useAdminUpdate(QUESTIONS);
export const useDeleteQuestion = () => useAdminDelete(QUESTIONS);

const MOCK_TESTS: CrudOptions = { table: 'mock_tests', queryKey: ['admin', 'mock-tests'], orderBy: 'id', ascending: false, entityLabel: 'Mock test' };
export const useAdminMockTests = () => useAdminList(MOCK_TESTS);
export const useCreateMockTest = () => useAdminCreate(MOCK_TESTS);
export const useUpdateMockTest = () => useAdminUpdate(MOCK_TESTS);
export const useDeleteMockTest = () => useAdminDelete(MOCK_TESTS);

const ANNOUNCEMENTS: CrudOptions = { table: 'announcements', queryKey: ['admin', 'announcements'], orderBy: 'id', ascending: false, entityLabel: 'Announcement' };
export const useAdminAnnouncements = () => useAdminList(ANNOUNCEMENTS);
export const useCreateAnnouncement = () => useAdminCreate(ANNOUNCEMENTS);
export const useUpdateAnnouncement = () => useAdminUpdate(ANNOUNCEMENTS);
export const useDeleteAnnouncement = () => useAdminDelete(ANNOUNCEMENTS);

// ─────────────────────────────────────────────
// MOCK TEST ⇄ QUESTIONS LINKING (junction table)
// ─────────────────────────────────────────────

export function useMockTestQuestions(mockTestId: number) {
  return useQuery({
    queryKey: ['admin', 'mock-test-questions', mockTestId],
    enabled: !!mockTestId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mock_test_questions')
        .select('id, order, question_id, practice_questions(id, text, chapter_id)')
        .eq('mock_test_id', mockTestId)
        .order('order', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useAddQuestionToMockTest() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ mockTestId, questionId, order }: { mockTestId: number; questionId: number; order: number }) => {
      const { error } = await supabase
        .from('mock_test_questions')
        .insert({ mock_test_id: mockTestId, question_id: questionId, order });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'mock-test-questions', vars.mockTestId] });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to add question', description: err.message, variant: 'destructive' });
    },
  });
}

export function useRemoveQuestionFromMockTest() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ linkId }: { linkId: number; mockTestId: number }) => {
      const { error } = await supabase.from('mock_test_questions').delete().eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'mock-test-questions', vars.mockTestId] });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to remove question', description: err.message, variant: 'destructive' });
    },
  });
}
