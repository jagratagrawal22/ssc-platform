import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AdminCrudPage, { AdminField, AdminColumn } from '@/components/admin/AdminCrudPage';
import {
  useAdminSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject,
} from '@/lib/supabase-admin';

const fields: AdminField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Quantitative Aptitude' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Short description shown on the subjects page' },
  { name: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: '📐', defaultValue: '📚' },
  { name: 'color', label: 'Color (hex)', type: 'text', placeholder: '#1E3A8A', defaultValue: '#1E3A8A' },
  { name: 'order', label: 'Display order', type: 'number', defaultValue: 0 },
  { name: 'is_active', label: 'Active (visible to students)', type: 'boolean', defaultValue: true },
];

const columns: AdminColumn[] = [
  { key: 'icon', label: '', render: (r) => <span className="text-xl">{r.icon}</span> },
  { key: 'name', label: 'Name' },
  { key: 'order', label: 'Order' },
  { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
];

export default function AdminSubjectsPage() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Redirect to="/dashboard" />;

  return (
    <AdminCrudPage
      title="Manage Subjects"
      description="Create and edit the subjects students see on the platform."
      entitySingular="Subject"
      fields={fields}
      columns={columns}
      useList={useAdminSubjects}
      useCreate={useCreateSubject}
      useUpdate={useUpdateSubject}
      useDelete={useDeleteSubject}
    />
  );
}
