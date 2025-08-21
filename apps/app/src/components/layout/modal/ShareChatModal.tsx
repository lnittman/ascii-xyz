'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import {
  Check,
  Copy,
  FacebookLogo,
  Link as LinkIcon,
  LinkedinLogo,
  RedditLogo,
  TwitterLogo,
  X,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';

// Added import for hook
import { useChatData } from '@/hooks/chat/queries';
import { useCreateSharedLink } from '@/hooks/share/mutations';

interface ShareChatModalProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareChatModal({
  chatId,
  isOpen,
  onClose,
}: ShareChatModalProps) {
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Fetch chat data using the chatId prop
  const { chat: chatData } = useChatData(isOpen ? chatId : null); // Only fetch when open
  const chatTitle = chatData?.title || 'untitled chat'; // Use fetched title or fallback
  const { createSharedLink } = useCreateSharedLink();

  const [isCopied, setIsCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  const [step, setStep] = useState<'create' | 'created'>('create');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('create');
        setIsCreating(false);
        setPublicLink('');
        setIsCopied(false);
      }, 300); // Wait for close animation to finish
    }
  }, [isOpen]);

  // Focus link input when the link is created
  useEffect(() => {
    if (step === 'created' && linkInputRef.current) {
      linkInputRef.current.focus();
      linkInputRef.current.select();
    }
  }, [step]);

  // Handle backdrop click
  const handleBackdropClick = () => {
    if (!isCreating) {
      onClose();
    }
  };

  // Generate a link when create button is clicked
  const handleCreateLink = async () => {
    try {
      setIsCreating(true);

      // Use server action to create a public link
      const result = await createSharedLink({
        chatId,
      });

      if (!result || typeof result !== 'object' || !('url' in result)) {
        throw new Error('Failed to create shared link');
      }

      // Generate full URL for sharing
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${(result as any).url}`;
      setPublicLink(fullUrl);

      // Move to the created step
      setStep('created');
    } catch (_error) {
    } finally {
      setIsCreating(false);
    }
  };

  // Copy the link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setIsCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (_error) {}
  };

  // Share via social media
  const handleShare = (platform: string) => {
    if (!publicLink) {
      return;
    }

    let shareUrl = '';
    const encodedUrl = encodeURIComponent(publicLink);
    const encodedTitle = encodeURIComponent(
      `check out this chat: ${chatTitle}`
    );

    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'reddit':
        shareUrl = `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank');
  };

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isCreating) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isCreating]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400]">
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            onClick={handleBackdropClick}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal dialog */}
          <motion.div
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 w-full max-w-md transform"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {step === 'create' ? (
                <CreateLinkStep
                  key="create"
                  chatTitle={chatTitle}
                  onClose={onClose}
                  onCreateLink={handleCreateLink}
                  isCreating={isCreating}
                />
              ) : (
                <LinkCreatedStep
                  key="created"
                  chatTitle={chatTitle}
                  publicLink={publicLink}
                  onClose={onClose}
                  onCopyLink={handleCopyLink}
                  isCopied={isCopied}
                  linkInputRef={linkInputRef}
                  onShareClick={handleShare}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Step 1: Create Link UI
function CreateLinkStep({
  chatTitle,
  onClose,
  onCreateLink,
  isCreating,
}: {
  chatTitle: string;
  onClose: () => void;
  onCreateLink: () => void;
  isCreating: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg"
    >
      {/* Header with close button */}
      <div className="relative flex items-center justify-between border-b p-3">
        <h3 className="font-normal text-foreground text-sm">share chat</h3>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
          disabled={isCreating}
        >
          <X weight="duotone" className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="mb-4 text-foreground text-sm">
          anyone with the link can view this chat up to this point. future
          messages will not be shared.
        </p>

        {/* Link preview */}
        <div className="relative mb-6 flex w-full items-center rounded-none border border-border/50 bg-accent/20 p-2 text-muted-foreground">
          <span className="truncate pl-2 text-sm">
            {window.location.origin}/share/...
          </span>
        </div>

        {/* Button row */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isCreating}
            className="w-24 rounded-none text-foreground text-xs"
          >
            cancel
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={onCreateLink}
            disabled={isCreating}
            className="w-24 rounded-none text-xs"
            size="sm"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                <span>creating...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LinkIcon weight="duotone" className="h-4 w-4" />
                <span>create</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Step 2: Link Created UI
function LinkCreatedStep({
  chatTitle,
  isCopied,
  linkInputRef,
  publicLink,
  onClose,
  onCopyLink,
  onShareClick,
}: {
  chatTitle: string;
  isCopied: boolean;
  linkInputRef: React.RefObject<HTMLInputElement | null>;
  publicLink: string;
  onClose: () => void;
  onCopyLink: () => void;
  onShareClick: (platform: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg"
    >
      {/* Header with close button */}
      <div className="relative flex items-center justify-between border-b p-3">
        <h3 className="font-normal text-foreground text-sm">
          share link created
        </h3>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
        >
          <X weight="duotone" className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="mb-2 text-foreground text-sm">
          a public link to your chat has been created. manage previously shared
          chats at any time via <span className="underline">settings</span>.
        </p>

        {/* Link input with copy button */}
        <div className="relative mt-4 mb-6 flex w-full items-center">
          <Input
            ref={linkInputRef}
            type="text"
            value={publicLink}
            readOnly
            className="border-border/50 bg-accent/20 pr-24"
          />

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onCopyLink}
            className={cn(
              'absolute right-1 h-8 w-24 transition-colors',
              isCopied ? 'bg-green-600 hover:bg-green-700' : ''
            )}
          >
            <div className="flex items-center gap-1.5">
              {isCopied ? (
                <>
                  <Check weight="bold" className="h-3.5 w-3.5" />
                  <span>copied</span>
                </>
              ) : (
                <>
                  <Copy weight="duotone" className="h-3.5 w-3.5" />
                  <span>copy</span>
                </>
              )}
            </div>
          </Button>
        </div>

        {/* Social sharing options */}
        <div className="mt-4 flex justify-center gap-4">
          <button
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => onShareClick('linkedin')}
          >
            <div className="flex h-10 w-10 items-center justify-center bg-accent/30">
              <LinkedinLogo weight="duotone" className="h-5 w-5" />
            </div>
            <span className="text-xs">LinkedIn</span>
          </button>

          <button
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => onShareClick('facebook')}
          >
            <div className="flex h-10 w-10 items-center justify-center bg-accent/30">
              <FacebookLogo weight="duotone" className="h-5 w-5" />
            </div>
            <span className="text-xs">Facebook</span>
          </button>

          <button
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => onShareClick('reddit')}
          >
            <div className="flex h-10 w-10 items-center justify-center bg-accent/30">
              <RedditLogo weight="duotone" className="h-5 w-5" />
            </div>
            <span className="text-xs">Reddit</span>
          </button>

          <button
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => onShareClick('twitter')}
          >
            <div className="flex h-10 w-10 items-center justify-center bg-accent/30">
              <TwitterLogo weight="duotone" className="h-5 w-5" />
            </div>
            <span className="text-xs">X</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
