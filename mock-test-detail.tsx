import { useRoute, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useMockTest, useSubmitTestResult } from "@/lib/supabase-db";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Target, ChevronLeft, ChevronRight, AlertCircle, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

type QuestionStatus = 'unseen' | 'answered' | 'marked' | 'answered-marked' | 'skipped';

export default function MockTestDetailPage() {
  const [, params] = useRoute("/mock-tests/:id");
  const mockTestId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();

  const { data: testDetail, isLoading } = useMockTest(mockTestId);
  const submitResult = useSubmitTestResult();

  const questions = testDetail?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [status, setStatus] = useState<Record<number, QuestionStatus>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (isStarted && testDetail?.durationMinutes) setTimeRemaining(testDetail.durationMinutes * 60);
  }, [isStarted, testDetail?.durationMinutes]);

  useEffect(() => {
    if (!isStarted || isPaused || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => { if (prev <= 1) { clearInterval(timer); handleSubmitTest(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, isPaused, timeRemaining]);

  useEffect(() => {
    if (questions.length > 0 && Object.keys(status).length === 0) {
      const init: Record<number, QuestionStatus> = {};
      questions.forEach(q => { init[q.id] = 'unseen'; });
      setStatus(init);
    }
  }, [questions, status]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-background"><Skeleton className="h-[60vh] w-[80vw] rounded-2xl" /></div>;
  if (!testDetail) return <div className="h-screen flex items-center justify-center">Test not found</div>;

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-6 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-card rounded-3xl shadow-xl overflow-hidden border">
          <div className="h-32 bg-primary relative overflow-hidden flex items-center px-8">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <h1 className="text-3xl font-bold text-white relative z-10">{testDetail.title}</h1>
          </div>
          <div className="p-8 md:p-12">
            <h2 className="text-xl font-bold mb-6">Instructions</h2>
            <ul className="space-y-4 text-muted-foreground mb-10">
              <li className="flex gap-3"><span className="text-primary font-bold">•</span> {testDetail.totalQuestions} Objective Type Multiple Choice Questions.</li>
              <li className="flex gap-3"><span className="text-primary font-bold">•</span> Total duration: {testDetail.durationMinutes} minutes.</li>
              <li className="flex gap-3"><span className="text-primary font-bold">•</span> {testDetail.negativeMarking ? "Negative marking: 0.50 marks deducted for each wrong answer." : "No negative marking."}</li>
              <li className="flex gap-3"><span className="text-primary font-bold">•</span> Each correct answer carries 2 marks.</li>
              <li className="flex gap-3"><span className="text-primary font-bold">•</span> Use "Mark for Review" to revisit difficult questions.</li>
            </ul>
            <div className="flex justify-between items-center bg-muted/50 p-6 rounded-2xl border">
              <div>
                <p className="font-bold text-lg mb-1">{testDetail.totalQuestions} Questions</p>
                <p className="text-muted-foreground text-sm">{testDetail.durationMinutes} Minutes</p>
              </div>
              <Button size="lg" className="rounded-full px-8 shadow-lg text-lg h-14" onClick={() => setIsStarted(true)}>
                I am ready to begin
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <ClipboardList className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No questions in this test yet</h2>
        <p className="text-muted-foreground mb-6">The admin hasn't added questions to this test yet.</p>
        <Button onClick={() => setLocation('/mock-tests')}>Back to Tests</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
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

  const handleSubmitTest = async () => {
    const timeTaken = (testDetail.durationMinutes * 60) - timeRemaining;
    submitResult.mutate({
      mockTestId,
      answers,
      timeTakenSeconds: timeTaken,
      questions: questions.map(q => ({ id: q.id, correctAnswer: q.correctAnswer })),
      negativeMarking: testDetail.negativeMarking,
    }, {
      onSuccess: () => setLocation(`/mock-tests/${mockTestId}/result`),
    });
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

  const answeredCount = Object.values(status).filter(s => s === 'answered' || s === 'answered-marked').length;
  const markedCount = Object.values(status).filter(s => s === 'marked').length;
  const skippedCount = Object.values(status).filter(s => s === 'skipped').length;
  const unseenCount = questions.length - answeredCount - markedCount - skippedCount;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      <div className="w-80 bg-card border-r hidden md:flex flex-col shadow-sm z-10">
        <div className="p-4 border-b bg-muted/10">
          <h3 className="font-bold text-lg mb-1 truncate">{testDetail.title}</h3>
          <div className="flex items-center justify-between text-sm mt-3 bg-background p-3 rounded-lg border shadow-inner">
            <span className="text-muted-foreground font-medium flex items-center gap-2"><Target className="w-4 h-4"/> Time Left</span>
            <div className={cn("font-mono font-bold text-lg", timeRemaining < 300 ? "text-rose-500 animate-pulse" : "text-primary")}>
              {formatTime(timeRemaining)}
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
        <div className="p-4 border-t bg-muted/10 space-y-3 text-xs font-medium">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-background p-1.5 rounded border"><div className="w-3 h-3 rounded bg-emerald-500"></div> Answered: {answeredCount}</div>
            <div className="flex items-center gap-2 bg-background p-1.5 rounded border"><div className="w-3 h-3 rounded bg-purple-500"></div> Marked: {markedCount}</div>
            <div className="flex items-center gap-2 bg-background p-1.5 rounded border"><div className="w-3 h-3 rounded bg-rose-500"></div> Skipped: {skippedCount}</div>
            <div className="flex items-center gap-2 bg-background p-1.5 rounded border"><div className="w-3 h-3 rounded bg-card border"></div> Unseen: {unseenCount}</div>
          </div>
          <Button className="w-full mt-4 bg-primary text-white shadow-md h-12 text-base font-bold" onClick={() => setShowSubmitConfirm(true)} disabled={submitResult.isPending}>
            {submitResult.isPending ? "Submitting..." : "Submit Test"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative h-full">
        <div className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10">
          <div className="font-bold text-lg bg-primary/10 text-primary px-4 py-1.5 rounded-lg border border-primary/20">
            Q. {currentIndex + 1} <span className="text-muted-foreground font-normal text-base">/ {questions.length}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleMarkReview}
            className={cn("gap-2 font-medium transition-colors h-10 px-4", (status[currentQuestion.id] === 'marked' || status[currentQuestion.id] === 'answered-marked') ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400" : "")}>
            <AlertCircle className="w-4 h-4" /> <span className="hidden sm:inline">Mark for Review</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-8 w-full">
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border mb-8 text-lg md:text-xl font-medium leading-relaxed text-foreground select-none">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1.5 rounded-md w-max mb-6">
                Section: {currentQuestion.type || 'General'}
              </div>
              {currentQuestion.text}
            </div>

            <div className="space-y-4">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                return (
                  <div key={idx} onClick={() => handleSelectOption(idx)}
                    className={cn("p-5 rounded-xl border-2 transition-all flex items-center gap-5 text-base md:text-lg cursor-pointer",
                      isSelected ? "bg-primary/5 border-primary text-primary shadow-sm" : "bg-card border-border hover:border-primary/40 hover:bg-muted/30")}>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2",
                      isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-muted-foreground/50")}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className={cn("flex-1", isSelected ? "font-semibold" : "")}>{opt}</div>
                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", isSelected ? "border-primary" : "border-muted-foreground/40")}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-in zoom-in" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="h-32" />
          </div>
        </div>

        <div className="h-24 border-t bg-card/90 backdrop-blur-md absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 md:px-8 z-10 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
          <Button variant="outline" size="lg" onClick={() => navigateTo(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="rounded-full px-6 h-12 font-semibold text-base">
            <ChevronLeft className="w-5 h-5 mr-2" /> Previous
          </Button>
          <Button variant="ghost" size="lg" className="hidden sm:flex text-muted-foreground hover:text-foreground h-12"
            onClick={() => { const a = {...answers}; delete a[currentQuestion.id]; setAnswers(a); setStatus(prev => ({...prev, [currentQuestion.id]: 'skipped'})); }}>
            Clear Response
          </Button>
          <Button size="lg" onClick={() => navigateTo(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1} className="rounded-full px-8 h-12 shadow-lg font-semibold text-base bg-primary hover:bg-primary/90 hover:scale-105 transition-transform">
            Save & Next <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8">
          <DialogHeader className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl text-center">Submit Mock Test?</DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              You cannot change your answers after submission.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mb-8 bg-muted/30 p-6 rounded-2xl border">
            <div className="text-center"><p className="text-3xl font-bold text-emerald-600">{answeredCount}</p><p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Answered</p></div>
            <div className="text-center"><p className="text-3xl font-bold text-muted-foreground">{questions.length - answeredCount}</p><p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Unanswered</p></div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" size="lg" className="w-full rounded-full h-14" onClick={() => setShowSubmitConfirm(false)}>Continue Test</Button>
            <Button size="lg" className="w-full rounded-full h-14 bg-primary text-white shadow-lg" onClick={handleSubmitTest} disabled={submitResult.isPending}>
              {submitResult.isPending ? "Submitting..." : "Yes, Submit Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
