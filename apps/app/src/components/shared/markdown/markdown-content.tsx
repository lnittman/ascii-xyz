'use client';

import Markdown from 'markdown-to-jsx';
import React from 'react';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  // Custom component overrides for markdown-to-jsx
  const markdownOptions = {
    overrides: {
      pre: {
        component: ({ children, ...props }: any) => {
          // Safer type checking for tool call content
          let isToolCall = false;
          try {
            if (React.isValidElement(children)) {
              const childrenProps = children.props as any;
              const childrenText = childrenProps?.children;

              isToolCall =
                typeof childrenText === 'string' &&
                (childrenText.includes('tool') ||
                  childrenText.includes('json'));
            }
          } catch (_e) {
            // Ignore errors in type checking
          }

          return (
            <pre
              {...props}
              className={`overflow-x-auto p-3 text-xs ${isToolCall ? 'rounded-none border border-border/40 bg-muted/60 font-mono' : 'rounded-none bg-muted/40'}`}
            >
              {children}
            </pre>
          );
        },
      },
      code: {
        component: ({ children, ...props }: any) => (
          <code {...props} className="bg-muted/30 px-1 font-mono text-xs">
            {children}
          </code>
        ),
      },
      a: {
        component: ({ children, ...props }: any) => (
          <a
            {...props}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      },
      ul: {
        component: ({ children, ...props }: any) => (
          <ul {...props} className="my-1 list-disc pl-6">
            {children}
          </ul>
        ),
      },
      ol: {
        component: ({ children, ...props }: any) => (
          <ol {...props} className="my-1 list-decimal pl-6">
            {children}
          </ol>
        ),
      },
      blockquote: {
        component: ({ children, ...props }: any) => (
          <blockquote
            {...props}
            className="my-1 border-border border-l-4 pl-4 text-muted-foreground italic"
          >
            {children}
          </blockquote>
        ),
      },
      h1: {
        component: (props: any) => (
          <h1 {...props} className="my-1 font-bold text-xl" />
        ),
      },
      h2: {
        component: (props: any) => (
          <h2 {...props} className="my-1 font-bold text-lg" />
        ),
      },
      h3: {
        component: (props: any) => (
          <h3 {...props} className="my-1 font-bold text-md" />
        ),
      },
      h4: {
        component: (props: any) => (
          <h4 {...props} className="my-1 font-bold text-sm" />
        ),
      },
      h5: {
        component: (props: any) => (
          <h5 {...props} className="my-1 font-bold text-sm" />
        ),
      },
      h6: {
        component: (props: any) => (
          <h6 {...props} className="my-1 font-bold text-sm" />
        ),
      },
      p: { component: (props: any) => <p {...props} className="my-1" /> },
      hr: {
        component: (props: any) => (
          <hr {...props} className="my-2 border-border" />
        ),
      },
      table: {
        component: (props: any) => (
          <table {...props} className="my-2 min-w-full border-collapse" />
        ),
      },
      th: {
        component: (props: any) => (
          <th
            {...props}
            className="border border-border bg-muted/30 p-2 text-left"
          />
        ),
      },
      td: {
        component: (props: any) => (
          <td {...props} className="border border-border p-2" />
        ),
      },
      tr: {
        component: (props: any) => (
          <tr {...props} className="even:bg-muted/10" />
        ),
      },
      img: {
        component: (props: any) => (
          <img
            {...props}
            className="my-1 max-w-full"
            alt={props.alt || 'Image'}
            loading="lazy"
          />
        ),
      },
    },
  };

  return <Markdown options={markdownOptions}>{content}</Markdown>;
}
