import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats, useRecentActivity, useSubjects } from "@/lib/supabase-db";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Clock, BookOpen, Target, ChevronRight, Trophy, Bookmark, PlayCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activityLoading } = useRecentActivity();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();

  const performanceData = [
    { name: 'Mon', accuracy: 65 }, { name: 'Tue', accuracy: 70 },
    { name: 'Wed', accuracy: 68 }, { name: 'Thu', accuracy: 75 },
    { name: 'Fri', accuracy: 82 }, { name: 'Sat', accuracy: 80 },
    { name: 'Sun', accuracy: 85 },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile?.name?.split(' ')[0] || "Student"}! 👋</h1>
          <p className="text-muted-foreground mt-1 text-lg">Let's continue your preparation journey.</p>
        </div>
        <div className="flex items-center gap-3 bg-card border rounded-full px-4 py-2 shadow-sm">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
          <span className="font-bold">{stats?.studyStreak || 0} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Study" value={`${Math.floor((stats?.totalStudyMinutes || 0)/60)}h ${(stats?.totalStudyMinutes || 0)%60}m`} icon={Clock} color="text-blue-500" bg="bg-blue-500/10" loading={statsLoading} />
            <StatsCard title="Completed" value={`${stats?.completedChapters || 0}/${stats?.totalChapters || 0}`} icon={BookOpen} color="text-green-500" bg="bg-green-500/10" loading={statsLoading} />
            <StatsCard title="Accuracy" value={`${stats?.overallAccuracy || 0}%`} icon={Target} color="text-purple-500" bg="bg-purple-500/10" loading={statsLoading} />
            <StatsCard title="Tests Taken" value={`${stats?.testsAttempted || 0}`} icon={Trophy} color="text-yellow-500" bg="bg-yellow-500/10" loading={statsLoading} />
          </div>

          <Card className="shadow-lg border-0 bg-card">
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>Your accuracy trend this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorAccuracy)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </div>
              <Link href="/subjects"><Button variant="ghost" className="text-primary">View All</Button></Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectsLoading ? (
                <div className="space-y-3"><Skeleton className="h-20 w-full rounded-xl" /><Skeleton className="h-20 w-full rounded-xl" /></div>
              ) : subjects?.slice(0, 3).map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/50 transition-colors group bg-background/50 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: `${subject.color}15`, color: subject.color }}>
                      {subject.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{subject.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={0} className="h-1.5 w-24" />
                        <span className="text-xs text-muted-foreground">0%</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/subjects/${subject.id}`}>
                    <Button variant="secondary" size="icon" className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card className="bg-primary text-primary-foreground border-0 shadow-xl overflow-hidden relative">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <CardContent className="p-6 relative z-10">
              <h3 className="text-lg font-semibold text-primary-foreground/90 mb-1">Today's Goal</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold">{stats?.dailyProgressMinutes || 0}</span>
                <span className="text-primary-foreground/70 mb-1">/ {stats?.dailyGoalMinutes || 120} min</span>
              </div>
              <Progress value={((stats?.dailyProgressMinutes || 0) / (stats?.dailyGoalMinutes || 120)) * 100} className="h-2 bg-primary-foreground/20 [&>div]:bg-white" />
              <p className="text-sm mt-3 text-primary-foreground/80">You're doing great! Keep it up.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-card">
            <CardHeader className="pb-3"><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="flex gap-3"><Skeleton className="h-8 w-8 rounded-full"/><Skeleton className="h-8 flex-1"/></div>)}</div>
              ) : activities?.length ? (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs font-bold text-primary shrink-0">{activity.score?.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No activity yet. Take a mock test!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-card">
            <CardContent className="p-0">
              <Link href="/mock-tests" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><Target className="w-5 h-5" /></div>
                  <span className="font-medium">Mock Tests</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div className="h-px w-full bg-border" />
              <Link href="/leaderboard" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500"><Trophy className="w-5 h-5" /></div>
                  <span className="font-medium">Leaderboard</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, bg, loading }: { title: string, value: string, icon: any, color: string, bg: string, loading?: boolean }) {
  return (
    <Card className="border-0 shadow-md bg-card">
      <CardContent className="p-4 flex flex-col justify-center h-full">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-md ${bg} ${color}`}><Icon className="w-4 h-4" /></div>
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
        </div>
        {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );
}
