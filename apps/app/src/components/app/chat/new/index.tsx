import { useCallback, useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname } from 'next/navigation';

import {
  initialPromptAtom,
  promptFocusedAtom,
  promptInputAtom,
} from '@/atoms/chat';
import { sidebarOpenAtom } from '@/atoms/layout/sidebar';
import { selectedModelIdAtom } from '@/atoms/models';
import { initialUserAtom } from '@/atoms/user';
import { PromptBar } from '@/components/shared/prompt-bar';
import { useAttachmentModals } from '@/hooks/attachment/use-attachment-modals';
import { useCreateChat } from '@/hooks/chat/mutations';
import { useUpdateUserModel } from '@/hooks/user/mutations';
import { useToast } from '@repo/design/hooks/use-toast';

import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { Greeting } from './components/greeting';

export function NewChat() {
  const router = useTransitionRouter();
  const pathname = usePathname();

  const [_isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const { isMobile } = useIsMobile();

  const { createChat } = useCreateChat();
  const { toast } = useToast();

  const [, setInitialPrompt] = useAtom(initialPromptAtom);
  const [isPromptFocused, setIsPromptFocused] = useAtom(promptFocusedAtom);
  const [selectedModelId, setSelectedModelId] = useAtom(selectedModelIdAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setPromptInput] = useAtom(promptInputAtom);

  // User data from server-side and model persistence
  const [user] = useAtom(initialUserAtom);
  const { updateUserModel } = useUpdateUserModel();

  // Attachment modals hook
  const { previewAttachment } = useAttachmentModals();

  const handleSubmit = useCallback(
    async (command: string) => {
      setInitialPrompt(command);
      setIsSubmitting(true);

      try {
        // Use a placeholder title that's clearly temporary
        // Mastra will generate a better title automatically
        const chatRequest = {
          name: 'untitled',
        };

        const newChat = await createChat(chatRequest);

        if (!newChat || typeof newChat !== 'object' || !('id' in newChat)) {
          throw new Error('Chat creation failed');
        }

        // Navigate to the new chat
        router.push(`/c/${(newChat as any).id}`);

        // Don't reset isSubmitting here - let the navigation handle it

        return (newChat as any).id;
      } catch (_error) {
        // Only reset isSubmitting on error
        setIsSubmitting(false);

        toast({
          title: 'error creating chat',
          description: 'please try again',
          variant: 'destructive',
        });

        return null;
      }
    },
    [createChat, router, toast, setInitialPrompt]
  );

  // Close sidebar on mobile when navigating to root page (only once per navigation)
  useEffect(() => {
    if (isMobile && pathname === '/') {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 100); // Small delay to ensure smooth transition

      return () => clearTimeout(timer);
    }
  }, [isMobile, pathname, setIsOpen]); // React to navigation changes, always close on mobile

  // Update user's active model when selection changes
  useEffect(() => {
    if (!selectedModelId || !user) {
      return;
    }

    // Only update if the model has changed from what's saved
    if (user.activeModel === selectedModelId) {
      return;
    }

    // Update the user's active model
    updateUserModel(selectedModelId);
  }, [selectedModelId, user?.activeModel, updateUserModel, user]);

  // Clear prompt input when component unmounts (navigating to chat)
  useEffect(() => {
    return () => {
      // Clear the prompt when leaving the new chat page
      setPromptInput('');
    };
  }, [setPromptInput]);

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="mt-[20vh] mb-8 w-full text-center">
        <Greeting />
      </div>

      <div className="w-full max-w-2xl px-4">
        <PromptBar
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isFocused={isPromptFocused}
          onFocusChange={setIsPromptFocused}
          onAttachmentPreview={previewAttachment}
          placeholder="what do you want to know?"
          selectedModelId={selectedModelId}
          onModelChange={setSelectedModelId}
          clearOnSubmit={false}
        />
      </div>
    </motion.div>
  );
}
