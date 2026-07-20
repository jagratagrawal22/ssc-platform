import { useRoute, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useChapter, useQuestionsByChapter } from "@/lib/supabase-db";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Flag, Target, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type QuestionStatus = 'unseen' | 'answered' | 'marked' | 'answered-marked' | 'skipped';

export default function PracticePage() {
  const [, params] = useRoute("/practice/:id");
  const chapterId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();

  const { data: chapter } = useChapter(chapterId);
  const { data: questions = [], isLoading } = useQuestionsByChapter(chapterId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [status, setStatus] = useState<Record<number, QuestionStatus>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600);

  useEffect(() => {
    if (questions.length > 0) setTimeRemaining(questions.length * 60);
  }, [questions.length]);

  useEffect(() => {
    if (questions.length === 0 || isPaused || timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [questions.length, isPaused, timeRemaining]);

  useEffect(() => {
    if (questions.length > 0 && Object.keys(status).length === 0) {
      const init: Record<number, QuestionStatus> = {};
      questions.forEach(q => { init[q.id] = 'unseen'; });
      setStatus(init);
    }
  }, [questions, status]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-background"><Skeleton className="h-[60vh] w-[80vw] rounded-2xl" /></div>;

  if (questions.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <Target className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No questions available</h2>
        <p className="text-muted-foreground mb-6">This chapter doesn't have any practice questions yet.</p>
        <Button onClick={() => setLocation(`/chapters/${chapterId}`)}>Go Back</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (showExplanation[currentQuestion.id]) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optIndex }));
    setStatus(prev => {
      const cur = prev[currentQuestion.id];
      return { ...prev, [currentQuestion.id]: (cur === 'marked' || cur === 'answered-marked') ? 'answered-marked' : 'answered' };
    });
  };

  const handleMarkReview = () => {
    setStatus(prev => {
      const cur = prev[currentQuestion.id];
      if (cur === 'answered') return { ...prev, [currentQuestion.id]: 'answered-marked' };
      if (cur === 'answered-marked') return { ...prev, [currentQuestion.id]: 'answered' };
      return { ...prev, [currentQuestion.id]: (cur === 'unseen' || cur === 'skipped') ? 'marked' : 'unseen' };
    });
  };

  const navigateTo = (index: number) => {
    if (status[currentQuestion.id] === 'unseen' && answers[currentQuestion.id] === undefined) {
      setStatus(prev => ({ ...prev, [currentQuestion.id]: 'skipped' }));
    }
    setCurrentIndex(index);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
    return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  const getStatusColor = (s: QuestionStatus) => {
    switch(s) {
      case 'answered': return 'bg-emerald-500 text-white border-emerald-600';
      case 'marked': return 'bg-purple-500 text-white border-purple-600';
      case 'answered-marked': return 'bg-emerald-500 text-white border-2 border-purple-600';
      case 'skipped': return 'bg-rose-500 text-white border-rose-600';
      default: return 'bg-card text-foreground border-border hover:bg-muted';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <div className="w-80 bg-card border-r hidden md:flex flex-col shadow-sm z-10">
        <div className="p-4 border-b bg-muted/10">
          <h3 className="font-bold text-lg mb-1">{chapter?.title || "Practice Mode"}</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">{questions.length} Questions</span>
            <div className={cn("font-mono font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border shadow-sm", timeRemaining < 300 ? "text-rose-500 border-rose-200" : "text-primary")}>
              ⏱ {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => navigateTo(i)}
                className={cn("h-10 w-full rounded-md text-sm font-semibold flex items-center justify-center transition-all shadow-sm border", getStatusColor(status[q.id]), currentIndex === i && "ring-2 ring-primary ring-offset-2 scale-110 z-10")}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t bg-muted/10 space-y-2 text-xs font-medium">
          <div className="flex justify-between">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div> Answered ({Object.values(status).filter(s => s === 'answered' || s === 'answered-marked').length})</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500"></div> Marked ({Object.values(status).filter(s => s === 'marked').length})</div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-rose-500"></div> Skipped ({Object.values(status).filter(s => s === 'skipped').length})</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-card border"></div> Unseen ({Object.values(status).filter(s => s === 'unseen').length})</div>
          </div>
          <Button className="w-full mt-4 bg-primary text-white shadow-md" onClick={() => setLocation(`/chapters/${chapterId}`)}>Finish Practice</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative h-full">
        <div className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setLocation(`/chapters/${chapterId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="font-bold text-lg bg-primary/10 text-primary px-3 py-1 rounded-md">
              Q {currentIndex + 1} <span className="text-muted-foreground font-normal text-base">/ {questions.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 font-medium" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? <><Play className="w-4 h-4" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
            </Button>
            <Button variant="outline" size="sm"
              onClick={handleMarkReview}
              className={cn("gap-2 font-medium transition-colors", (status[currentQuestion.id] === 'marked' || status[currentQuestion.id] === 'answered-marked') ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400" : "")}>
              <Flag className="w-4 h-4" /> <span className="hidden sm:inline">Mark for Review</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isPaused ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-background/50 backdrop-blur-sm absolute inset-0 z-20">
              <Pause className="w-20 h-20 text-muted-foreground mb-6" />
              <h2 className="text-3xl font-bold mb-2">Test Paused</h2>
              <p className="text-muted-foreground mb-8">Take a deep breath. Ready to continue?</p>
              <Button size="lg" onClick={() => setIsPaused(false)} className="rounded-full h-14 px-8 text-lg shadow-lg">
                Resume Test <Play className="ml-2 w-5 h-5 fill-current" />
              </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-4 md:p-8 w-full">
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border mb-6 text-lg md:text-xl font-medium leading-relaxed text-foreground">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded">
                    {currentQuestion.type === 'pyq' ? `PYQ ${currentQuestion.year || ''}` : 'Practice'}
                  </span>
                  <span className={cn("text-xs font-bold px-2.5 py-1 rounded border",
                    currentQuestion.difficulty === 'easy' ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                    currentQuestion.difficulty === 'medium' ? "text-amber-600 bg-amber-50 border-amber-200" :
                    "text-rose-600 bg-rose-50 border-rose-200")}>
                    {currentQuestion.difficulty.toUpperCase()}
                  </span>
                </div>
                {currentQuestion.text}
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = answers[currentQuestion.id] === idx;
                  const isCorrect = currentQuestion.correctAnswer === idx;
                  const showResult = showExplanation[currentQuestion.id];
                  let cls = "bg-card border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer";
                  if (showResult) {
                    if (isCorrect) cls = "bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-600 dark:text-emerald-100 ring-1 ring-emerald-500";
                    else if (isSelected) cls = "bg-rose-50 border-rose-500 text-rose-900 dark:bg-rose-950 dark:border-rose-600 dark:text-rose-100";
                    else cls = "bg-card border-border opacity-60 cursor-default";
                  } else if (isSelected) cls = "bg-primary/5 border-primary text-primary shadow-sm ring-1 ring-primary";

                  return (
                    <div key={idx} onClick={() => handleSelectOption(idx)}
                      className={cn("p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-base md:text-lg", cls)}>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                        showResult && isCorrect ? "bg-emerald-500 text-white" :
                        showResult && isSelected && !isCorrect ? "bg-rose-500 text-white" :
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1">{opt}</div>
                      {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 animate-in zoom-in" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500 shrink-0 animate-in zoom-in" />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                {!showExplanation[currentQuestion.id] && answers[currentQuestion.id] !== undefined ? (
                  <Button size="lg" className="w-full h-14 rounded-xl text-lg font-bold shadow-md bg-secondary text-secondary-foreground hover:bg-secondary/90 animate-in slide-in-from-bottom-2"
                    onClick={() => setShowExplanation(prev => ({ ...prev, [currentQuestion.id]: true }))}>
                    Check Answer
                  </Button>
                ) : showExplanation[currentQuestion.id] ? (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-6 animate-in slide-in-from-bottom-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400 font-bold">
                      <AlertCircle className="w-5 h-5" /> Solution & Explanation
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
                      {currentQuestion.explanation}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="h-24" />
            </div>
          )}
        </div>

        <div className="h-20 border-t bg-card/80 backdrop-blur-md absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 md:px-8 z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <Button variant="outline" size="lg" onClick={() => navigateTo(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0 || isPaused} className="rounded-full px-6 font-semibold">
            <ChevronLeft className="w-5 h-5 mr-1" /> Previous
          </Button>
          <Button size="lg" onClick={() => navigateTo(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1 || isPaused} className="rounded-full px-8 shadow-md font-semibold bg-primary hover:bg-primary/90">
            Save & Next <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
