import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AdminCrudPage, { AdminField, AdminColumn } from '@/components/admin/AdminCrudPage';
import {
  useAdminChapters, useCreateChapter, useUpdateChapter, useDeleteChapter, useAdminSubjects,
} from '@/lib/supabase-admin';
import { Skeleton } from '@/components/ui/skeleton';

const columns: AdminColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'subject', label: 'Subject', render: (r) => r.subjects?.name ?? '—' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'order', label: 'Order' },
  { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
];

export default function AdminChaptersPage() {
  const { isAdmin } = useAuth();
  const { data: subjects, isLoading: subjectsLoading } = useAdminSubjects();

  if (!isAdmin) return <Redirect to="/dashboard" />;
  if (subjectsLoading) return <div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>;

  const fields: AdminField[] = [
    {
      name: 'subject_id',
      label: 'Subject',
      type: 'select',
      required: true,
      options: (subjects ?? []).map((s) => ({ label: s.name, value: s.id })),
    },
    { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Percentages' },
    { name: 'description', label: 'Description', type: 'textarea' },
    {
      name: 'difficulty',
      label: 'Difficulty',
      type: 'select',
      defaultValue: 'beginner',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
    },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 0 },
    { name: 'is_active', label: 'Active (visible to students)', type: 'boolean', defaultValue: true },
  ];

  return (
    <AdminCrudPage
      title="Manage Chapters"
      description="Create and edit chapters within each subject."
      entitySingular="Chapter"
      fields={fields}
      columns={columns}
      useList={useAdminChapters}
      useCreate={useCreateChapter}
      useUpdate={useUpdateChapter}
      useDelete={useDeleteChapter}
    />
  );
}
