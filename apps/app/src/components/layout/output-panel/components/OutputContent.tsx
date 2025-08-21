'use client';
import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { cn } from '@repo/design/lib/utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface OutputContentProps {
  output: {
    id: string;
    title: string;
    type: string;
    messageId: string;
    createdAt: Date;
    isPinned: boolean;
    content?: string;
    metadata?: Record<string, any>;
    isStreaming?: boolean;
  };
}

// Custom styles for the output content
const customStyles = `
  .output-content-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .output-content-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export function OutputContent({ output }: OutputContentProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="flex h-full flex-col overflow-hidden px-4 py-4">
        {/* Output header */}
        <h3 className="mb-1 truncate font-medium text-foreground">
          {output.title}
        </h3>
        <div className="mb-4 flex items-center gap-2 text-muted-foreground text-xs">
          <span
            className={cn(
              'rounded-none px-2 py-0.5 font-medium',
              output.type === 'code' && 'bg-primary/10 text-primary',
              output.type === 'document' &&
                'bg-blue-500/10 text-blue-600 dark:text-blue-400',
              output.type === 'markdown' &&
                'bg-purple-500/10 text-purple-600 dark:text-purple-400',
              output.type === 'html' &&
                'bg-orange-500/10 text-orange-600 dark:text-orange-400',
              output.type === 'json' &&
                'bg-green-500/10 text-green-600 dark:text-green-400',
              output.type === 'text' && 'bg-muted/50 text-foreground',
              output.type === 'diagram' &&
                'bg-pink-500/10 text-pink-600 dark:text-pink-400',
              output.type === 'table' &&
                'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
            )}
          >
            {output.type}
          </span>
          {output.isPinned && <span className="text-primary">pinned</span>}
          {output.isStreaming && (
            <span className="animate-pulse">streaming...</span>
          )}
        </div>

        {/* Content area with gradients */}
        <RelativeScrollFadeContainer
          className="flex-1"
          fadeColor="var(--sidebar)"
        >
          <div className="px-0.5 pb-6">
            <div className="prose prose-sm dark:prose-invert prose-blockquote:my-1.5 prose-li:my-0.5 prose-ol:my-1.5 prose-p:my-3 prose-pre:my-4 prose-table:my-4 prose-ul:my-1.5 prose-h1:mt-6 prose-h2:mt-5 prose-h3:mt-4 prose-h1:mb-4 prose-h2:mb-3 prose-h3:mb-2 max-w-none prose-ol:list-decimal prose-ul:list-disc prose-code:rounded-sm prose-td:border prose-th:border prose-blockquote:border-border prose-td:border-border prose-th:border-border prose-blockquote:border-l-2 prose-code:bg-muted/30 prose-pre:bg-transparent prose-th:bg-muted/30 prose-pre:p-0 prose-code:px-1.5 prose-td:px-3 prose-th:px-3 prose-code:py-0.5 prose-td:py-2 prose-th:py-2 prose-blockquote:pl-3 prose-ol:pl-5 prose-ul:pl-5 prose-code:font-mono prose-headings:font-medium prose-a:text-primary prose-blockquote:text-muted-foreground prose-blockquote:text-xs prose-code:text-foreground prose-code:text-xs prose-em:text-foreground prose-h1:text-foreground prose-h1:text-xl prose-h2:text-foreground prose-h2:text-lg prose-h3:text-base prose-h3:text-foreground prose-headings:text-foreground prose-li:text-foreground prose-ol:text-foreground prose-ol:text-xs prose-p:text-foreground prose-p:text-sm prose-strong:text-foreground prose-td:text-foreground prose-td:text-xs prose-th:text-foreground prose-th:text-xs prose-ul:text-foreground prose-ul:text-xs prose-blockquote:italic prose-a:no-underline hover:prose-a:underline">
              {output.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // Custom component overrides for better styling
                    pre: ({ children, ...props }) => (
                      <pre
                        className="my-2 overflow-x-auto rounded-none bg-muted/40 p-3 font-mono text-xs"
                        {...props}
                      >
                        {children}
                      </pre>
                    ),
                    code: ({ className, children, ...props }) => {
                      // Inline code
                      const isInline = !className?.includes('language-');
                      if (isInline) {
                        return (
                          <code
                            className="rounded-sm bg-muted/30 px-1 font-mono text-xs"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      // Code blocks
                      return (
                        <code
                          className={cn('font-mono text-xs', className)}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    a: ({ children, href, ...props }) => (
                      <a
                        href={href}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {output.content}
                </ReactMarkdown>
              ) : (
                // Loading state
                <div className="space-y-2">
                  <div className="h-4 animate-pulse rounded bg-muted/50" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted/50" />
                  <div className="mt-4 h-32 animate-pulse rounded bg-muted/50" />
                </div>
              )}
            </div>
          </div>
        </RelativeScrollFadeContainer>

        {/* Timestamp */}
        <div className="border-border border-t pt-4 text-muted-foreground text-xs">
          created {new Date(output.createdAt).toLocaleString()}
        </div>
      </div>
    </>
  );
}
