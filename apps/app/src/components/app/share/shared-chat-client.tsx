'use client';

import { Chat } from '@/components/app/chat/id';
import { Button } from '@repo/design/components/ui/button';
import { Switch } from '@repo/design/components/ui/switch';
import type { SharedChatContent } from '@repo/services/share';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SharedChatWarningProps {
  onDismiss: (dontShowAgain: boolean) => void;
  onProceed: () => void;
}

const SharedChatWarning = ({
  onDismiss,
  onProceed,
}: SharedChatWarningProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleProceed = () => {
    onProceed();
    if (dontShowAgain) {
      onDismiss(dontShowAgain);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95">
      <div className="w-full max-w-md rounded-none border border-border/50 bg-card p-6">
        <h2 className="mb-2 font-semibold text-foreground text-xl">
          This is a shared chat.
        </h2>
        <p className="mb-6 text-muted-foreground text-sm">
          Content of shared chats may contain unverified or potentially unsafe
          information that does not represent the views of arbor.
        </p>
        <div className="mb-6 flex items-center justify-between space-x-2">
          <label
            htmlFor="dont-show-again"
            className="cursor-pointer text-muted-foreground text-sm"
          >
            Don't show this message again
          </label>
          <Switch
            id="dont-show-again"
            checked={dontShowAgain}
            onCheckedChange={setDontShowAgain}
          />
        </div>
        <Button onClick={handleProceed} className="w-full">
          Show content
        </Button>
      </div>
    </div>
  );
};

interface SharedChatClientProps {
  initialChatData: SharedChatContent | null;
  currentUser?: {
    id: string;
    clerkId: string;
    hideSharedWarning: boolean;
  } | null;
  error?: string;
}

export default function SharedChatClient({
  initialChatData,
  currentUser,
  error: initialError,
}: SharedChatClientProps) {
  const [showWarning, setShowWarning] = useState(true);
  const [chatData, _setChatData] = useState<SharedChatContent | null>(
    initialChatData
  );
  const [error, _setError] = useState<string | null>(initialError || null);
  const router = useRouter();

  useEffect(() => {
    if (currentUser?.hideSharedWarning) {
      setShowWarning(false);
    }
  }, [currentUser]);

  const handleProceed = () => {
    setShowWarning(false);
  };

  const handleDismissWarning = async (dontShowAgain: boolean) => {
    if (dontShowAgain && currentUser) {
      try {
        const response = await fetch('/api/user/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hideSharedWarning: true }),
        });
        if (!response.ok) {
        }
      } catch (_error) {}
    }
  };

  if (error || !chatData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="mb-2 font-medium text-xl">
            Unable to load shared chat
          </h1>
          <p className="mb-4 text-muted-foreground text-sm">
            {error || 'This shared chat may have expired or been removed.'}
          </p>
          <Button onClick={() => router.push('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showWarning && (
        <SharedChatWarning
          onProceed={handleProceed}
          onDismiss={handleDismissWarning}
        />
      )}
      {!showWarning && (
        <div className="relative">
          {chatData.expiresAt && (
            <div className="absolute top-4 right-4 z-10 rounded bg-accent/80 px-3 py-1 text-foreground text-xs">
              Expires: {new Date(chatData.expiresAt).toLocaleDateString()}
            </div>
          )}
          <Chat
            chatId={chatData.chat.id}
            isSharedView={true}
            initialMessages={chatData.chat.messages}
            readOnly={true}
          />
        </div>
      )}
    </>
  );
}
