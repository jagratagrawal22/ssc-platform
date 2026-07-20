import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AdminCrudPage, { AdminField, AdminColumn } from '@/components/admin/AdminCrudPage';
import {
  useAdminFormulaSheets, useCreateFormulaSheet, useUpdateFormulaSheet, useDeleteFormulaSheet, useAdminChapters,
} from '@/lib/supabase-admin';
import { Skeleton } from '@/components/ui/skeleton';

const columns: AdminColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'chapter', label: 'Chapter', render: (r) => r.chapters?.title ?? '—' },
  { key: 'pdf_url', label: 'PDF attached', render: (r) => (r.pdf_url ? 'Yes' : 'No') },
];

export default function AdminFormulaSheetsPage() {
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
      helpText: 'Each chapter can only have one formula sheet.',
    },
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'content', label: 'Content', type: 'textarea', required: true, placeholder: 'Formulas, one per line or as markdown' },
    { name: 'pdf_url', label: 'Downloadable PDF', type: 'pdf', helpText: 'Optional — lets students download a printable version.' },
  ];

  return (
    <AdminCrudPage
      title="Manage Formula Sheets"
      description="Create and edit formula sheets for each chapter."
      entitySingular="Formula sheet"
      fields={fields}
      columns={columns}
      useList={useAdminFormulaSheets}
      useCreate={useCreateFormulaSheet}
      useUpdate={useUpdateFormulaSheet}
      useDelete={useDeleteFormulaSheet}
    />
  );
}
