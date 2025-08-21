import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Output panel state
export const outputPanelOpenAtom = atomWithStorage<boolean>(
  'outputPanelOpen',
  false
);

// Currently selected output
export const selectedOutputIdAtom = atom<string | null>(null);

// Current chat ID for filtering
export const currentChatIdAtom = atom<string | null>(null);

// Available outputs for current chat
export const chatOutputsAtom = atom<
  Array<{
    id: string;
    title: string;
    type: string;
    messageId: string;
    chatId?: string;
    createdAt: Date;
    isPinned: boolean;
    content?: string;
    metadata?: Record<string, any>;
    isStreaming?: boolean;
  }>
>([]);

// Filtered outputs for the current chat
export const filteredChatOutputsAtom = atom((get) => {
  const outputs = get(chatOutputsAtom);
  const currentChatId = get(currentChatIdAtom);

  if (!currentChatId) {
    return outputs;
  }

  return outputs.filter((output) => output.chatId === currentChatId);
});
