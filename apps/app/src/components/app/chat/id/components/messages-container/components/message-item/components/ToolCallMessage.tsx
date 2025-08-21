interface ToolCallMessageProps {
  content: any;
  onCommand?: (command: string) => void;
}

export function ToolCallMessage({ content, onCommand }: ToolCallMessageProps) {
  // For simplicity, we'll just show the tool call as a message
  return (
    <div className="px-6 py-2">
      <div className="ml-12 text-muted-foreground text-sm">
        <span className="italic">
          Tool call: {content.tool || 'Unknown tool'}
        </span>
        {content.isExecutable && onCommand && (
          <button
            className="ml-2 text-primary hover:underline"
            onClick={() => onCommand(content.command)}
          >
            Execute
          </button>
        )}
      </div>
    </div>
  );
}
