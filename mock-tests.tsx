import { useState } from 'react';
import { Redirect } from 'wouter';
import { ListChecks, Loader2, Plus, Trash2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import AdminCrudPage, { AdminField, AdminColumn } from '@/components/admin/AdminCrudPage';
import {
  useAdminMockTests, useCreateMockTest, useUpdateMockTest, useDeleteMockTest,
  useAdminQuestions, useMockTestQuestions, useAddQuestionToMockTest, useRemoveQuestionFromMockTest,
} from '@/lib/supabase-admin';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const columns: AdminColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Type' },
  { key: 'total_questions', label: 'Questions' },
  { key: 'duration_minutes', label: 'Duration (min)' },
  { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
];

const fields: AdminField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  {
    name: 'type',
    label: 'Test type',
    type: 'select',
    defaultValue: 'full',
    options: [
      { label: 'Full length', value: 'full' },
      { label: 'Subject-wise', value: 'subject' },
      { label: 'Chapter-wise', value: 'chapter' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Previous Year Paper', value: 'pyp' },
    ],
  },
  { name: 'total_questions', label: 'Total questions', type: 'number', defaultValue: 0, helpText: 'Should match the number of questions you link below.' },
  { name: 'duration_minutes', label: 'Duration (minutes)', type: 'number', defaultValue: 60 },
  { name: 'negative_marking', label: 'Negative marking', type: 'boolean', defaultValue: false },
  { name: 'is_active', label: 'Active (visible to students)', type: 'boolean', defaultValue: true },
  { name: 'intro_video_url', label: 'Intro video', type: 'video', helpText: 'Optional — a short video explaining the test.' },
];

function ManageQuestionsDialog({ mockTestId, mockTestTitle, onClose }: { mockTestId: number; mockTestTitle: string; onClose: () => void }) {
  const { data: linked, isLoading: linkedLoading } = useMockTestQuestions(mockTestId);
  const { data: allQuestions, isLoading: questionsLoading } = useAdminQuestions();
  const addLink = useAddQuestionToMockTest();
  const removeLink = useRemoveQuestionFromMockTest();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');

  const linkedIds = new Set((linked ?? []).map((l) => l.question_id));
  const availableQuestions = (allQuestions ?? []).filter((q) => !linkedIds.has(q.id));

  async function handleAdd() {
    if (!selectedQuestionId) return;
    const nextOrder = (linked ?? []).reduce((max, l) => Math.max(max, l.order ?? -1), -1) + 1;
    await addLink.mutateAsync({ mockTestId, questionId: Number(selectedQuestionId), order: nextOrder });
    setSelectedQuestionId('');
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5" /> Questions in "{mockTestTitle}"</DialogTitle>
          <DialogDescription>Add or remove questions included in this mock test.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 items-center">
          <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
            <SelectTrigger className="flex-1" data-testid="select-question-to-add">
              <SelectValue placeholder={questionsLoading ? 'Loading questions...' : 'Select a question to add'} />
            </SelectTrigger>
            <SelectContent>
              {availableQuestions.map((q) => (
                <SelectItem key={q.id} value={String(q.id)}>
                  {q.text.slice(0, 70)}{q.text.length > 70 ? '…' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={!selectedQuestionId || addLink.isPending} data-testid="button-add-question">
            {addLink.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>

        <div className="border rounded-xl divide-y mt-2">
          {linkedLoading ? (
            <div className="p-4"><Skeleton className="h-4 w-full" /></div>
          ) : !linked || linked.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">No questions linked yet.</p>
          ) : (
            linked.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-2 p-3">
                <span className="text-sm flex-1">{l.practice_questions?.text ?? 'Question'}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeLink.mutate({ linkId: l.id, mockTestId })}
                  data-testid={`button-remove-question-${l.id}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminMockTestsPage() {
  const { isAdmin } = useAuth();
  const [manageTarget, setManageTarget] = useState<{ id: number; title: string } | null>(null);

  if (!isAdmin) return <Redirect to="/dashboard" />;

  return (
    <>
      <AdminCrudPage
        title="Manage Mock Tests"
        description="Create mock tests and choose which questions belong to each one."
        entitySingular="Mock test"
        fields={fields}
        columns={columns}
        useList={useAdminMockTests}
        useCreate={useCreateMockTest}
        useUpdate={useUpdateMockTest}
        useDelete={useDeleteMockTest}
        renderRowExtra={(row) => (
          <Button
            size="sm"
            variant="outline"
            className="mr-1"
            onClick={() => setManageTarget({ id: row.id, title: row.title })}
            data-testid={`button-manage-questions-${row.id}`}
          >
            <ListChecks className="w-4 h-4 mr-1" /> Questions
          </Button>
        )}
      />
      {manageTarget && (
        <ManageQuestionsDialog
          mockTestId={manageTarget.id}
          mockTestTitle={manageTarget.title}
          onClose={() => setManageTarget(null)}
        />
      )}
    </>
  );
}
