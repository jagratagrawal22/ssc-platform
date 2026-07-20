import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home, BookOpen, Layers, Target, ClipboardList,
  Award, Search, Settings, ShieldCheck, LogOut, Menu
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();

  const navItems = [
    { label: "Dashboard",      href: "/dashboard",      icon: Home },
    { label: "Subjects",       href: "/subjects",        icon: BookOpen },
    { label: "Mock Tests",     href: "/mock-tests",      icon: Target },
    { label: "Formula Sheets", href: "/formula-sheets",  icon: Layers },
    { label: "Leaderboard",    href: "/leaderboard",     icon: Award },
    { label: "Search",         href: "/search",          icon: Search },
    { label: "Profile",        href: "/profile",         icon: Settings },
  ];
  if (isAdmin) navItems.push({ label: "Admin", href: "/admin", icon: ShieldCheck });

  return (
    <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col pt-6">
      <div className="px-6 mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">S</div>
          <span className="font-bold text-xl tracking-tight text-primary">SSC Jagrat</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xs font-bold">
              {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{profile?.name || "Student"}</p>
            <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => signOut()}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function Navbar({ desktop, mobileBottom }: { desktop?: boolean; mobileBottom?: boolean }) {
  const [location] = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();

  if (desktop) {
    return (
      <header className="flex-1 flex items-center justify-end w-full gap-4">
        <Link href="/search">
          <Button variant="ghost" size="icon" className="rounded-full"><Search className="h-5 w-5" /></Button>
        </Link>
        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="text-xs font-bold">
            {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </header>
    );
  }

  if (mobileBottom) {
    const bottomNav = [
      { label: "Home",    href: "/dashboard",  icon: Home },
      { label: "Learn",   href: "/subjects",   icon: BookOpen },
      { label: "Test",    href: "/mock-tests",  icon: Target },
      { label: "Profile", href: "/profile",    icon: Settings },
    ];
    return (
      <>
        {bottomNav.map(item => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </>
    );
  }

  // Mobile Top Navbar
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-20">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">S</div>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/search">
          <Button variant="ghost" size="icon" className="rounded-full"><Search className="h-5 w-5" /></Button>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col w-[280px]">
            <div className="mb-6 mt-4">
              <span className="font-bold text-xl text-primary">SSC Jagrat</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-3 bg-muted/30 rounded-xl mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{profile?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{profile?.name || "Student"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <nav className="flex-1 space-y-1">
              {[
                { href: "/dashboard", icon: Home, label: "Dashboard" },
                { href: "/subjects", icon: BookOpen, label: "Subjects" },
                { href: "/mock-tests", icon: Target, label: "Mock Tests" },
                { href: "/formula-sheets", icon: Layers, label: "Formula Sheets" },
                { href: "/leaderboard", icon: Award, label: "Leaderboard" },
                ...(isAdmin ? [{ href: "/admin", icon: ShieldCheck, label: "Admin" }] : []),
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted text-foreground">
                  <item.icon className="h-5 w-5" /> <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => signOut()}>
                <LogOut className="h-5 w-5 mr-3" /> Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
