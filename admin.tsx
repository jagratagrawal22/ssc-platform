import { useAdminStats, useAdminUsers } from "@/lib/supabase-db";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Target, FileText, ClipboardList, PlusCircle, Activity, Megaphone, Sigma } from "lucide-react";
import { Redirect, useLocation } from "wouter";

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();

  const { data: analytics, isLoading: analyticsLoading } = useAdminStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers(10);

  if (!isAdmin) return <Redirect to="/dashboard" />;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Console</h1>
          <p className="text-muted-foreground mt-1">Platform overview and management.</p>
        </div>
        <div className="flex gap-2">
          <Button className="rounded-full shadow-sm bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/admin/subjects')} data-testid="button-add-subject">
            <PlusCircle className="w-4 h-4 mr-2" /> Add Subject
          </Button>
          <Button variant="outline" className="rounded-full shadow-sm" onClick={() => navigate('/admin/mock-tests')} data-testid="button-create-mock-test">
            <PlusCircle className="w-4 h-4 mr-2" /> Create Mock Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {analyticsLoading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />) : (
          <>
            <StatCard icon={Users}       title="Users"         value={analytics?.totalUsers || 0} />
            <StatCard icon={Activity}    title="Active Today"  value={analytics?.activeUsersToday || 0} />
            <StatCard icon={BookOpen}    title="Subjects"      value={analytics?.totalSubjects || 0} />
            <StatCard icon={FileText}    title="Chapters"      value={analytics?.totalChapters || 0} />
            <StatCard icon={Target}      title="Questions"     value={analytics?.totalQuestions || 0} />
            <StatCard icon={ClipboardList} title="Mock Tests"  value={analytics?.totalMockTests || 0} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <Card className="lg:col-span-2 border-0 shadow-lg bg-card rounded-2xl">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {usersLoading ? (
              <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/10 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {usersData?.users?.map(u => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{u.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={u.role === 'admin' ? "default" : "secondary"}>{u.role}</Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(u.joinedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card rounded-2xl">
          <CardHeader className="border-b bg-muted/20"><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="p-6 flex flex-col gap-3">
            <Button variant="outline" className="justify-start h-12 text-left font-medium hover:text-primary hover:bg-primary/5 hover:border-primary/50" onClick={() => navigate('/admin/subjects')} data-testid="link-manage-subjects">
              <BookOpen className="w-5 h-5 mr-3 text-primary" /> Manage Subjects
            </Button>
            <Button variant="outline" className="justify-start h-12 text-left font-medium hover:text-primary hover:bg-primary/5 hover:border-primary/50" onClick={() => navigate('/admin/chapters')} data-testid="link-manage-chapters">
              <FileText className="w-5 h-5 mr-3 text-secondary" /> Manage Chapters
            </Button>
            <Button variant="outline" className="justify-start h-12 text-left font-medium hover:text-primary hover:bg-primary/5 hover:border-primary/50" onClick={() => navigate('/admin/notes')} data-testid="link-manage-notes">
              <FileText className="w-5 h-5 mr-3 text-emerald-500" /> Manage Notes
            </Button>
            <Button variant="outline" className="justify-start h-12 text-left font-medium hover:text-primary hover:bg-primary/5 hover:border-primary/50" onClick={() => navigate('/admin/formula-sheets')} data-testid="link-manage-formula-sheets">
              <Sigma className="w-5 h-5 mr-3 text-amber-500" /> Manage Formula Sheets
            </Button>
            <Button variant="outline" className="justify-start h-12 text-left font-medium hover:text-primary hover:bg-primary/5 hover:border-primary/50" onClick={() => navigate('/admin/questions')} data-testid="link-manage-questions">
              <Target className="w-5 h-5 mr-3 text-rose-500" /> Question Bank
            </Button>
            <Button variant="outline" className="justify-start h-12 text-left font-medium hover:text-primary hover:bg-primary/5 hover:border-primary/50" onClick={() => navigate('/admin/mock-tests')} data-testid="link-manage-mock-tests">
              <ClipboardList className="w-5 h-5 mr-3 text-indigo-500" /> Mock Test Builder
            </Button>
            <Button variant="outline" className="justify-start h-12 text-left font-medium hover:text-primary hover:bg-primary/5 hover:border-primary/50" onClick={() => navigate('/admin/announcements')} data-testid="link-manage-announcements">
              <Megaphone className="w-5 h-5 mr-3 text-sky-500" /> Announcements
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value }: any) {
  return (
    <Card className="border-0 shadow-sm bg-card rounded-2xl">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
        <div className="bg-primary/10 p-3 rounded-full mb-3 text-primary"><Icon className="w-6 h-6" /></div>
        <div className="text-2xl font-black text-foreground">{value}</div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</div>
      </CardContent>
    </Card>
  );
}
