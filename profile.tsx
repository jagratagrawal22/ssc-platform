import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, BookOpen, Target, LogOut, Award, Calendar, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-20">
      <h1 className="text-3xl font-bold text-foreground">My Profile</h1>

      <Card className="border-0 shadow-xl bg-card overflow-hidden rounded-3xl relative">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-primary absolute top-0 left-0 right-0 z-0"></div>
        <CardContent className="p-6 pt-16 md:p-10 md:pt-20 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          <Avatar className="w-32 h-32 border-4 border-card shadow-2xl">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-4xl font-bold bg-muted">
              {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-foreground mb-1">{profile?.name || "Student"}</h2>
            <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
              {user?.email}
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-0 text-[10px] uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3 mr-1"/> Verified
              </Badge>
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge variant="outline" className="bg-background shadow-sm border-primary/20 text-primary px-3 py-1 text-sm font-semibold">
                Target: {profile?.exam_target || "SSC CGL"}
              </Badge>
              <Badge variant="outline" className="bg-background shadow-sm px-3 py-1 text-sm font-semibold">
                Joined {new Date(profile?.joined_at || user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Badge>
              {profile?.role === 'admin' && (
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-semibold">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <h3 className="text-xl font-bold mt-10 mb-4 px-2">Preparation Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox icon={Flame} title="Study Streak" value={`${profile?.study_streak || 0} Days`} color="text-orange-500" bg="bg-orange-500/10" />
        <StatBox icon={Clock} title="Total Hours" value={`${Math.floor((profile?.total_study_minutes || 0)/60)} hrs`} color="text-blue-500" bg="bg-blue-500/10" />
        <StatBox icon={BookOpen} title="Chapters" value={`${profile?.completed_chapters || 0} Done`} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatBox icon={Target} title="Accuracy" value="—" color="text-purple-500" bg="bg-purple-500/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="border-0 shadow-lg bg-card rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" /> Achievement Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20 mb-2 border-2 border-white">
                  <Flame className="w-8 h-8 fill-current" />
                </div>
                <span className="text-xs font-bold">7 Day Streak</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-2 border-2 border-white">
                  <Target className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold">First Login</span>
              </div>
              <div className="flex flex-col items-center text-center opacity-50 grayscale">
                <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 mb-2">
                  <BookOpen className="w-8 h-8" />
                </div>
                <span className="text-xs font-medium">Maths Master</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Activity Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-center h-[160px]">
            <div className="grid grid-cols-12 gap-1.5 opacity-80">
              {Array.from({length: 48}).map((_, i) => {
                const intensity = Math.floor(Math.random() * 4);
                const bgColors = ['bg-slate-100 dark:bg-slate-800', 'bg-primary/30', 'bg-primary/60', 'bg-primary'];
                return <div key={i} className={`w-4 h-4 rounded-sm ${bgColors[intensity]}`}></div>;
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-12">
        <Button variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-8 rounded-full" onClick={() => signOut()}>
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, title, value, color, bg }: any) {
  return (
    <Card className="border-0 shadow-sm bg-card overflow-hidden group hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex flex-col items-center text-center relative">
        <div className={`absolute top-0 right-0 w-16 h-16 ${bg} rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
        <div className={`p-3 rounded-full ${bg} ${color} mb-3 shadow-sm relative z-10`}><Icon className="w-6 h-6" /></div>
        <p className="text-2xl font-black mb-1">{value}</p>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      </CardContent>
    </Card>
  );
}
