import * as Icons from '@sargamdesign/icons-react/dist/line';
const SiTimer = Icons.SiClockAlt;
import Link from 'next/link';
import { Card } from '@repo/design/components/ui/card';
import { cn } from '@repo/design/lib/utils';

// Mock data - will be replaced with real data from API
const logDetail = {
  id: '1',
  date: 'Today',
  dateTime: '2025-08-15T10:30:00',
  summary: 'Implemented Linear design system with authentication',
  commits: 12,
  pullRequests: 2,
  reviews: 4,
  totalTime: '4h 32m',
  repositories: ['logs-xyz', 'arbor-xyz'],
  languages: ['TypeScript', 'CSS', 'MDX'],
  activities: [
    {
      type: 'commit',
      time: '10:30 AM',
      title: 'feat: add magic link authentication',
      subtitle: 'logs-xyz',
      status: 'success',
      link: 'https://github.com/user/logs-xyz/commit/abc123'
    },
    {
      type: 'pr',
      time: '11:45 AM',
      title: 'Implement Linear-style sidebar navigation',
      subtitle: 'PR #42 • logs-xyz',
      status: 'merged',
      link: 'https://github.com/user/logs-xyz/pull/42'
    },
    {
      type: 'review',
      time: '2:15 PM',
      title: 'Review: Update database schema',
      subtitle: 'arbor-xyz',
      status: 'approved',
      link: 'https://github.com/user/arbor-xyz/pull/38'
    },
    {
      type: 'commit',
      time: '3:30 PM',
      title: 'fix: resolve TypeScript errors in sidebar',
      subtitle: 'logs-xyz',
      status: 'success',
      link: 'https://github.com/user/logs-xyz/commit/def456'
    }
  ],
  insights: [
    'Most productive between 10 AM - 12 PM',
    'Focus on frontend implementation today',
    'Successfully integrated Linear design patterns'
  ]
};

function ActivityItem({ 
  icon: Icon, 
  title, 
  subtitle, 
  meta, 
  status,
  link 
}: { 
  icon: any;
  title: string;
  subtitle: string;
  meta: string;
  status?: 'success' | 'merged' | 'approved' | 'pending' | 'failed';
  link?: string;
}) {
  const statusIcon = {
    success: <Icons.SiCheckCircle className="h-3.5 w-3.5 text-green-600" />,
    merged: <Icons.SiPullRequest className="h-3.5 w-3.5 text-purple-600" />,
    approved: <Icons.SiCheckCircle className="h-3.5 w-3.5 text-blue-600" />,
    pending: <SiTimer className="h-3.5 w-3.5 text-yellow-600" />,
    failed: <Icons.SiCloseCircle className="h-3.5 w-3.5 text-red-600" />
  };

  const content = (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-md border border-transparent",
      "hover:border-border hover:bg-accent/30 transition-all duration-out-150 hover:duration-0",
      link && "cursor-pointer"
    )}>
      <div className="mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {status && statusIcon[status]}
            <span className="text-xs text-muted-foreground">{meta}</span>
            {link && <Icons.SiArrowUpward className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}

export default async function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/logs" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-out-150 hover:duration-0 mb-4"
        >
          <Icons.SiArrowLeft className="h-4 w-4" />
          back to logs
        </Link>
        
        <h1 className="text-2xl font-semibold mb-2">{logDetail.summary}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Icons.SiDashboard className="h-4 w-4" />
            <span>{logDetail.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icons.SiClock className="h-4 w-4" />
            <span>{logDetail.totalTime}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Card className="rounded-md border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">commits</p>
              <p className="text-2xl font-semibold mt-1">{logDetail.commits}</p>
            </div>
            <Icons.SiCodeMuted className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="rounded-md border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">pull requests</p>
              <p className="text-2xl font-semibold mt-1">{logDetail.pullRequests}</p>
            </div>
            <Icons.SiPullRequest className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="rounded-md border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">reviews</p>
              <p className="text-2xl font-semibold mt-1">{logDetail.reviews}</p>
            </div>
            <Icons.SiCode className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Repositories & Languages */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-muted-foreground">repositories:</span>
        {logDetail.repositories.map((repo) => (
          <span
            key={repo}
            className="px-2 py-0.5 text-xs rounded-md bg-accent/50 text-foreground font-mono"
          >
            {repo}
          </span>
        ))}
        <span className="text-xs text-muted-foreground ml-2">languages:</span>
        {logDetail.languages.map((lang) => (
          <span
            key={lang}
            className="px-2 py-0.5 text-xs rounded-md border border-border text-muted-foreground"
          >
            {lang}
          </span>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">activity timeline</h2>
        <Card className="rounded-md border-border/50 p-1">
          <div className="space-y-1">
            {logDetail.activities.map((activity, idx) => {
              const icons = {
                commit: Icons.SiCodeMuted,
                pr: Icons.SiPullRequest,
                review: Icons.SiCode
              };
              const Icon = icons[activity.type as keyof typeof icons];
              
              return (
                <ActivityItem
                  key={idx}
                  icon={Icon}
                  title={activity.title}
                  subtitle={activity.subtitle}
                  meta={activity.time}
                  status={activity.status as any}
                  link={activity.link}
                />
              );
            })}
          </div>
        </Card>
      </div>

      {/* Insights */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">insights</h2>
        <Card className="rounded-md border-border/50 p-4">
          <ul className="space-y-2">
            {logDetail.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{insight}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}