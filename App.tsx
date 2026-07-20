import { ReactNode } from "react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

// Pages
import HomePage from "./pages/public/home";
import SignInPage from "./pages/public/sign-in";
import SignUpPage from "./pages/public/sign-up";
import ResetPasswordPage from "./pages/public/reset-password";
import UpdatePasswordPage from "./pages/public/update-password";
import DashboardPage from "./pages/authenticated/dashboard";
import SubjectsPage from "./pages/authenticated/subjects";
import SubjectDetailPage from "./pages/authenticated/subject-detail";
import ChapterDetailPage from "./pages/authenticated/chapter-detail";
import PracticePage from "./pages/authenticated/practice";
import MockTestsPage from "./pages/authenticated/mock-tests";
import MockTestDetailPage from "./pages/authenticated/mock-test-detail";
import MockTestResultPage from "./pages/authenticated/mock-test-result";
import FormulaSheetsPage from "./pages/authenticated/formula-sheets";
import LeaderboardPage from "./pages/authenticated/leaderboard";
import SearchPage from "./pages/authenticated/search";
import ProfilePage from "./pages/authenticated/profile";
import AdminDashboardPage from "./pages/authenticated/admin";
import AdminSubjectsPage from "./pages/authenticated/admin/subjects";
import AdminChaptersPage from "./pages/authenticated/admin/chapters";
import AdminNotesPage from "./pages/authenticated/admin/notes";
import AdminFormulaSheetsPage from "./pages/authenticated/admin/formula-sheets";
import AdminQuestionsPage from "./pages/authenticated/admin/questions";
import AdminMockTestsPage from "./pages/authenticated/admin/mock-tests";
import AdminAnnouncementsPage from "./pages/authenticated/admin/announcements";
import NotFound from '@/pages/not-found';
import { Navbar } from "./components/layout/navbar";
import { Sidebar } from "./components/layout/sidebar";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background flex-col md:flex-row">
      <div className="md:hidden"><Navbar /></div>
      <div className="hidden md:flex"><Sidebar /></div>
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 overflow-y-auto">
        <div className="hidden md:flex h-16 border-b items-center px-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <Navbar desktop />
        </div>
        {children}
      </main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background/90 backdrop-blur-md z-50 flex items-center justify-around px-4">
        <Navbar mobileBottom />
      </div>
    </div>
  );
}

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Redirect to="/sign-in" />;
  return <AuthenticatedLayout><Component /></AuthenticatedLayout>;
}

function HomeRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (user) return <Redirect to="/dashboard" />;
  return <HomePage />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/update-password" component={UpdatePasswordPage} />

      <Route path="/dashboard"><AuthenticatedRoute component={DashboardPage} /></Route>
      <Route path="/subjects"><AuthenticatedRoute component={SubjectsPage} /></Route>
      <Route path="/subjects/:subjectId"><AuthenticatedRoute component={SubjectDetailPage} /></Route>
      <Route path="/chapters/:chapterId"><AuthenticatedRoute component={ChapterDetailPage} /></Route>
      <Route path="/practice/:chapterId"><AuthenticatedRoute component={PracticePage} /></Route>
      <Route path="/mock-tests"><AuthenticatedRoute component={MockTestsPage} /></Route>
      <Route path="/mock-tests/:mockTestId"><AuthenticatedRoute component={MockTestDetailPage} /></Route>
      <Route path="/mock-tests/:mockTestId/result"><AuthenticatedRoute component={MockTestResultPage} /></Route>
      <Route path="/formula-sheets"><AuthenticatedRoute component={FormulaSheetsPage} /></Route>
      <Route path="/leaderboard"><AuthenticatedRoute component={LeaderboardPage} /></Route>
      <Route path="/search"><AuthenticatedRoute component={SearchPage} /></Route>
      <Route path="/profile"><AuthenticatedRoute component={ProfilePage} /></Route>
      <Route path="/admin"><AuthenticatedRoute component={AdminDashboardPage} /></Route>
      <Route path="/admin/subjects"><AuthenticatedRoute component={AdminSubjectsPage} /></Route>
      <Route path="/admin/chapters"><AuthenticatedRoute component={AdminChaptersPage} /></Route>
      <Route path="/admin/notes"><AuthenticatedRoute component={AdminNotesPage} /></Route>
      <Route path="/admin/formula-sheets"><AuthenticatedRoute component={AdminFormulaSheetsPage} /></Route>
      <Route path="/admin/questions"><AuthenticatedRoute component={AdminQuestionsPage} /></Route>
      <Route path="/admin/mock-tests"><AuthenticatedRoute component={AdminMockTestsPage} /></Route>
      <Route path="/admin/announcements"><AuthenticatedRoute component={AdminAnnouncementsPage} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
