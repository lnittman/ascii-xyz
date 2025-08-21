'use client';

import * as Icons from '@sargamdesign/icons-react/dist/line';
import Link from 'next/link';

const logs = [
  {
    id: '1',
    date: 'Today',
    summary: 'Implemented Linear design system with authentication',
    commits: 12,
    pullRequests: 2,
    reviews: 4,
    repositories: ['logs-xyz', 'arbor-xyz'],
    highlights: [
      'Added magic link authentication',
      'Implemented responsive sidebar navigation',
      'Applied Linear design patterns throughout'
    ]
  },
  {
    id: '2',
    date: 'Yesterday',
    summary: 'Worked on AI service integration and database schema',
    commits: 8,
    pullRequests: 1,
    reviews: 3,
    repositories: ['logs-xyz'],
    highlights: [
      'Set up Mastra AI service',
      'Created activity log schema',
      'Integrated PostgreSQL with pgvector'
    ]
  },
  {
    id: '3',
    date: 'Dec 15, 2024',
    summary: 'Initial project setup and configuration',
    commits: 15,
    pullRequests: 3,
    reviews: 2,
    repositories: ['logs-xyz', 'halo-system'],
    highlights: [
      'Initialized turborepo structure',
      'Configured Cloudflare Workers',
      'Set up authentication with Clerk'
    ]
  }
];

export default function LogsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">activity logs</h1>
        <p className="text-sm text-muted-foreground">
          comprehensive overview of your development activity
        </p>
      </div>

      <div className="space-y-1">
        {logs.map((log) => (
          <Link
            key={log.id}
            href={`/logs/${log.id}`}
            className="block group"
          >
            <div className="p-4 rounded-md border border-transparent hover:border-border hover:bg-accent/30 transition-all duration-out-150 hover:duration-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{log.date}</div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-out-150 hover:duration-0">
                    {log.summary}
                  </h3>
                </div>
                <Icons.SiArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-out-150 hover:duration-0" />
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <Icons.SiCodeMuted className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{log.commits} commits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.SiPullRequest className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{log.pullRequests} PRs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.SiCode className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{log.reviews} reviews</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {log.repositories.map((repo) => (
                  <span
                    key={repo}
                    className="px-2 py-0.5 text-xs rounded-md bg-accent/50 text-muted-foreground"
                  >
                    {repo}
                  </span>
                ))}
              </div>

              <div className="space-y-1">
                {log.highlights.slice(0, 2).map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/50 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground line-clamp-1">{highlight}</span>
                  </div>
                ))}
                {log.highlights.length > 2 && (
                  <span className="text-xs text-muted-foreground/70 pl-3">
                    +{log.highlights.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}