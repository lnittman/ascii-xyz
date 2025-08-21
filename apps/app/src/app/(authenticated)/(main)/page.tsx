'use client';

import { Heart, Archive, Activity } from 'iconoir-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@repo/design/lib/utils';
import { useRouter } from 'next/navigation';

// Mock data generator for infinite scroll demo
const generateMockLogs = (page: number) => {
  const logs = [];
  const baseDate = new Date();
  const startIdx = page * 10;
  
  for (let i = 0; i < 10; i++) {
    const idx = startIdx + i;
    const date = new Date(baseDate);
    date.setDate(date.getDate() - idx);
    
    logs.push({
      id: `log-${idx}`,
      date,
      repos: ['arbor-xyz', 'logs-xyz', 'webs-xyz'].slice(0, Math.floor(Math.random() * 3) + 1),
      commits: Math.floor(Math.random() * 50) + 10,
      pullRequests: Math.floor(Math.random() * 5),
      issues: Math.floor(Math.random() * 3),
      summary: [
        'Focused on implementing the logs turborepo structure and Mastra workflows.',
        'Major refactoring of the web analysis system and iOS app updates.',
        'Settings UI improvements and runtime context implementation.',
        'Enhanced authentication flow with magic links and Clerk integration.',
        'Optimized database queries and added pgvector support for embeddings.',
      ][i % 5],
    });
  }
  
  return logs;
};

export default function LogsHomePage() {
  const [logs, setLogs] = useState(generateMockLogs(0));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const loadMoreLogs = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newLogs = generateMockLogs(page);
    if (page >= 5) { // Stop after 5 pages for demo
      setHasMore(false);
    }
    
    setLogs(prev => [...prev, ...newLogs]);
    setPage(prev => prev + 1);
    setLoading(false);
  }, [page, loading, hasMore]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreLogs();
        }
      },
      { threshold: 0.1 }
    );
    
    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreLogs]);

  return (
    <div className="h-full">
      {/* Logs List */}
      <div className="">
        {logs.length > 0 ? (
          <div className="">
            {logs.map((log, index) => (
              <Link key={log.id} href={`/logs/${log.id}`} className="block">
                <div className={cn(
                  "border-b border-border px-4 sm:px-6 lg:px-8 py-4 transition-none duration-0",
                  "hover:bg-accent/50",
                  index === 0 && "border-t border-border"
                )}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-medium text-foreground">
                        {format(log.date, 'EEEE, MMM d')}
                      </h3>
                      <div className="flex gap-2">
                        {log.repos.slice(0, 2).map((repo) => (
                          <span
                            key={repo}
                            className="rounded-md bg-accent px-2 py-0.5 text-xs font-mono text-muted-foreground"
                          >
                            {repo}
                          </span>
                        ))}
                        {log.repos.length > 2 && (
                          <span className="rounded-md bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                            +{log.repos.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {log.summary}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {log.commits} commits
                      </span>
                      <span>{log.pullRequests} PRs</span>
                      {log.issues > 0 && <span>{log.issues} issues</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="h-10" />
            
            {/* Loading indicator for infinite scroll */}
            {loading && (
              <div className="flex h-20 items-center justify-center">
                <p className="text-xs text-muted-foreground">loading more...</p>
              </div>
            )}
            
            {/* End of list indicator */}
            {!hasMore && logs.length > 0 && (
              <div className="flex h-20 items-center justify-center">
                <p className="text-xs text-muted-foreground">you've reached the beginning</p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="border border-border rounded-md p-8">
              <div className="text-center">
              <Activity className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="mt-3 text-sm font-medium">no activity logs yet</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                logs will appear here once your repositories are connected
              </p>
              <Link 
                href="/settings" 
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline transition-none duration-0"
              >
                configure repositories →
              </Link>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}