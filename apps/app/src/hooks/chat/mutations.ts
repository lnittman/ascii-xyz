'use client';

import {
  createChat as createChatAction,
  createChatWithPrompt as createChatWithPromptAction,
  deleteChat as deleteChatAction,
  syncChatTitle,
  updateChat,
} from '@repo/orpc/actions';
import { invokeServerAction } from '@repo/orpc/server-action-wrapper';
import { mutate } from 'swr';

export function useCreateChat() {
  const createChat = async (arg: {
    name: string;
    projectId?: string | null;
    model?: string;
  }) => {
    const result = await invokeServerAction(createChatAction, {
      name: arg.name,
      projectId: arg.projectId,
      model: arg.model,
    });
    await mutate('/api/chats');
    return result;
  };

  return { createChat };
}

export function useDeleteChat() {
  const deleteChat = async (chatId: string) => {
    const result = await invokeServerAction(deleteChatAction, { id: chatId });
    await mutate('/api/chats');
    return result;
  };

  return { deleteChat };
}

export function useRenameChat() {
  const renameChat = async (arg: { id: string; title: string }) => {
    const result = await invokeServerAction(updateChat, {
      id: arg.id,
      name: arg.title,
    });
    await mutate('/api/chats');
    await mutate(`/api/chats/${arg.id}`);
    return result;
  };

  return { renameChat };
}

export function useUpdateChatModel() {
  const updateChatModel = async (chatId: string, modelId: string) => {
    const result = await invokeServerAction(updateChat, {
      id: chatId,
      model: modelId,
    });
    await mutate(`/api/chats/${chatId}`);
    return result;
  };

  return { updateChatModel };
}

export function useCreateChatWithPrompt() {
  const createChatWithPrompt = async (arg: {
    prompt: string;
    projectId?: string | null;
    workspaceId?: string | null;
    attachments?: Array<{
      id: string;
      name: string;
      type: string;
      url?: string;
      content?: string;
      size?: number;
    }>;
  }) => {
    // Use the chat.create procedure that handles prompt
    const result = await invokeServerAction(createChatWithPromptAction, {
      prompt: arg.prompt,
      projectId: arg.projectId,
      workspaceId: arg.workspaceId,
      attachments: arg.attachments,
    });

    await mutate('/api/chats');
    return result;
  };

  return { createChatWithPrompt };
}

export function useSyncChatTitle() {
  const syncTitle = async (chatId: string) => {
    const result = await invokeServerAction(syncChatTitle, { id: chatId });
    await mutate(`/api/chats/${chatId}`);
    await mutate('/api/chats');
    return result;
  };

  return { syncChatTitle: syncTitle };
}

export function useUpdateChatProject() {
  const updateChatProject = async (
    chatId: string,
    projectId: string | null
  ) => {
    const result = await invokeServerAction(updateChat, {
      id: chatId,
      projectId,
    });
    await mutate('/api/chats');
    await mutate(`/api/chats/${chatId}`);
    return result;
  };

  return { updateChatProject };
}
