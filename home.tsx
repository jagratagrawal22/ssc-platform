import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  BookOpen, Calculator, Target, BarChart3, 
  Moon, CheckCircle2, ChevronRight, GraduationCap, 
  Users, TrendingUp, NotebookTabs, ClipboardList
} from "lucide-react";

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Header */}
      <header className="absolute top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg">
            S
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">SSC Jagrat</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/sign-in" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Sign In</Link>
          <Link href="/sign-up">
            <Button className="rounded-full shadow-lg hover:shadow-xl transition-all">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/15 blur-[120px] animate-pulse pointer-events-none animation-delay-2000" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              India's Most Advanced SSC Platform
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-balance leading-tight">
              Master SSC CGL & CHSL with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Smart Preparation</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop guessing. Start cracking. Get highly structured study material, chapter-wise practice, previous year questions, and AI-driven insights to boost your rank.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full text-base h-14 px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                  Start Learning Now <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            {[
              { label: "Total Chapters", value: "120+", icon: NotebookTabs },
              { label: "Practice Qs", value: "15,000+", icon: Target },
              { label: "Mock Tests", value: "50+", icon: ClipboardList },
              { label: "Active Students", value: "10k+", icon: Users }
            ].map((stat, i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border rounded-2xl p-6 text-center shadow-sm">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <stat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Crack It</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We've deconstructed the syllabus into actionable chunks. No overwhelming PDFs, just focused learning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { title: "Complete Notes", desc: "Crisp, exam-oriented notes for every chapter.", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
              { title: "Formula Sheets", desc: "Quick revision sheets for Maths & Reasoning.", icon: Calculator, color: "text-amber-500", bg: "bg-amber-500/10" },
              { title: "Chapter Practice", desc: "Topic-wise questions graded by difficulty.", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { title: "PYQs", desc: "Last 5 years papers solved and categorized.", icon: Target, color: "text-rose-500", bg: "bg-rose-500/10" },
              { title: "Mock Tests", full: true, desc: "Full length TCS-pattern mock tests.", icon: ClipboardList, color: "text-indigo-500", bg: "bg-indigo-500/10" },
              { title: "Analytics", desc: "Know your weak areas automatically.", icon: BarChart3, color: "text-cyan-500", bg: "bg-cyan-500/10" },
              { title: "Bookmarks", desc: "Save tough questions for revision.", icon: Bookmark, color: "text-purple-500", bg: "bg-purple-500/10" },
              { title: "Dark Mode", desc: "Easy on the eyes for late-night study.", icon: Moon, color: "text-slate-500", bg: "bg-slate-500/10" },
            ].map((feat, i) => (
              <div key={i} className={`bg-card border rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 ${feat.full ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.bg} ${feat.color}`}>
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                <p className="text-muted-foreground">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className="font-bold text-xl">SSC Jagrat</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} SSC With Jagrat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Missing Bookmark icon import above, defining here for quick fix
function Bookmark(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
}