'use client';

import React, { useState, useCallback, useEffect } from 'react';

import { Download, File, FileArrowUp, Trash, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';

import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { useProjectMutations } from '@/hooks/project/mutations';
import { useProject } from '@/hooks/project/queries';
import { useModals } from '@/hooks/use-modals';

interface ProjectFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
}

interface ProjectFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
}

export function ProjectFilesModal({
  isOpen,
  onClose,
  projectId,
}: ProjectFilesModalProps) {
  const { closeProjectFilesModal } = useModals();
  const [isUploading, setIsUploading] = useState(false);

  const { data: project } = useProject(projectId);
  const { updateProjectFiles, isUpdating } = useProjectMutations();

  // Parse files from project data (stored as JSON) with proper type casting
  const files: ProjectFile[] = React.useMemo(() => {
    if (!project?.files || !Array.isArray(project.files)) {
      return [];
    }

    // Safely parse and validate each file object
    return (project.files as any[])
      .filter((file): file is ProjectFile => {
        return (
          typeof file === 'object' &&
          file !== null &&
          typeof file.id === 'string' &&
          typeof file.name === 'string' &&
          typeof file.size === 'number' &&
          typeof file.type === 'string' &&
          (file.uploadedAt instanceof Date ||
            typeof file.uploadedAt === 'string')
        );
      })
      .map((file) => ({
        ...file,
        uploadedAt:
          file.uploadedAt instanceof Date
            ? file.uploadedAt
            : new Date(file.uploadedAt),
      }));
  }, [project?.files]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isUploading && !isUpdating) {
        closeProjectFilesModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isUploading, isUpdating, closeProjectFilesModal]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!projectId || isUploading) {
        return;
      }

      setIsUploading(true);

      try {
        // Convert files to ProjectFile format
        const newFiles: ProjectFile[] = acceptedFiles.map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          // In a real implementation, you'd upload to a file storage service
          url: URL.createObjectURL(file),
        }));

        // Update project with new files
        const updatedFiles = [...files, ...newFiles];
        await updateProjectFiles({ id: projectId, files: updatedFiles });
      } catch (_error) {
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, files, updateProjectFiles, isUploading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading || isUpdating,
  });

  const handleRemoveFile = async (fileId: string) => {
    if (!projectId || isUpdating) {
      return;
    }

    try {
      const updatedFiles = files.filter((file) => file.id !== fileId);
      await updateProjectFiles({ id: projectId, files: updatedFiles });
    } catch (_error) {}
  };

  const _formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const handleBackdropClick = () => {
    if (!isUploading && !isUpdating) {
      closeProjectFilesModal();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400]">
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            onClick={handleBackdropClick}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 max-h-[80vh] w-full max-w-2xl transform"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="font-medium text-foreground text-sm">
                  Project files
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-none text-xs"
                    {...getRootProps()}
                    disabled={isUploading || isUpdating}
                  >
                    <input {...getInputProps()} />
                    add files
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={closeProjectFilesModal}
                    className="h-8 w-8 rounded-none"
                    disabled={isUploading || isUpdating}
                  >
                    <X weight="duotone" className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <RelativeScrollFadeContainer className="flex-1">
                <div className="p-4">
                  {files.length === 0 ? (
                    // Empty state - matches screenshot style
                    <div
                      {...getRootProps()}
                      className={cn(
                        'flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed transition-colors',
                        isDragActive
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-border/80',
                        (isUploading || isUpdating) &&
                          'cursor-not-allowed opacity-50'
                      )}
                    >
                      <input {...getInputProps()} />
                      <FileArrowUp className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-2 max-w-sm text-center text-foreground text-sm">
                        {isDragActive
                          ? 'drop files here...'
                          : 'add documents, code files, images, and more. elysian can access their contents when you chat inside the project.'}
                      </p>
                    </div>
                  ) : (
                    // Files list - simplified like screenshot
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="group flex items-center justify-between rounded-none border border-border p-3 transition-colors hover:bg-accent/30"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-primary/20">
                              <File
                                weight="duotone"
                                className="h-4 w-4 text-primary"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-foreground text-sm">
                                {file.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                file
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            {file.url && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-none"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = file.url!;
                                  link.download = file.name;
                                  link.click();
                                }}
                              >
                                <Download
                                  weight="duotone"
                                  className="h-4 w-4"
                                />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-none text-red-500 hover:text-red-600"
                              onClick={() => handleRemoveFile(file.id)}
                              disabled={isUpdating}
                            >
                              <Trash weight="duotone" className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </RelativeScrollFadeContainer>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
