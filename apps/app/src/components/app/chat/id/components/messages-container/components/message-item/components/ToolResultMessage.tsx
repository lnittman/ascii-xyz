interface ToolResultMessageProps {
  content: any;
}

export function ToolResultMessage({ content }: ToolResultMessageProps) {
  return (
    <div className="px-6 py-2">
      <div className="ml-12 text-sm">
        <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-xs">
          {typeof content.result === 'object'
            ? JSON.stringify(content.result, null, 2)
            : content.result}
        </pre>
      </div>
    </div>
  );
}
