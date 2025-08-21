'use client';

import {
  mobileChatMenuOpenAtom,
  mobileShareModalOpenAtom,
  mobileShareModalStateAtom,
} from '@/atoms/mobile-menus';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useChatData } from '@/hooks/chat/queries';
import { useCreateSharedLink } from '@/hooks/share/mutations';
import {
  ArrowLeft,
  Check,
  Copy,
  FacebookLogo,
  Link as LinkIcon,
  LinkedinLogo,
  RedditLogo,
  TwitterLogo,
} from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';

// Create share sheet - initial step
export function MobileShareSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileShareModalOpenAtom);
  const [modalState] = useAtom(mobileShareModalStateAtom);
  const setMobileChatMenuOpen = useSetAtom(mobileChatMenuOpenAtom);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreatedSheet, setShowCreatedSheet] = useState(false);
  const [publicLink, setPublicLink] = useState('');

  // Fetch chat data using the chatId from modal state
  const { chat: chatData } = useChatData(isOpen ? modalState.chatId : null);
  const { createSharedLink } = useCreateSharedLink();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsCreating(false);
        setPublicLink('');
        setShowCreatedSheet(false);
      }, 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBack = () => {
    setIsOpen(false);
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setMobileChatMenuOpen(true);
    }, 100);
  };

  const handleCreateLink = async () => {
    if (!modalState.chatId) {
      return;
    }

    try {
      setIsCreating(true);

      // Use server action to create a public link
      const result = await createSharedLink({
        chatId: modalState.chatId,
      });

      if (!result || typeof result !== 'object' || !('url' in result)) {
        throw new Error('Failed to create shared link');
      }

      // Generate full URL for sharing
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${(result as any).url}`;
      setPublicLink(fullUrl);

      // Transition to created sheet
      setIsOpen(false);
      setTimeout(() => {
        setShowCreatedSheet(true);
      }, 150);
    } catch (_error) {
    } finally {
      setIsCreating(false);
    }
  };

  const title = (
    <div className="flex items-center gap-3">
      <button
        onClick={handleBack}
        className="flex h-8 w-8 items-center justify-center rounded-none border border-border bg-muted/20 text-muted-foreground transition-all duration-200 hover:border-foreground/20 hover:bg-muted/40 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        aria-label="back to menu"
      >
        <ArrowLeft className="h-4 w-4" weight="duotone" />
      </button>
      <span>share chat</span>
    </div>
  );

  return (
    <>
      <MobileSheet isOpen={isOpen} onClose={handleClose} title={title}>
        <div className="space-y-4 p-4">
          <p className="text-foreground text-sm">
            anyone with the link can view this chat up to this point. future
            messages will not be shared.
          </p>

          {/* Link preview */}
          <div className="relative flex w-full items-center rounded-none border border-border/40 bg-muted/30 p-3 text-muted-foreground">
            <span className="truncate text-sm">
              {typeof window !== 'undefined' ? window.location.origin : ''}
              /share/...
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 rounded-none text-foreground"
            >
              cancel
            </Button>
            <Button
              onClick={handleCreateLink}
              disabled={isCreating}
              variant="secondary"
              className="flex-1 rounded-none"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  <span>creating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LinkIcon weight="duotone" className="h-4 w-4" />
                  <span>create link</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </MobileSheet>

      <MobileShareCreatedSheet
        isOpen={showCreatedSheet}
        onClose={() => setShowCreatedSheet(false)}
        publicLink={publicLink}
        chatTitle={chatData?.title || 'untitled chat'}
      />
    </>
  );
}

// Share link created sheet - second step
function MobileShareCreatedSheet({
  isOpen,
  onClose,
  publicLink,
  chatTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  publicLink: string;
  chatTitle: string;
}) {
  const setMobileChatMenuOpen = useSetAtom(mobileChatMenuOpenAtom);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Focus link input when the sheet opens
  useEffect(() => {
    if (isOpen && linkInputRef.current) {
      setTimeout(() => {
        linkInputRef.current?.focus();
        linkInputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsCopied(false);
      }, 300);
    }
  }, [isOpen]);

  const handleBack = () => {
    onClose();
    // Small delay to ensure smooth transition back to chat menu
    setTimeout(() => {
      setMobileChatMenuOpen(true);
    }, 150);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setIsCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (_error) {}
  };

  const handleShare = (platform: string) => {
    if (!publicLink) {
      return;
    }

    let shareUrl = '';
    const encodedUrl = encodeURIComponent(publicLink);
    const encodedTitle = encodeURIComponent(
      `Check out this chat: ${chatTitle}`
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

  const title = (
    <div className="flex items-center gap-3">
      <button
        onClick={handleBack}
        className="flex h-8 w-8 items-center justify-center rounded-none border border-border bg-muted/20 text-muted-foreground transition-all duration-200 hover:border-foreground/20 hover:bg-muted/40 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        aria-label="back to menu"
      >
        <ArrowLeft className="h-4 w-4" weight="duotone" />
      </button>
      <span>share link created</span>
    </div>
  );

  return (
    <MobileSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 p-4">
        <p className="text-foreground text-sm">
          a public link to your chat has been created. manage previously shared
          chats at any time via settings.
        </p>

        {/* Link input with copy button */}
        <div className="relative flex w-full items-center">
          <Input
            ref={linkInputRef}
            type="text"
            value={publicLink}
            readOnly
            className="rounded-none border-border/40 bg-muted/30 pr-12"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopyLink}
            className="absolute right-1 h-8 w-8 rounded-none"
          >
            <div className="relative h-4 w-4">
              <Copy
                weight="duotone"
                className={cn(
                  'absolute inset-0 transition-all duration-300',
                  isCopied ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
                )}
              />
              <Check
                weight="duotone"
                className={cn(
                  'absolute inset-0 text-green-500 transition-all duration-300',
                  isCopied ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                )}
              />
            </div>
          </Button>
        </div>

        {/* Social sharing options */}
        <div>
          <p className="mb-3 text-muted-foreground text-xs">
            share on social media:
          </p>
          <div className="grid grid-cols-4 gap-3">
            <button
              className="flex flex-col items-center gap-2 rounded-none p-3 text-muted-foreground transition-all duration-200 hover:bg-accent/10 hover:text-foreground"
              onClick={() => handleShare('linkedin')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-muted/30">
                <LinkedinLogo weight="duotone" className="h-5 w-5" />
              </div>
              <span className="text-xs">LinkedIn</span>
            </button>

            <button
              className="flex flex-col items-center gap-2 rounded-none p-3 text-muted-foreground transition-all duration-200 hover:bg-accent/10 hover:text-foreground"
              onClick={() => handleShare('facebook')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-muted/30">
                <FacebookLogo weight="duotone" className="h-5 w-5" />
              </div>
              <span className="text-xs">Facebook</span>
            </button>

            <button
              className="flex flex-col items-center gap-2 rounded-none p-3 text-muted-foreground transition-all duration-200 hover:bg-accent/10 hover:text-foreground"
              onClick={() => handleShare('reddit')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-muted/30">
                <RedditLogo weight="duotone" className="h-5 w-5" />
              </div>
              <span className="text-xs">Reddit</span>
            </button>

            <button
              className="flex flex-col items-center gap-2 rounded-none p-3 text-muted-foreground transition-all duration-200 hover:bg-accent/10 hover:text-foreground"
              onClick={() => handleShare('twitter')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-muted/30">
                <TwitterLogo weight="duotone" className="h-5 w-5" />
              </div>
              <span className="text-xs">X</span>
            </button>
          </div>
        </div>
      </div>
    </MobileSheet>
  );
}
