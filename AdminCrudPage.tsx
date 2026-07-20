import { ReactNode, useEffect, useState } from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, Loader2, Pencil, Plus, Trash2, UploadCloud } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { uploadFile, deleteFileByUrl, UploadBucket } from '@/lib/supabase-admin';
import { useToast } from '@/hooks/use-toast';

export type AdminFieldType =
  | 'text' | 'textarea' | 'number' | 'boolean' | 'select'
  | 'image' | 'video' | 'pdf' | 'mcq-options';

export interface AdminField {
  name: string;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  defaultValue?: any;
  /** Only relevant for numbers: render as a plain input, not a stepper */
  helpText?: string;
}

export interface AdminColumn {
  key: string;
  label: string;
  render?: (row: any) => ReactNode;
}

interface AdminCrudPageProps {
  title: string;
  description: string;
  entitySingular: string;
  fields: AdminField[];
  columns: AdminColumn[];
  useList: () => UseQueryResult<any[]>;
  useCreate: () => UseMutationResult<any, any, Record<string, any>>;
  useUpdate: () => UseMutationResult<any, any, { id: any; values: Record<string, any> }>;
  useDelete: () => UseMutationResult<any, any, any>;
  /** Optional extra action rendered per row, e.g. "Manage Questions" for mock tests */
  renderRowExtra?: (row: any) => ReactNode;
}

function emptyFormFromFields(fields: AdminField[]) {
  const obj: Record<string, any> = {};
  for (const f of fields) {
    if (f.defaultValue !== undefined) obj[f.name] = f.defaultValue;
    else if (f.type === 'boolean') obj[f.name] = false;
    else if (f.type === 'mcq-options') obj[f.name] = ['', '', '', ''];
    else if (f.type === 'number') obj[f.name] = '';
    else obj[f.name] = '';
  }
  return obj;
}

