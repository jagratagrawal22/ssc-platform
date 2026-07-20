import { useRoute, Link } from "wouter";
import { useChapter, useNotesByChapter, useQuestionsByChapter, useFormulaSheet } from "@/lib/supabase-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, BookText, Calculator, Target, Play, Bookmark, FileText, CheckCircle2 } from "lucide-react";

export default function ChapterDetailPage() {
  const [, params] = useRoute("/chapters/:id");
  const chapterId = params?.id ? parseInt(params.id) : 0;

  const { data: chapter, isLoading: chapterLoading } = useChapter(chapterId);
  const { data: notes, isLoading: notesLoading } = useNotesByChapter(chapterId);
  const { data: questionsData } = useQuestionsByChapter(chapterId);
  const { data: formulaSheet } = useFormulaSheet(chapterId);

  if (chapterLoading) return <div className="p-8"><Skeleton className="h-40 w-full rounded-2xl mb-8" /></div>;
  if (!chapter) return <div>Chapter not found</div>;

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex flex-col bg-background overflow-hidden animate-in fade-in">
      <div className="border-b bg-card shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
            <Link href="/subjects" className="hover:text-primary transition-colors">Subjects</Link>
            <span>/</span>
            <Link href={`/subjects/${chapter.subjectId}`} className="hover:text-primary transition-colors">{chapter.subjectName}</Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{chapter.title}</h1>
              <p className="text-muted-foreground">{chapter.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-full gap-2">
                <Bookmark className="w-4 h-4" /> Save
              </Button>
              <Link href={`/practice/${chapter.id}`}>
                <Button className="rounded-full shadow-md gap-2">
                  <Play className="w-4 h-4" /> Start Practice
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="notes" className="h-full flex flex-col max-w-7xl mx-auto">
          <div className="px-6 border-b shrink-0 bg-background">
            <TabsList className="bg-transparent border-0 h-14 p-0 space-x-6">
              <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-2 py-4 font-semibold text-base">
                <BookText className="w-4 h-4 mr-2" /> Notes
              </TabsTrigger>
              <TabsTrigger value="formulas" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-2 py-4 font-semibold text-base">
                <Calculator className="w-4 h-4 mr-2" /> Formulas
              </TabsTrigger>
              <TabsTrigger value="practice" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-2 py-4 font-semibold text-base">
                <Target className="w-4 h-4 mr-2" /> Practice ({chapter.questionCount})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-6 bg-slate-50/50 dark:bg-slate-900/10">
            <TabsContent value="notes" className="m-0 h-full pb-10">
              <div className="max-w-4xl mx-auto space-y-6">
                {notesLoading ? <Skeleton className="h-[400px] w-full rounded-2xl" />
                  : notes?.length ? notes.map(note => (
                    <Card key={note.id} className="border-0 shadow-md bg-card overflow-hidden">
                      <div className="h-2 bg-primary/20 w-full" />
                      <CardHeader className="pb-3 bg-muted/10 border-b">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> {note.title}
                          </CardTitle>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-background px-2 py-1 rounded border shadow-sm">
                            {note.type.replace('_', ' ')}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 prose dark:prose-invert max-w-none text-foreground/90">
                        <div dangerouslySetInnerHTML={{ __html: note.content.replace(/\n/g, '<br/>') }} />
                      </CardContent>
                    </Card>
                  )) : <EmptyState icon={BookText} title="No notes available" desc="Notes for this chapter are coming soon." />}
              </div>
            </TabsContent>

            <TabsContent value="formulas" className="m-0 h-full pb-10">
              <div className="max-w-4xl mx-auto">
                {formulaSheet ? (
                  <Card className="border-0 shadow-lg bg-card overflow-hidden border-t-4 border-t-secondary">
                    <CardHeader className="bg-secondary/5 pb-4">
                      <CardTitle className="text-2xl flex items-center gap-3 text-secondary-foreground">
                        <Calculator className="w-6 h-6 text-secondary" /> {formulaSheet.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 prose dark:prose-invert max-w-none bg-[#fdfdfc] dark:bg-slate-950 font-mono text-sm leading-loose">
                      <div dangerouslySetInnerHTML={{ __html: formulaSheet.content.replace(/\n/g, '<br/>') }} />
                    </CardContent>
                  </Card>
                ) : <EmptyState icon={Calculator} title="No formula sheet" desc="A formula sheet for this chapter hasn't been created yet." />}
              </div>
            </TabsContent>

            <TabsContent value="practice" className="m-0 h-full pb-10">
              <div className="max-w-4xl mx-auto text-center py-16">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Ready to practice?</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                  This chapter has {chapter.questionCount} questions. Practice mode helps you identify your weak points.
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
                  <div className="bg-card p-4 rounded-xl border text-center shadow-sm">
                    <div className="text-emerald-500 font-bold text-xl mb-1">Easy</div>
                    <div className="text-sm text-muted-foreground">Level 1</div>
                  </div>
                  <div className="bg-card p-4 rounded-xl border text-center shadow-sm">
                    <div className="text-amber-500 font-bold text-xl mb-1">Medium</div>
                    <div className="text-sm text-muted-foreground">Level 2</div>
                  </div>
                  <div className="bg-card p-4 rounded-xl border text-center shadow-sm">
                    <div className="text-rose-500 font-bold text-xl mb-1">Hard</div>
                    <div className="text-sm text-muted-foreground">Level 3</div>
                  </div>
                </div>
                <Link href={`/practice/${chapter.id}`}>
                  <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-lg hover:scale-105 transition-transform">
                    Start Practice Session <Play className="ml-2 w-5 h-5 fill-current" />
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed shadow-sm">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{desc}</p>
    </div>
  );
}
