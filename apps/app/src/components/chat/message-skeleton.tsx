export function MessageSkeleton() {
  return (
    <div className="flex animate-pulse gap-3 p-4">
      <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

export function ChatListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse p-3">
          <div className="mb-2 h-4 w-2/3 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted opacity-60" />
        </div>
      ))}
    </div>
  );
}

export function ChatContentSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4">
      <MessageSkeleton />
      <div className="flex animate-pulse gap-3 p-4">
        <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      </div>
      <MessageSkeleton />
    </div>
  );
}
