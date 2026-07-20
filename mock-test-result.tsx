import { useRoute, Link } from "wouter";
import { useMockTest, useTestResults } from "@/lib/supabase-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trophy, Target, CheckCircle2, XCircle, MinusCircle, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function MockTestResultPage() {
  const [, params] = useRoute("/mock-tests/:id/result");
  const mockTestId = params?.id ? parseInt(params.id) : 0;

  const { data: testDetail } = useMockTest(mockTestId);
  const { data: attempts, isLoading } = useTestResults(mockTestId);

  if (isLoading) return <div className="p-8 max-w-7xl mx-auto"><Skeleton className="h-64 w-full rounded-3xl mb-8" /><div className="grid grid-cols-3 gap-6"><Skeleton className="h-48 rounded-2xl"/><Skeleton className="h-48 rounded-2xl"/><Skeleton className="h-48 rounded-2xl"/></div></div>;

  const latestAttempt = attempts?.[0];
  if (!latestAttempt) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">No result found.</p>
        <Link href="/mock-tests"><Button>Back to Tests</Button></Link>
      </div>
    );
  }

  const pieData = [
    { name: 'Correct',   value: latestAttempt.correct,    color: 'hsl(142 71% 45%)' },
    { name: 'Incorrect', value: latestAttempt.incorrect,   color: 'hsl(0 84% 60%)' },
    { name: 'Skipped',   value: latestAttempt.skipped,     color: 'hsl(215 16% 47%)' },
  ];

  const barData = [
    { name: 'Reasoning', score: Math.round(latestAttempt.score * 0.30) },
    { name: 'Maths',     score: Math.round(latestAttempt.score * 0.25) },
    { name: 'English',   score: Math.round(latestAttempt.score * 0.25) },
    { name: 'GK',        score: Math.round(latestAttempt.score * 0.20) },
  ];

  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;
  const maxScore = (latestAttempt.totalQuestions || 0) * 2;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/mock-tests">
          <Button variant="ghost" size="icon" className="rounded-full bg-card shadow-sm border"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-muted-foreground">{testDetail?.title || "Test Result"}</h1>
      </div>

      {/* Score Banner */}
      <div className="relative overflow-hidden bg-primary rounded-3xl text-primary-foreground shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white border-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Performance Analysis</div>
            <h2 className="text-5xl md:text-7xl font-extrabold mb-4 tabular-nums tracking-tight">
              {latestAttempt.score.toFixed(2)}
              <span className="text-2xl md:text-3xl font-medium text-white/60 ml-2">/ {maxScore}</span>
            </h2>
            <p className="text-xl text-white/80 max-w-md">
              {latestAttempt.accuracy > 80 ? "Outstanding performance! You're well on track." :
               latestAttempt.accuracy > 60 ? "Good effort, but there's room for improvement." :
               "Focus on accuracy and concepts."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-center px-4"><div className="text-3xl font-bold mb-1">{latestAttempt.accuracy.toFixed(1)}%</div><div className="text-white/60 text-sm font-medium uppercase tracking-wider">Accuracy</div></div>
            <div className="w-px h-16 bg-white/20 hidden md:block"></div>
            <div className="text-center px-4"><div className="text-3xl font-bold mb-1">{latestAttempt.percentile || '--'}%ile</div><div className="text-white/60 text-sm font-medium uppercase tracking-wider">Percentile</div></div>
            <div className="w-px h-16 bg-white/20 hidden md:block"></div>
            <div className="text-center px-4"><div className="text-3xl font-bold mb-1">{formatTime(latestAttempt.timeTakenSeconds)}</div><div className="text-white/60 text-sm font-medium uppercase tracking-wider">Time Taken</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-lg border-0 bg-card rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[200px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /><span className="font-semibold text-emerald-900 dark:text-emerald-100">Correct</span></div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{latestAttempt.correct}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50">
                <div className="flex items-center gap-3"><XCircle className="w-5 h-5 text-rose-500" /><span className="font-semibold text-rose-900 dark:text-rose-100">Incorrect</span></div>
                <span className="font-bold text-rose-600 dark:text-rose-400">{latestAttempt.incorrect}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3"><MinusCircle className="w-5 h-5 text-slate-500" /><span className="font-semibold text-slate-700 dark:text-slate-300">Skipped</span></div>
                <span className="font-bold text-slate-600 dark:text-slate-400">{latestAttempt.skipped}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg border-0 bg-card rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-secondary" /> Sectional Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barSize={40}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                <Tooltip cursor={{fill: 'hsl(var(--muted)/0.5)'}} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-12 gap-6">
        <Link href={`/mock-tests/${mockTestId}`}>
          <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg font-semibold shadow-sm bg-card hover:bg-muted">
            <RefreshCw className="w-5 h-5 mr-2" /> Retake Test
          </Button>
        </Link>
        <Link href="/mock-tests">
          <Button size="lg" className="rounded-full px-10 h-14 text-lg font-semibold shadow-lg hover:-translate-y-1 transition-transform">
            Explore More Tests
          </Button>
        </Link>
      </div>
    </div>
  );
}
