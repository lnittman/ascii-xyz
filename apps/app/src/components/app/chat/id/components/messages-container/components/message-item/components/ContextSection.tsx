interface ContextSectionProps {
  sourceUrl: string;
}

export function ContextSection({ sourceUrl }: ContextSectionProps) {
  if (!sourceUrl) {
    return null;
  }

  return (
    <div className="mt-4 ml-12 rounded-md border border-border/40 bg-muted/30 p-3">
      <p className="mb-2 font-medium text-foreground text-sm">Context</p>
      <a
        href={sourceUrl}
        className="text-muted-foreground text-xs transition-colors hover:text-foreground hover:underline"
        target="_blank"
        rel="noreferrer"
      >
        {sourceUrl}
      </a>
    </div>
  );
}
