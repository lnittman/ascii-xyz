'use client';

import {
  removeFeedbackAction,
  submitMessageFeedbackAction,
} from '@repo/orpc/actions';
import { mutate } from 'swr';

export function useSubmitFeedback() {
  const submitFeedback = async (arg: {
    chatId: string;
    messageId: string;
    type: 'helpful' | 'not_helpful';
  }) => {
    const result = await submitMessageFeedbackAction({
      chatId: arg.chatId,
      messageId: arg.messageId,
      type: arg.type,
    });

    // Invalidate feedback cache for this message
    await mutate(`/api/feedback/${arg.messageId}`);

    return result;
  };

  return { submitFeedback };
}

export function useRemoveFeedback() {
  const removeFeedback = async (messageId: string) => {
    const result = await removeFeedbackAction({ messageId });

    // Invalidate feedback cache for this message
    await mutate(`/api/feedback/${messageId}`);

    return result;
  };

  return { removeFeedback };
}

// Combined hook for easier usage in components
export function useFeedback() {
  const { submitFeedback } = useSubmitFeedback();
  const { removeFeedback } = useRemoveFeedback();

  const handleFeedback = async (arg: {
    chatId: string;
    messageId: string;
    type: 'helpful' | 'not_helpful' | null;
  }) => {
    if (arg.type === null) {
      return removeFeedback(arg.messageId);
    }
    return submitFeedback({
      chatId: arg.chatId,
      messageId: arg.messageId,
      type: arg.type,
    });
  };

  return { handleFeedback, submitFeedback, removeFeedback };
}
