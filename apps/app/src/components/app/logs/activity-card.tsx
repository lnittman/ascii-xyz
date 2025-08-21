import { Card } from '@repo/design/components/ui/card';
import type { ActivityDetail } from '@/lib/db';

interface ActivityCardProps {
  activity: ActivityDetail;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card className="rounded-none border-border/50 p-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium">{activity.type}</h3>
          <span className="text-xs text-muted-foreground">{activity.time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
        {activity.metadata && (
          <pre className="text-xs font-mono bg-muted p-2 overflow-x-auto">
            {JSON.stringify(activity.metadata, null, 2)}
          </pre>
        )}
      </div>
    </Card>
  );
}