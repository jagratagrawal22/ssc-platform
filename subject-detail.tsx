import { useRoute, Link } from "wouter";
import { useSubject, useChaptersBySubject } from "@/lib/supabase-db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, HelpCircle, ChevronLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function SubjectDetailPage() {
  const [, params] = useRoute("/subjects/:id");
  const subjectId = params?.id ? parseInt(params.id) : 0;
  const [filter, setFilter] = useState("all");

  const { data: subject, isLoading: subjectLoading } = useSubject(subjectId);
  const { data: chapters, isLoading: chaptersLoading } = useChaptersBySubject(subjectId);

  const filteredChapters = chapters?.filter(c => filter === "all" || c.difficulty === filter);

  if (subjectLoading) return <div className="p-8"><Skeleton className="h-40 w-full rounded-2xl mb-8" /><div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div></div>;
  if (!subject) return <div>Subject not found</div>;

  return (
    <div className="pb-12 animate-in fade-in duration-500">
      <div className="w-full relative overflow-hidden bg-card border-b">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundColor: subject.color }}></div>
        <div className="absolute -right-24 -top-24 w-96 h-96 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: subject.color }}></div>
        <div className="max-w-7xl mx-auto p-6 md:p-10 relative z-10">
          <Link href="/subjects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Subjects
          </Link>
          <div className="flex flex-col md:flex-row gap-6 md:items-end">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-4xl md:text-5xl shadow-xl bg-background border-2" style={{ borderColor: `${subject.color}30`, color: subject.color }}>
              {subject.icon || "📚"}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-2">{subject.name}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">{subject.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold">Chapters ({chapters?.length || 0})</h2>
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-4 sm:w-auto bg-muted/50 p-1">
              <TabsTrigger value="all" className="rounded-md">All</TabsTrigger>
              <TabsTrigger value="beginner" className="rounded-md text-emerald-600">Easy</TabsTrigger>
              <TabsTrigger value="intermediate" className="rounded-md text-amber-600">Medium</TabsTrigger>
              <TabsTrigger value="advanced" className="rounded-md text-rose-600">Hard</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          {chaptersLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
            : filteredChapters?.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-dashed">
                <p className="text-muted-foreground">No chapters found for this filter.</p>
              </div>
            ) : filteredChapters?.map((chapter, index) => {
              const difficultyColor =
                chapter.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                chapter.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
              const difficultyLabel = chapter.difficulty.charAt(0).toUpperCase() + chapter.difficulty.slice(1);

              return (
                <Link key={chapter.id} href={`/chapters/${chapter.id}`}>
                  <Card className="group hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border-border/50">
                    <div className="flex flex-col md:flex-row">
                      <div className="hidden md:flex flex-col items-center justify-center w-16 border-r bg-muted/20 text-muted-foreground font-semibold group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <CardContent className="p-5 flex-1 flex flex-col md:flex-row gap-5 items-start md:items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge variant="secondary" className={`${difficultyColor} border-0 text-xs font-semibold px-2 py-0.5`}>{difficultyLabel}</Badge>
                            {chapter.isCompleted && <Badge variant="default" className="bg-primary/10 text-primary border-0 hover:bg-primary/20">Completed</Badge>}
                          </div>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">{chapter.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{chapter.description}</p>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5 bg-background border px-2.5 py-1 rounded-md shadow-sm">
                              <HelpCircle className="w-4 h-4 text-primary" />
                              <span className="font-medium">{chapter.questionCount} Qs</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-background border px-2.5 py-1 rounded-md shadow-sm">
                              <BookOpen className="w-4 h-4 text-secondary" />
                              <span className="font-medium">{chapter.notesCount} Notes</span>
                            </div>
                          </div>
                          <div className="hidden md:flex w-24 flex-col gap-1.5">
                            <div className="flex justify-between text-xs font-medium">
                              <span>Progress</span><span>{chapter.progressPercent}%</span>
                            </div>
                            <Progress value={chapter.progressPercent} className="h-1.5" />
                          </div>
                          <Button variant="ghost" size="icon" className="hidden md:flex rounded-full text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                            <ArrowRight className="w-5 h-5" />
                          </Button>
                        </div>
                        <div className="md:hidden w-full mt-2">
                          <Progress value={chapter.progressPercent} className="h-1.5 mb-1" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
