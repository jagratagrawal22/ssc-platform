import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AdminCrudPage, { AdminField, AdminColumn } from '@/components/admin/AdminCrudPage';
import {
  useAdminNotes, useCreateNote, useUpdateNote, useDeleteNote, useAdminChapters,
} from '@/lib/supabase-admin';
import { Skeleton } from '@/components/ui/skeleton';

const columns: AdminColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'chapter', label: 'Chapter', render: (r) => r.chapters?.title ?? '—' },
  { key: 'type', label: 'Type' },
  { key: 'order', label: 'Order' },
];

export default function AdminNotesPage() {
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
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'content', label: 'Content', type: 'textarea', required: true, placeholder: 'Markdown or plain text supported' },
    {
      name: 'type',
      label: 'Note type',
      type: 'select',
      defaultValue: 'concept',
      options: [
        { label: 'Concept', value: 'concept' },
        { label: 'Summary', value: 'summary' },
        { label: 'Important points', value: 'important_points' },
        { label: 'Tricks', value: 'tricks' },
      ],
    },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 0 },
    { name: 'image_url', label: 'Illustration image', type: 'image', helpText: 'Optional — shown alongside the note.' },
  ];

  return (
    <AdminCrudPage
      title="Manage Notes"
      description="Create and edit study notes for each chapter."
      entitySingular="Note"
      fields={fields}
      columns={columns}
      useList={useAdminNotes}
      useCreate={useCreateNote}
      useUpdate={useUpdateNote}
      useDelete={useDeleteNote}
    />
  );
}
