import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaderboard } from "@/lib/supabase-db";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Flame, Shield, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

// Static fallback for empty leaderboard
const MOCK_ENTRIES = [
  { rank: 1, userId: 'u1', name: "Rahul Sharma",  score: 9850, studyStreak: 45, completedChapters: 82, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
  { rank: 2, userId: 'u2', name: "Priya Patel",   score: 9200, studyStreak: 32, completedChapters: 75, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
  { rank: 3, userId: 'u3', name: "Amit Kumar",    score: 8900, studyStreak: 28, completedChapters: 70, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit" },
  { rank: 4, userId: 'u4', name: "Neha Singh",    score: 8500, studyStreak: 21, completedChapters: 65, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha" },
  { rank: 5, userId: 'u5', name: "Vikram Reddy",  score: 8100, studyStreak: 15, completedChapters: 60, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram" },
  { rank: 6, userId: 'u6', name: "Sneha Gupta",   score: 7800, studyStreak: 12, completedChapters: 55, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha" },
  { rank: 7, userId: 'u7', name: "Ravi Desai",    score: 7500, studyStreak: 10, completedChapters: 50, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi" },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"weekly" | "monthly" | "alltime">("weekly");
  const { data: leaderboardData, isLoading } = useLeaderboard(period);

  const entries = leaderboardData?.length ? leaderboardData : MOCK_ENTRIES;
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Hall of Fame</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Compete with the best minds preparing for SSC. Consistency and accuracy is the key to the top.
        </p>
      </div>

      <div className="flex justify-center">
        <Tabs defaultValue="weekly" onValueChange={(v) => setPeriod(v as any)} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3 bg-card border shadow-sm p-1 rounded-full h-12">
            <TabsTrigger value="weekly" className="rounded-full font-semibold">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-full font-semibold">Monthly</TabsTrigger>
            <TabsTrigger value="alltime" className="rounded-full font-semibold">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-8"><Skeleton className="h-64 w-full rounded-3xl" /><Skeleton className="h-[400px] w-full rounded-2xl" /></div>
      ) : (
        <>
          {/* Podium */}
          <div className="flex items-end justify-center gap-2 sm:gap-6 pt-10 pb-8 px-2 overflow-hidden">
            {/* Rank 2 */}
            {top3[1] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="relative mb-4">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-slate-300 shadow-xl z-10 relative">
                    <AvatarImage src={top3[1].avatarUrl || undefined} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xl">{top3[1].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 -right-2 bg-slate-100 border-2 border-slate-300 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-600 shadow-sm z-20">2</div>
                </div>
                <div className="text-center bg-card border border-slate-200 dark:border-slate-800 rounded-t-2xl w-24 sm:w-32 pt-4 pb-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                  <p className="font-bold text-sm sm:text-base truncate px-2">{top3[1].name.split(' ')[0]}</p>
                  <p className="text-slate-500 font-bold text-sm">{top3[1].score}</p>
                </div>
                <div className="w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-x border-slate-300 dark:border-slate-700"></div>
              </div>
            )}

            {/* Rank 1 */}
            {top3[0] && (
              <div className="flex flex-col items-center z-10 animate-in slide-in-from-bottom-12 duration-700">
                <Crown className="w-10 h-10 text-yellow-500 mb-2 drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }} />
                <div className="relative mb-4">
                  <Avatar className="w-20 h-20 sm:w-28 sm:h-28 border-4 border-yellow-400 shadow-2xl z-10 relative">
                    <AvatarImage src={top3[0].avatarUrl || undefined} />
                    <AvatarFallback className="bg-yellow-100 text-yellow-600 font-bold text-3xl">{top3[0].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 border-2 border-white text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md z-20">1</div>
                </div>
                <div className="text-center bg-card border border-yellow-200 dark:border-yellow-900/50 rounded-t-2xl w-28 sm:w-40 pt-5 pb-3 shadow-[0_-10px_40px_-15px_rgba(234,179,8,0.3)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-yellow-500/5"></div>
                  <p className="font-extrabold text-base sm:text-lg truncate px-2 relative z-10">{top3[0].name.split(' ')[0]}</p>
                  <p className="text-yellow-600 dark:text-yellow-500 font-black text-base relative z-10">{top3[0].score}</p>
                </div>
                <div className="w-28 sm:w-40 h-32 sm:h-44 bg-gradient-to-b from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-900/10 border-x border-yellow-200 dark:border-yellow-900/50 flex flex-col items-center justify-start pt-6">
                  <div className="flex items-center gap-1 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full text-xs font-bold text-yellow-700 dark:text-yellow-500">
                    <Flame className="w-3 h-3 fill-current" /> {top3[0].studyStreak}
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {top3[2] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-6 duration-700 delay-200">
                <div className="relative mb-4">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-amber-600 shadow-xl z-10 relative">
                    <AvatarImage src={top3[2].avatarUrl || undefined} />
                    <AvatarFallback className="bg-amber-100 text-amber-800 font-bold text-xl">{top3[2].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 -left-2 bg-amber-100 border-2 border-amber-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-amber-800 shadow-sm z-20">3</div>
                </div>
                <div className="text-center bg-card border border-amber-200 dark:border-amber-900/30 rounded-t-2xl w-24 sm:w-32 pt-4 pb-2">
                  <p className="font-bold text-sm sm:text-base truncate px-2">{top3[2].name.split(' ')[0]}</p>
                  <p className="text-amber-700 font-bold text-sm">{top3[2].score}</p>
                </div>
                <div className="w-24 sm:w-32 h-20 sm:h-24 bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 border-x border-amber-200 dark:border-amber-900/30"></div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 w-20 text-center">Rank</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-center hidden sm:table-cell">Streak</th>
                    <th className="px-6 py-4 text-center hidden md:table-cell">Chapters</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rest.map((entry) => {
                    const isCurrentUser = entry.userId === user?.id;
                    return (
                      <tr key={entry.userId} className={cn("transition-colors hover:bg-muted/30", isCurrentUser ? "bg-primary/5 hover:bg-primary/10" : "")}>
                        <td className="px-6 py-4 text-center"><span className="font-bold text-muted-foreground">{entry.rank}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={entry.avatarUrl || undefined} />
                              <AvatarFallback>{entry.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className={cn("font-semibold text-base", isCurrentUser ? "text-primary" : "text-foreground")}>
                              {entry.name} {isCurrentUser && "(You)"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center"><span className="font-bold bg-background border px-3 py-1 rounded-full shadow-sm">{entry.score}</span></td>
                        <td className="px-6 py-4 text-center hidden sm:table-cell">
                          <div className="flex items-center justify-center gap-1.5 text-muted-foreground font-medium">
                            <Flame className="w-4 h-4 text-orange-500" /> {entry.studyStreak}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center hidden md:table-cell">
                          <div className="flex items-center justify-center gap-1.5 text-muted-foreground font-medium">
                            <Shield className="w-4 h-4 text-blue-500" /> {entry.completedChapters}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
