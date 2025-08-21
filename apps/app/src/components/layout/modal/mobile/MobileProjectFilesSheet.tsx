'use client';

import {
  mobileProjectFilesModalOpenAtom,
  mobileProjectFilesModalStateAtom,
} from '@/atoms/mobile-menus';
import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useProjectMutations } from '@/hooks/project/mutations';
import { useProject } from '@/hooks/project/queries';
import { Download, File, FileArrowUp, Trash } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ProjectFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
}

export function MobileProjectFilesSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileProjectFilesModalOpenAtom);
  const [modalState] = useAtom(mobileProjectFilesModalStateAtom);
  const [isUploading, setIsUploading] = useState(false);

  const { data: project } = useProject(modalState.projectId);
  const { updateProjectFiles, isUpdating } = useProjectMutations();

  // Convert project files to our interface (this would need to match your actual data structure)
  const files: ProjectFile[] =
    project?.files && Array.isArray(project.files)
      ? (project.files as unknown as ProjectFile[])
      : [];

  const handleClose = () => {
    setIsOpen(false);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!modalState.projectId || isUploading) {
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
        await updateProjectFiles({
          id: modalState.projectId,
          files: updatedFiles,
        });
      } catch (_error) {
      } finally {
        setIsUploading(false);
      }
    },
    [modalState.projectId, files, updateProjectFiles, isUploading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading || isUpdating,
  });

  const handleRemoveFile = async (fileId: string) => {
    if (!modalState.projectId || isUpdating) {
      return;
    }

    try {
      const updatedFiles = files.filter((file) => file.id !== fileId);
      await updateProjectFiles({
        id: modalState.projectId,
        files: updatedFiles,
      });
    } catch (_error) {}
  };

  return (
    <MobileSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Project Files"
      contentHeight="fill"
    >
      <div className="flex h-full flex-col">
        {/* Content area - takes up available space */}
        <RelativeScrollFadeContainer className="flex-1">
          <div className="p-4">
            {files.length === 0 ? (
              // Empty state
              <div
                {...getRootProps()}
                className={cn(
                  'flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border/80',
                  (isUploading || isUpdating) && 'cursor-not-allowed opacity-50'
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
              // Files list
              <div className="space-y-3">
                {/* Add files button */}
                <Button
                  className="w-full rounded-none text-foreground"
                  variant="outline"
                  {...getRootProps()}
                  disabled={isUploading || isUpdating}
                >
                  <input {...getInputProps()} />
                  <FileArrowUp className="mr-2 h-4 w-4" />
                  add more files
                </Button>

                {/* Files list */}
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-none border border-border p-3 transition-colors hover:bg-accent/30"
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
                          <p className="text-muted-foreground text-xs">file</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.url && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.url!;
                              link.download = file.name;
                              link.click();
                            }}
                          >
                            <Download weight="duotone" className="h-4 w-4" />
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
              </div>
            )}
          </div>
        </RelativeScrollFadeContainer>

        {/* Bottom action buttons */}
        <div className="border-border border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isUploading || isUpdating}
              className="flex-1 rounded-none text-foreground text-xs"
            >
              cancel
            </Button>
            <Button
              onClick={handleClose}
              disabled={isUploading || isUpdating}
              className="flex-1 rounded-none text-xs"
            >
              {isUploading || isUpdating ? 'saving...' : 'done'}
            </Button>
          </div>
        </div>
      </div>
    </MobileSheet>
  );
}
