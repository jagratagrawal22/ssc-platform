import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AdminCrudPage, { AdminField, AdminColumn } from '@/components/admin/AdminCrudPage';
import {
  useAdminQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion, useAdminChapters,
} from '@/lib/supabase-admin';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const columns: AdminColumn[] = [
  { key: 'text', label: 'Question', render: (r) => <span className="line-clamp-2 max-w-md block">{r.text}</span> },
  { key: 'chapter', label: 'Chapter', render: (r) => r.chapters?.title ?? '—' },
  { key: 'type', label: 'Type', render: (r) => <Badge variant={r.type === 'pyq' ? 'default' : 'outline'}>{r.type}</Badge> },
  { key: 'difficulty', label: 'Difficulty' },
];

export default function AdminQuestionsPage() {
  const { isAdmin } = useAuth();
  const { data: chapters, isLoading: chaptersLoading } = useAdminChapters();

  if (!isAdmin) return <Redirect to="/dashboard" />;
  if (chaptersLoading) return <div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>;

  const fields: AdminField[] = [
    {
      name: 'chapter_id',
      label: 'Chapter',
      type: 'select',
      required: true,
      options: (chapters ?? []).map((c) => ({ label: c.title, value: c.id })),
    },
    { name: 'text', label: 'Question text', type: 'textarea', required: true },
    { name: 'options', label: 'Options (enter all 4)', type: 'mcq-options', required: true },
    {
      name: 'correct_answer',
      label: 'Correct option',
      type: 'select',
      required: true,
      options: [
        { label: 'Option 1', value: 0 },
        { label: 'Option 2', value: 1 },
        { label: 'Option 3', value: 2 },
        { label: 'Option 4', value: 3 },
      ],
    },
    { name: 'explanation', label: 'Explanation', type: 'textarea', placeholder: 'Shown to students after they answer' },
    {
      name: 'difficulty',
      label: 'Difficulty',
      type: 'select',
      defaultValue: 'easy',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
    },
    {
      name: 'type',
      label: 'Question type',
      type: 'select',
      defaultValue: 'practice',
      options: [
        { label: 'Practice', value: 'practice' },
        { label: 'Previous Year Question (PYQ)', value: 'pyq' },
      ],
    },
    { name: 'year', label: 'Year (for PYQs)', type: 'number', placeholder: '2023' },
    { name: 'image_url', label: 'Question image', type: 'image', helpText: 'Optional — for questions with diagrams/figures.' },
  ];

  return (
    <AdminCrudPage
      title="Manage Practice Questions"
      description="Create and edit MCQs used in practice sets and mock tests."
      entitySingular="Question"
      fields={fields}
      columns={columns}
      useList={useAdminQuestions}
      useCreate={useCreateQuestion}
      useUpdate={useUpdateQuestion}
      useDelete={useDeleteQuestion}
    />
  );
}
