'use client';

import { attachmentModalAtom } from '@/atoms/layout/modal';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
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
} from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { useAtom } from 'jotai';
import { Highlight, themes } from 'prism-react-renderer';
import { useEffect, useState } from 'react';

interface FileContent {
  content: string;
  isLoading: boolean;
  error: string | null;
}

export function MobileFilePreviewSheet() {
  const { isMobile } = useIsMobile();
  const [attachmentModal, setAttachmentModal] = useAtom(attachmentModalAtom);
  const [fileContent, setFileContent] = useState<FileContent>({
    content: '',
    isLoading: false,
    error: null,
  });
  const [isCopied, setIsCopied] = useState(false);

  const isOpen =
    attachmentModal.open &&
    !['image'].includes(attachmentModal.attachmentType || '') &&
    isMobile;

  const handleClose = () => {
    setAttachmentModal((prev) => ({ ...prev, open: false }));
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
          <File weight="duotone" className="h-20 w-20 text-muted-foreground" />
        );
      case 'pdf':
        return <FilePdf weight="duotone" className="h-20 w-20 text-red-500" />;
      case 'doc':
        return <FileDoc weight="duotone" className="h-20 w-20 text-blue-500" />;
      case 'spreadsheet':
        return (
          <FileXls weight="duotone" className="h-20 w-20 text-green-500" />
        );
      case 'audio':
        return (
          <FileAudio weight="duotone" className="h-20 w-20 text-purple-500" />
        );
      case 'video':
        return (
          <FileVideo weight="duotone" className="h-20 w-20 text-pink-500" />
        );
      case 'code':
        return (
          <FileCode weight="duotone" className="h-20 w-20 text-indigo-500" />
        );
      default: {
        // Try to determine from extension
        if (['pdf'].includes(ext)) {
          return (
            <FilePdf weight="duotone" className="h-20 w-20 text-red-500" />
          );
        }
        if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) {
          return (
            <FileDoc weight="duotone" className="h-20 w-20 text-blue-500" />
          );
        }
        if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) {
          return (
            <FileXls weight="duotone" className="h-20 w-20 text-green-500" />
          );
        }
        if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
          return (
            <FileAudio weight="duotone" className="h-20 w-20 text-purple-500" />
          );
        }
        if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
          return (
            <FileVideo weight="duotone" className="h-20 w-20 text-pink-500" />
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
            <FileCode weight="duotone" className="h-20 w-20 text-indigo-500" />
          );
        }

        return (
          <File weight="duotone" className="h-20 w-20 text-muted-foreground" />
        );
      }
    }
  };

  // Read file content when modal is opened
  useEffect(() => {
    if (isOpen) {
      const content = attachmentModal.metadata?.content as string;

      if (content) {
        setFileContent({
          content,
          isLoading: false,
          error: null,
        });
        return;
      }

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
          setFileContent({
            content: '',
            isLoading: false,
            error: null,
          });
        }
      }
    }
  }, [isOpen, attachmentModal.metadata]);

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
        <div className="flex h-full flex-col items-center justify-center p-4 text-red-500">
          <p className="text-center text-sm">{fileContent.error}</p>
        </div>
      );
    }

    if (!fileContent.content || !shouldShowCodeView()) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
          {getFileIcon()}

          <div className="text-center">
            <h4 className="mb-2 font-medium text-foreground text-lg">
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

    const language = getLanguage();

    return (
      <div className="h-full overflow-auto bg-muted/10">
        {language !== 'text' ? (
          <Highlight
            theme={themes.nightOwl}
            code={fileContent.content}
            language={language}
          >
            {({ tokens, getLineProps, getTokenProps }) => (
              <pre className="overflow-auto p-4 text-xs">
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className="mr-3 inline-block w-8 select-none text-right text-muted-foreground">
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
          <pre className="whitespace-pre-wrap p-4 font-mono text-foreground text-xs">
            {fileContent.content}
          </pre>
        )}
      </div>
    );
  };

  const title = (attachmentModal.metadata?.name as string) || 'file preview';

  return (
    <MobileSheet
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      contentHeight="fill"
      customHeader={false}
      position="bottom"
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">{renderFileContent()}</div>

        {/* Action buttons */}
        {shouldShowCodeView() && (
          <div className="border-border/50 border-t p-4">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="h-12 w-full rounded-none"
            >
              {isCopied ? (
                <>
                  <Check
                    weight="duotone"
                    className="mr-2 h-5 w-5 text-green-500"
                  />
                  copied!
                </>
              ) : (
                <>
                  <Copy weight="duotone" className="mr-2 h-5 w-5" />
                  copy code
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </MobileSheet>
  );
}
