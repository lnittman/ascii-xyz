import type { Message } from '@ai-sdk/ui-utils';
import { atom } from 'jotai';
import type { Atom, WritableAtom } from 'jotai';
import { chatAtoms } from 'jotai-ai';

// Manually define the chat atoms type to avoid inference issues
type ChatAtomsType = {
  messagesAtom: WritableAtom<
    Message[] | Promise<Message[]>,
    [messages: Message[]],
    Promise<void>
  >;
  dataAtom: Atom<any[] | undefined>;
  isLoadingAtom: Atom<boolean>;
  isPendingAtom: Atom<boolean | Promise<boolean>>;
  inputAtom: WritableAtom<string, [event: { target: { value: string } }], void>;
  appendAtom: WritableAtom<
    boolean,
    [message: any, options?: any, metadata?: any],
    Promise<undefined | null | undefined>
  >;
  submitAtom: WritableAtom<
    boolean,
    [e?: any, options?: any, metadata?: any],
    Promise<undefined | null | undefined> | undefined
  >;
  reloadAtom: WritableAtom<null, [any?], Promise<null | undefined>> & {
    init: null;
  };
  stopAtom: WritableAtom<null, [], void> & { init: null };
  bodyAtom?: WritableAtom<any, [any], void>;
};

// Create chat atoms with jotai-ai
export const createChatAtoms = (
  chatId: string,
  initialMessages?: Message[],
  options?: {
    onFinish?: (message: any) => void;
    onError?: (error: Error) => void;
    selectedModelId?: string;
  }
): ChatAtomsType => {
  return chatAtoms({
    // Use API proxy instead of direct Mastra connection
    api: '/api/chat/stream',
    id: chatId,
    initialMessages,
    body: {
      threadId: chatId,
      selectedModelId: options?.selectedModelId,
      // Mastra automatically handles resourceId from auth context
    },
    sendExtraMessageFields: true,
    maxToolRoundtrips: 5,
    onFinish: options?.onFinish
      ? (_get, _set, message: any) => options.onFinish?.(message)
      : undefined,
    onError: options?.onError
      ? (_get, _set, error) => options.onError?.(error)
      : undefined,
  }) as ChatAtomsType;
};

// Global atoms for current chat
export const currentChatAtomsAtom = atom<ChatAtomsType | null>(null);

// Derived atoms for easy access
export const chatMessagesAtom = atom((get) => {
  const chatAtoms = get(currentChatAtomsAtom);
  return chatAtoms ? get(chatAtoms.messagesAtom) : [];
});

export const chatInputAtom = atom(
  (get) => {
    const chatAtoms = get(currentChatAtomsAtom);
    return chatAtoms ? get(chatAtoms.inputAtom) : '';
  },
  (get, set, value: string) => {
    const chatAtoms = get(currentChatAtomsAtom);
    if (chatAtoms) {
      // jotai-ai expects an event object
      set(chatAtoms.inputAtom, { target: { value } });
    }
  }
);

export const chatIsLoadingAtom = atom((get) => {
  const chatAtoms = get(currentChatAtomsAtom);
  return chatAtoms ? get(chatAtoms.isLoadingAtom) : false;
});

export const chatSubmitAtom = atom(null, async (get, set, input?: string) => {
  const chatAtoms = get(currentChatAtomsAtom);
  if (chatAtoms) {
    // If input is provided, update the input atom first
    if (input !== undefined) {
      set(chatAtoms.inputAtom, { target: { value: input } });
    }
    // Create a fake event object with preventDefault for jotai-ai
    const fakeEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
    };
    await set(chatAtoms.submitAtom, fakeEvent);
  }
});

// Helper atom to initialize chat atoms for a specific chat
export const initializeChatAtom = atom(
  null,
  (
    get,
    set,
    {
      chatId,
      initialMessages,
      resourceId,
      selectedModelId,
      onFinish,
      onError,
    }: {
      chatId: string;
      initialMessages?: Message[];
      resourceId?: string;
      selectedModelId?: string;
      onFinish?: (message: Message) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    const chatAtoms = createChatAtoms(chatId, initialMessages, {
      onFinish,
      onError,
      selectedModelId,
    });

    // Update the body to include additional data if bodyAtom exists
    if (chatAtoms.bodyAtom) {
      const currentBody = get(chatAtoms.bodyAtom) || {};
      set(chatAtoms.bodyAtom, {
        ...currentBody,
        threadId: chatId,
        resourceId,
        selectedModelId, // Pass the selected model ID directly
        // Also pass runtime context for Mastra
        runtimeContext: selectedModelId
          ? {
              'chat-model': selectedModelId,
            }
          : undefined,
      });
    }

    set(currentChatAtomsAtom, chatAtoms);
  }
);

// Atom to stop streaming
export const chatStopAtom = atom(null, (get, set) => {
  const chatAtoms = get(currentChatAtomsAtom);
  if (chatAtoms?.stopAtom) {
    set(chatAtoms.stopAtom);
  }
});

// Atom to clear current chat
export const clearChatAtom = atom(null, (_get, set) => {
  set(currentChatAtomsAtom, null);
});
