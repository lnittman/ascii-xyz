'use client';

import {
  createSharedLinkAction,
  revokeSharedLinkAction,
  updateSharedLinkAction,
} from '@repo/orpc/actions';
import { invokeServerAction } from '@repo/orpc/server-action-wrapper';
import { mutate } from 'swr';

export function useCreateSharedLink() {
  const createSharedLink = async (arg: {
    chatId: string;
    expiresAt?: Date;
  }) => {
    const result = await invokeServerAction(createSharedLinkAction, {
      chatId: arg.chatId,
      expiresAt: arg.expiresAt,
    });

    // Invalidate shared links cache
    await mutate('/api/share/links');

    return result;
  };

  return { createSharedLink };
}

export function useRevokeSharedLink() {
  const revokeSharedLink = async (id: string) => {
    const result = await invokeServerAction(revokeSharedLinkAction, { id });

    // Invalidate shared links cache
    await mutate('/api/share/links');

    return result;
  };

  return { revokeSharedLink };
}

export function useUpdateSharedLink() {
  const updateSharedLink = async (arg: {
    id: string;
    isActive?: boolean;
  }) => {
    const result = await invokeServerAction(updateSharedLinkAction, {
      id: arg.id,
      isActive: arg.isActive,
    });

    // Invalidate shared links cache
    await mutate('/api/share/links');

    return result;
  };

  return { updateSharedLink };
}

// Helper hooks using the base actions
export function useDeactivateSharedLink() {
  const deactivateSharedLink = async (id: string) => {
    const result = await invokeServerAction(updateSharedLinkAction, {
      id,
      isActive: false,
    });

    // Invalidate shared links cache
    await mutate('/api/share/links');

    return result;
  };

  return { deactivateSharedLink };
}

export function useDeleteSharedLink() {
  const deleteSharedLink = async (id: string) => {
    const result = await invokeServerAction(revokeSharedLinkAction, { id });

    // Invalidate shared links cache
    await mutate('/api/share/links');

    return result;
  };

  return { deleteSharedLink };
}