export default function AdminCrudPage({
  title, description, entitySingular, fields, columns,
  useList, useCreate, useUpdate, useDelete, renderRowExtra,
}: AdminCrudPageProps) {
  const { data: rows, isLoading } = useList();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyFormFromFields(fields));
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  useEffect(() => {
    if (!dialogOpen) setForm(emptyFormFromFields(fields));
  }, [dialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditingId(null);
    setForm(emptyFormFromFields(fields));
    setDialogOpen(true);
  }

  function openEdit(row: any) {
    setEditingId(row.id);
    const next: Record<string, any> = {};
    for (const f of fields) {
      next[f.name] = row[f.name] ?? (f.type === 'mcq-options' ? ['', '', '', ''] : '');
    }
    setForm(next);
    setDialogOpen(true);
  }

  function setField(name: string, value: any) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleUpload(field: AdminField, file: File) {
    const bucket: UploadBucket = field.type === 'image' ? 'images' : field.type === 'video' ? 'videos' : 'pdfs';
    const previousUrl = form[field.name];
    setUploading(field.name);
    try {
      const url = await uploadFile(bucket, file, entitySingular.toLowerCase().replace(/\s+/g, '-'));
      setField(field.name, url);
      toast({ title: 'File uploaded' });
      if (previousUrl) {
        // Best-effort cleanup of the file being replaced — never blocks the UI.
        deleteFileByUrl(bucket, previousUrl).catch(() => {});
      }
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  }

  function buildPayload() {
    const payload: Record<string, any> = {};
    for (const f of fields) {
      if (f.type === 'number') {
        payload[f.name] = form[f.name] === '' || form[f.name] === null ? null : Number(form[f.name]);
      } else if (f.type === 'mcq-options') {
        payload[f.name] = (form[f.name] || []).filter((o: string) => o.trim() !== '');
      } else if (f.type === 'select' && f.options?.length && typeof f.options[0].value === 'number') {
        // Select values round-trip through the UI as strings — cast back
        // to number when the option set is numeric (e.g. foreign keys).
        payload[f.name] = form[f.name] === '' || form[f.name] == null ? null : Number(form[f.name]);
      } else {
        payload[f.name] = form[f.name];
      }
    }
    return payload;
  }

  async function handleSubmit() {
    const missing = fields.find((f) => {
      if (!f.required) return false;
      const v = form[f.name];
      if (f.type === 'mcq-options') return !Array.isArray(v) || v.filter((o: string) => o.trim() !== '').length < 2;
      return v === '' || v === undefined || v === null;
    });
    if (missing) {
      toast({ title: `"${missing.label}" is required`, variant: 'destructive' });
      return;
    }
    const payload = buildPayload();
    if (editingId != null) {
      await updateMutation.mutateAsync({ id: editingId, values: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    for (const f of fields) {
      if ((f.type === 'image' || f.type === 'video' || f.type === 'pdf') && deleteTarget[f.name]) {
        const bucket: UploadBucket = f.type === 'image' ? 'images' : f.type === 'video' ? 'videos' : 'pdfs';
        deleteFileByUrl(bucket, deleteTarget[f.name]).catch(() => {});
      }
    }
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Console
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <Button onClick={openCreate} className="rounded-full shadow-sm bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add">
          <Plus className="w-4 h-4 mr-2" /> Add {entitySingular}
        </Button>
      </div>

      <div className="border rounded-2xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((c) => <TableCell key={c.key}><Skeleton className="h-4 w-24" /></TableCell>)}
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : !rows || rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-8">
                  No {title.toLowerCase()} yet. Click "Add {entitySingular}" to create one.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} data-testid={`row-${entitySingular.toLowerCase()}-${row.id}`}>
                  {columns.map((c) => (
                    <TableCell key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? '—')}</TableCell>
                  ))}
                  <TableCell className="text-right space-x-1 whitespace-nowrap">
                    {renderRowExtra && renderRowExtra(row)}
                    <Button size="icon" variant="ghost" onClick={() => openEdit(row)} data-testid={`button-edit-${row.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row)} data-testid={`button-delete-${row.id}`}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId != null ? `Edit ${entitySingular}` : `Add ${entitySingular}`}</DialogTitle>
            <DialogDescription>
              {editingId != null ? `Update this ${entitySingular.toLowerCase()}.` : `Create a new ${entitySingular.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={f.name}>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>

                {f.type === 'text' && (
                  <Input id={f.name} placeholder={f.placeholder} value={form[f.name] ?? ''} onChange={(e) => setField(f.name, e.target.value)} data-testid={`input-${f.name}`} />
                )}

                {f.type === 'number' && (
                  <Input id={f.name} type="number" placeholder={f.placeholder} value={form[f.name] ?? ''} onChange={(e) => setField(f.name, e.target.value)} data-testid={`input-${f.name}`} />
                )}

                {f.type === 'textarea' && (
                  <Textarea id={f.name} rows={4} placeholder={f.placeholder} value={form[f.name] ?? ''} onChange={(e) => setField(f.name, e.target.value)} data-testid={`input-${f.name}`} />
                )}

                {f.type === 'boolean' && (
                  <div className="flex items-center gap-2">
                    <Switch id={f.name} checked={!!form[f.name]} onCheckedChange={(v) => setField(f.name, v)} data-testid={`switch-${f.name}`} />
                    <span className="text-sm text-muted-foreground">{form[f.name] ? 'Yes' : 'No'}</span>
                  </div>
                )}

                {f.type === 'select' && (
                  <Select value={form[f.name] != null ? String(form[f.name]) : ''} onValueChange={(v) => setField(f.name, v)}>
                    <SelectTrigger data-testid={`select-${f.name}`}>
                      <SelectValue placeholder={f.placeholder || 'Select...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={String(o.value)} value={String(o.value)}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {(f.type === 'image' || f.type === 'video' || f.type === 'pdf') && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id={f.name}
                        type="file"
                        accept={f.type === 'image' ? 'image/*' : f.type === 'video' ? 'video/*' : 'application/pdf'}
                        onChange={(e) => e.target.files?.[0] && handleUpload(f, e.target.files[0])}
                        data-testid={`file-${f.name}`}
                      />
                      {uploading === f.name && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    </div>
                    {form[f.name] ? (
                      <a href={form[f.name]} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 truncate">
                        <UploadCloud className="w-3 h-3 shrink-0" /> {form[f.name]}
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground">{f.helpText || 'Optional — no file uploaded yet.'}</p>
                    )}
                  </div>
                )}

                {f.type === 'mcq-options' && (
                  <div className="space-y-2">
                    {(form[f.name] || ['', '', '', '']).map((opt: string, idx: number) => (
                      <Input
                        key={idx}
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const next = [...(form[f.name] || ['', '', '', ''])];
                          next[idx] = e.target.value;
                          setField(f.name, next);
                        }}
                        data-testid={`input-option-${idx}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} data-testid="button-save">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId != null ? 'Save changes' : `Create ${entitySingular}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {entitySingular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {entitySingular.toLowerCase()}
              {' '}and any related records that reference it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
