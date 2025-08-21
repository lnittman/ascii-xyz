import { useCallback, useEffect, useState } from 'react';

import { useAtom } from 'jotai';
import { useTransitionRouter } from 'next-view-transitions';

import { useMediaQuery } from '@repo/design/hooks/use-media-query';

import { initialPromptAtom, promptFocusedAtom } from '@/atoms/chat';
import { sidebarOpenAtom } from '@/atoms/layout/sidebar';
import { currentProjectAtom } from '@/atoms/project';
import { PromptBar } from '@/components/shared/prompt-bar';
import { useAttachmentModals } from '@/hooks/attachment/use-attachment-modals';
import { useCreateChat } from '@/hooks/chat/mutations';
import { useProject } from '@/hooks/project/queries';
import { useToast } from '@repo/design/hooks/use-toast';

import { AddFiles } from './components/AddFiles';
import { AddInstructions } from './components/AddInstructions';
import { ChatList } from './components/ChatList';
import { ProjectName } from './components/ProjectName';

interface ProjectProps {
  projectId: string;
}

export function Project({ projectId }: ProjectProps) {
  const router = useTransitionRouter();
  const { toast } = useToast();
  const { createChat } = useCreateChat();

  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [, setCurrentProject] = useAtom(currentProjectAtom);
  const [, setInitialPrompt] = useAtom(initialPromptAtom);
  const [isPromptFocused, setIsPromptFocused] = useAtom(promptFocusedAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: project } = useProject(projectId);

  // Attachment modals hook
  const { previewAttachment } = useAttachmentModals();

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  const handleSubmit = useCallback(
    async (command: string) => {
      setInitialPrompt(command);
      setIsSubmitting(true);

      try {
        const chatRequest = {
          projectId,
          name: command.substring(0, 30),
        };

        const newChat = await createChat(chatRequest);

        if (!newChat || typeof newChat !== 'object' || !('id' in newChat)) {
          throw new Error('Chat creation failed');
        }

        // Navigate to the new chat within the project
        router.push(`/p/${projectId}/c/${(newChat as any).id}`);

        return (newChat as any).id;
      } catch (_error) {
        toast({
          title: 'error creating chat',
          description: 'please try again',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [projectId, createChat, router, toast, setInitialPrompt]
  );

  // Close sidebar on mobile when component mounts
  useEffect(() => {
    if (!isDesktop && isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 300); // Wait for page transition to complete

      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array - only run on mount

  return (
    <div className="flex h-full flex-col items-center pb-24">
      {/* Project name */}
      <div className="mt-12 mb-4 w-full max-w-2xl px-4">
        <ProjectName />
      </div>

      {/* Command Bar - Below project name */}
      <div className="mb-8 w-full max-w-2xl px-4">
        <PromptBar
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isFocused={isPromptFocused}
          onFocusChange={setIsPromptFocused}
          onAttachmentPreview={previewAttachment}
          placeholder="what do you want to know?"
        />
      </div>

      {/* Main content area */}
      <div className="w-full max-w-2xl px-4 pb-16">
        {/* Interactive Elements */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <AddFiles />
          <AddInstructions />
        </div>

        {/* Project Chats */}
        <ChatList projectId={projectId} />
      </div>
    </div>
  );
}
