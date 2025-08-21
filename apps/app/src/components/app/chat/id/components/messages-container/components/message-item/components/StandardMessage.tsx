import { ContextSection } from './ContextSection';
import { UserMessage } from './UserMessage';
import { SystemMessage } from './system-message';

interface StandardMessageProps {
  content: any;
  userInitials: string;
  onDownload: (content: string, title: string) => void;
}

export function StandardMessage({
  content,
  userInitials,
  onDownload,
}: StandardMessageProps) {
  // Validate content structure
  if (!content) {
    return <div className="text-destructive">error: empty content</div>;
  }

  // Check if question and response exist
  const hasQuestion = !!content.question;
  const hasResponse = content.response !== undefined;

  if (!hasQuestion && !hasResponse) {
    return (
      <div className="text-destructive">
        error: invalid content structure
        <pre className="mt-2 text-xs">{JSON.stringify(content, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div>
      {hasQuestion && <UserMessage content={content.question} />}

      <SystemMessage content={content.response} onDownload={onDownload} />

      {content.sourceUrl && <ContextSection sourceUrl={content.sourceUrl} />}
    </div>
  );
}
