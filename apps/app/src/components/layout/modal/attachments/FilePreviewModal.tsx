'use client';

import { attachmentModalAtom } from '@/atoms/layout/modal';
import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import {
  Check,
  Copy,
  File,
  FileAudio,
  FileCode,
  FileDoc,
  FilePdf,
  FileVideo,
  FileXls,
  X,
} from '@phosphor-icons/react';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { Highlight, themes } from 'prism-react-renderer';
import type React from 'react';
import { useEffect, useState } from 'react';

interface FileContent {
  content: string;
  isLoading: boolean;
  error: string | null;
}

export function FilePreviewModal() {
  const { isMobile } = useIsMobile();
  const [attachmentModal, setAttachmentModal] = useAtom(attachmentModalAtom);
  const [fileContent, setFileContent] = useState<FileContent>({
    content: '',
    isLoading: false,
    error: null,
  });
  const [isCopied, setIsCopied] = useState(false);

  // Show for any file type that isn't specifically handled by other modals, and NOT on mobile
  const isVisible =
    attachmentModal.open &&
    !['image'].includes(attachmentModal.attachmentType || '') &&
    !isMobile;

  const handleClose = () => {
    setAttachmentModal((prev) => ({ ...prev, open: false }));
  };

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Helper to get file extension
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Map file extensions to language identifiers for syntax highlighting
  const getLanguageFromExtension = (ext: string): string => {
    const extensionMap: { [key: string]: string } = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      py: 'python',
      rb: 'ruby',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      md: 'markdown',
      yaml: 'yaml',
      yml: 'yaml',
      xml: 'xml',
      sh: 'bash',
      bash: 'bash',
      sql: 'sql',
      txt: 'text',
    };

    return extensionMap[ext] || 'text';
  };

  // Get language from file
  const getLanguage = () => {
    const filename = (attachmentModal.metadata?.name as string) || '';
    const ext = getFileExtension(filename);
    return getLanguageFromExtension(ext);
  };

  // Get icon based on file type
  const getFileIcon = () => {
    const filename = (attachmentModal.metadata?.name as string) || '';
    const ext = getFileExtension(filename);
    const type = attachmentModal.attachmentType;

    switch (type) {
      case 'text':
        return (
          <File weight="duotone" className="h-16 w-16 text-muted-foreground" />
        );
      case 'pdf':
        return <FilePdf weight="duotone" className="h-16 w-16 text-red-500" />;
      case 'doc':
        return <FileDoc weight="duotone" className="h-16 w-16 text-blue-500" />;
      case 'spreadsheet':
        return (
          <FileXls weight="duotone" className="h-16 w-16 text-green-500" />
        );
      case 'audio':
        return (
          <FileAudio weight="duotone" className="h-16 w-16 text-purple-500" />
        );
      case 'video':
        return (
          <FileVideo weight="duotone" className="h-16 w-16 text-pink-500" />
        );
      case 'code':
        return (
          <FileCode weight="duotone" className="h-16 w-16 text-indigo-500" />
        );
      default: {
        // Try to determine from extension
        if (['pdf'].includes(ext)) {
          return (
            <FilePdf weight="duotone" className="h-16 w-16 text-red-500" />
          );
        }
        if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) {
          return (
            <FileDoc weight="duotone" className="h-16 w-16 text-blue-500" />
          );
        }
        if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) {
          return (
            <FileXls weight="duotone" className="h-16 w-16 text-green-500" />
          );
        }
        if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
          return (
            <FileAudio weight="duotone" className="h-16 w-16 text-purple-500" />
          );
        }
        if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
          return (
            <FileVideo weight="duotone" className="h-16 w-16 text-pink-500" />
          );
        }
        if (
          [
            'js',
            'ts',
            'py',
            'java',
            'c',
            'cpp',
            'html',
            'css',
            'jsx',
            'tsx',
            'php',
            'rb',
            'go',
          ].includes(ext)
        ) {
          return (
            <FileCode weight="duotone" className="h-16 w-16 text-indigo-500" />
          );
        }

        return (
          <File weight="duotone" className="h-16 w-16 text-muted-foreground" />
        );
      }
    }
  };

  // Read file content when modal is opened
  useEffect(() => {
    if (isVisible) {
      const content = attachmentModal.metadata?.content as string;

      // If content is already available (like for text files uploaded via paste)
      if (content) {
        setFileContent({
          content,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Try to read file if available
      const file = attachmentModal.metadata?.file as File;
      if (file) {
        setFileContent((prev) => ({ ...prev, isLoading: true, error: null }));

        const reader = new FileReader();

        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFileContent({
            content: result || '',
            isLoading: false,
            error: null,
          });
        };

        reader.onerror = () => {
          setFileContent({
            content: '',
            isLoading: false,
            error: 'Failed to read file content',
          });
        };

        // Read as text for most file types
        const textFileTypes = [
          'text',
          'code',
          'application/json',
          'text/plain',
          'text/html',
          'text/css',
          'application/javascript',
        ];
        const isTextLike =
          textFileTypes.some((type) => file.type.includes(type)) ||
          [
            'js',
            'ts',
            'py',
            'html',
            'css',
            'jsx',
            'tsx',
            'json',
            'md',
            'txt',
            'xml',
            'yml',
            'yaml',
          ].includes(getFileExtension(file.name));

        if (isTextLike) {
          reader.readAsText(file);
        } else {
          // For binary files, just indicate we can't preview
          setFileContent({
            content: '',
            isLoading: false,
            error: null,
          });
        }
      }
    }
  }, [isVisible, attachmentModal.metadata]);

  // Calculate file size to display
  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) {
      return '';
    }

    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    }
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!fileContent.content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(fileContent.content);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (_err) {}
  };

  // Determine if we should show code view
  const shouldShowCodeView = () => {
    const filename = (attachmentModal.metadata?.name as string) || '';
    const ext = getFileExtension(filename);
    const codeExtensions = [
      'js',
      'jsx',
      'ts',
      'tsx',
      'py',
      'rb',
      'java',
      'c',
      'cpp',
      'cs',
      'go',
      'rs',
      'php',
      'html',
      'css',
      'scss',
      'json',
      'md',
      'yaml',
      'yml',
      'xml',
      'sh',
      'bash',
      'sql',
    ];

    return codeExtensions.includes(ext) && fileContent.content.length > 0;
  };

  // Render the file preview content
  const renderFileContent = () => {
    if (fileContent.isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      );
    }

    if (fileContent.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-red-500">
          <p className="text-sm">{fileContent.error}</p>
        </div>
      );
    }

    if (!fileContent.content || !shouldShowCodeView()) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
          {getFileIcon()}

          <div className="text-center">
            <h4 className="mb-1 font-medium text-base text-foreground">
              {(attachmentModal.metadata?.name as string) || 'File'}
            </h4>

            <p className="text-muted-foreground text-sm">
              {formatFileSize(attachmentModal.metadata?.size as number)}
            </p>

            <div className="mt-1 text-muted-foreground/70 text-xs">
              {attachmentModal.attachmentType || 'file'}
            </div>
          </div>
        </div>
      );
    }

    // Get language from file extension for syntax highlighting
    const language = getLanguage();

    return (
      <RelativeScrollFadeContainer
        className="h-full"
        fadeColor="var(--muted/20)"
      >
        <div className="bg-muted/20">
          {language !== 'text' ? (
            <Highlight
              theme={themes.nightOwl}
              code={fileContent.content}
              language={language}
            >
              {({ tokens, getLineProps, getTokenProps }) => (
                <pre className="p-4 text-sm">
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      <span className="mr-4 inline-block w-10 select-none text-right text-muted-foreground text-xs">
                        {i + 1}
                      </span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          ) : (
            <pre className="whitespace-pre-wrap p-4 font-mono text-foreground text-sm">
              {fileContent.content}
            </pre>
          )}
        </div>
      </RelativeScrollFadeContainer>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[400]">
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          <motion.div
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 w-full max-w-3xl transform"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="flex flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg"
              style={{ height: '70vh' }}
            >
              <div className="relative flex items-center justify-between border-b p-3">
                <h3 className="font-normal text-foreground text-sm">
                  {(attachmentModal.metadata?.name as string) || 'file preview'}
                </h3>
                <div className="flex items-center gap-2">
                  {shouldShowCodeView() && (
                    <button
                      onClick={handleCopy}
                      className="flex h-7 w-7 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
                    >
                      {isCopied ? (
                        <Check
                          weight="duotone"
                          className="h-4 w-4 text-green-500"
                        />
                      ) : (
                        <Copy
                          weight="duotone"
                          className="h-4 w-4 text-muted-foreground"
                        />
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="flex h-7 w-7 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
                  >
                    <X
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                {renderFileContent()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
