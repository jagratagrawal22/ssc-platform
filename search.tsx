import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSearch } from "@/lib/supabase-db";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, BookOpen, Target, Calculator, FileText, Layers, Loader2, ArrowRight } from "lucide-react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const { data, isLoading, isFetching } = useSearch(debouncedQuery);
  const results = data?.results || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subject': return <Layers className="w-5 h-5 text-indigo-500" />;
      case 'chapter': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'question': return <Target className="w-5 h-5 text-rose-500" />;
      case 'note': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'formula_sheet': return <Calculator className="w-5 h-5 text-amber-500" />;
      default: return <SearchIcon className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getHref = (type: string, id: number) => {
    switch (type) {
      case 'subject': return `/subjects/${id}`;
      case 'chapter': return `/chapters/${id}`;
      case 'note': return `/chapters/${id}?tab=notes`;
      case 'formula_sheet': return `/chapters/${id}?tab=formulas`;
      default: return `/`;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full min-h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">What do you want to learn today?</h1>
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {isFetching ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <SearchIcon className="w-6 h-6 text-muted-foreground" />}
          </div>
          <Input
            autoFocus type="search" placeholder="Search for chapters, formulas, questions..."
            className="w-full h-16 pl-14 pr-4 rounded-full text-lg shadow-lg border-2 border-primary/20 focus-visible:border-primary focus-visible:ring-primary/20 bg-card"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1">
        {query.length <= 2 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <SearchIcon className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold text-muted-foreground mb-2">Start typing to search</h3>
            <p className="text-sm text-muted-foreground max-w-sm">Search across all subjects, chapters, notes, and formula sheets.</p>
            <div className="mt-8 flex gap-2 flex-wrap justify-center max-w-md">
              <span className="text-xs text-muted-foreground w-full mb-2">Popular Searches:</span>
              {['Percentage', 'Number System', 'Geometry Formulas', 'Synonyms', 'Static GK'].map(term => (
                <Badge key={term} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1 text-sm font-normal"
                  onClick={() => setQuery(term)}>
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed shadow-sm">
            <SearchIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No results found for "{query}"</h3>
            <p className="text-muted-foreground">Check your spelling or try broader terms.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-muted-foreground mb-4 px-2">Found {data?.total} results</h3>
            {results.map((result, index) => (
              <Link key={`${result.type}-${result.id}-${index}`} href={getHref(result.type, result.id)}>
                <Card className="border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group bg-card">
                  <CardContent className="p-4 sm:p-5 flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex flex-col items-center justify-center shrink-0 border shadow-sm group-hover:bg-primary/5 transition-colors">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold bg-background shadow-sm py-0 h-5">
                          {result.type.replace('_', ' ')}
                        </Badge>
                        {result.subjectName && <span className="text-xs text-muted-foreground font-medium truncate">• {result.subjectName}</span>}
                      </div>
                      <h4 className="font-bold text-foreground text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-1">{result.title}</h4>
                      {result.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{result.description}</p>}
                    </div>
                    <div className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground text-muted-foreground transition-colors shrink-0">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
