interface PendingMessageProps {
  content: any;
}

export function PendingMessage({ content }: PendingMessageProps) {
  return (
    <div className="px-6 py-3">
      <div className="ml-12 text-muted-foreground text-sm">
        <span className="italic">Thinking...</span>
      </div>
    </div>
  );
}
