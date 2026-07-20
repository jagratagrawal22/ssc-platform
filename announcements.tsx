import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AdminCrudPage, { AdminField, AdminColumn } from '@/components/admin/AdminCrudPage';
import {
  useAdminAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement,
} from '@/lib/supabase-admin';
import { Badge } from '@/components/ui/badge';

const columns: AdminColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Type', render: (r) => <Badge variant="outline">{r.type}</Badge> },
  { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
];

const fields: AdminField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'content', label: 'Content', type: 'textarea', required: true },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    defaultValue: 'info',
    options: [
      { label: 'Info', value: 'info' },
      { label: 'Warning', value: 'warning' },
      { label: 'Success', value: 'success' },
      { label: 'New feature', value: 'new_feature' },
    ],
  },
  { name: 'is_active', label: 'Active (visible to students)', type: 'boolean', defaultValue: true },
  { name: 'image_url', label: 'Banner image', type: 'image', helpText: 'Optional — shown with the announcement.' },
];

export default function AdminAnnouncementsPage() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Redirect to="/dashboard" />;

  return (
    <AdminCrudPage
      title="Manage Announcements"
      description="Create and edit announcements shown to students."
      entitySingular="Announcement"
      fields={fields}
      columns={columns}
      useList={useAdminAnnouncements}
      useCreate={useCreateAnnouncement}
      useUpdate={useUpdateAnnouncement}
      useDelete={useDeleteAnnouncement}
    />
  );
}
