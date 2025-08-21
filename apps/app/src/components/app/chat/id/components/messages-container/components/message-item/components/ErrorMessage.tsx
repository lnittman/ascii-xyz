interface ErrorMessageProps {
  content: any;
}

export function ErrorMessage({ content }: ErrorMessageProps) {
  return (
    <div className="px-6 py-3 text-destructive">
      error: {content.error || 'an unknown error occurred'}
    </div>
  );
}
