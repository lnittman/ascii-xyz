'use server';

// This file exports ORPC mutation procedures as server actions for client components
// Only mutations (create, update, delete) should be exported as actions
// GET operations should be done in RSC or via SWR queries
// The procedures already handle auth in the ORPC middleware, so we just pass through

import { call } from '@orpc/server';
import { auth } from '@repo/auth/server';
import { router } from './router';

// Helper to create server action wrappers that properly call ORPC procedures
async function wrapAction<TInput, TOutput>(
  procedure: any,
  input: TInput
): Promise<[error: any, data: TOutput | undefined]> {
  try {
    const { userId } = await auth();
    const context = { clerkId: userId || undefined };

    // Use ORPC's call utility to properly invoke the procedure
    const result = await call(procedure, input, { context });
    return [null, result];
  } catch (error: any) {
    return [{ message: error.message || 'Action failed' }, undefined];
  }
}

// Chat actions (mutations only)
export async function createChat(input: any) {
  return wrapAction(router.chats.create, input);
}

export async function createChatWithPrompt(input: any) {
  return wrapAction(router.chat.create, input);
}

export async function deleteChat(input: any) {
  return wrapAction(router.chats.delete, input);
}

export async function updateChat(input: any) {
  return wrapAction(router.chats.update, input);
}

export async function archiveChat(input: any) {
  return wrapAction(router.chats.archive, input);
}

export async function syncChatTitle(input: any) {
  return wrapAction(router.chats.syncTitle, input);
}

// Project actions (mutations only)
export async function createProject(input: any) {
  return wrapAction(router.projects.create, input);
}

export async function updateProject(input: any) {
  return wrapAction(router.projects.update, input);
}

export async function deleteProject(input: any) {
  return wrapAction(router.projects.delete, input);
}

export async function archiveProject(input: any) {
  return wrapAction(router.projects.archive, input);
}

export async function updateProjectFiles(input: any) {
  return wrapAction(router.projects.updateFiles, input);
}

export async function updateProjectInstructions(input: any) {
  return wrapAction(router.projects.updateInstructions, input);
}

// User actions (mutations only)
export async function updateUser(input: any) {
  return wrapAction(router.user.update, input);
}

export async function updateUserModel(input: any) {
  return wrapAction(router.user.updateActiveModel, input);
}

// Settings actions (mutations only)
export async function updateAISettings(input: any) {
  return wrapAction(router.settings.ai.update, input);
}

export async function toggleModelEnabledAction(input: any) {
  return wrapAction(router.settings.ai.toggleModel, input);
}

export async function verifyApiKeyAction(input: any) {
  return wrapAction(router.settings.ai.verifyApiKey, input);
}

export async function updateDataSettings(input: any) {
  return wrapAction(router.settings.data.update, input);
}

export async function updateAppearanceSettings(input: any) {
  return wrapAction(router.settings.appearance.update, input);
}

export async function updateNotificationSettings(input: any) {
  return wrapAction(router.settings.notification.update, input);
}

export async function updateProfileSettings(input: any) {
  return wrapAction(router.settings.profile.update, input);
}

// Output actions (mutations only)
export async function createOutput(input: any) {
  return wrapAction(router.outputs.create, input);
}

export async function updateOutput(input: any) {
  return wrapAction(router.outputs.update, input);
}

export async function deleteOutput(input: any) {
  return wrapAction(router.outputs.delete, input);
}

// Task actions (mutations only)
export async function createTask(input: any) {
  return wrapAction(router.tasks.create, input);
}

export async function updateTask(input: any) {
  return wrapAction(router.tasks.update, input);
}

export async function deleteTask(input: any) {
  return wrapAction(router.tasks.delete, input);
}

// Workspace actions (mutations only)
export async function createWorkspace(input: any) {
  return wrapAction(router.workspaces.create, input);
}

export async function updateWorkspace(input: any) {
  return wrapAction(router.workspaces.update, input);
}

export async function deleteWorkspace(input: any) {
  return wrapAction(router.workspaces.delete, input);
}

// Feedback actions (mutations only)
export async function submitMessageFeedbackAction(input: any) {
  return wrapAction(router.feedback.create, input);
}

export async function removeFeedbackAction(input: any) {
  return wrapAction(router.feedback.remove, input);
}

// Share actions (mutations only)
export async function createSharedLinkAction(input: any) {
  return wrapAction(router.share.create, input);
}

export async function revokeSharedLinkAction(input: any) {
  return wrapAction(router.share.revoke, input);
}

export async function updateSharedLinkAction(input: any) {
  return wrapAction(router.share.update, input);
}

// Logs actions (mutations only)
export async function connectGitHubAction(input: any) {
  return wrapAction(router.logs.connectGitHub, input);
}

export async function fetchGitHubReposAction(input: any) {
  return wrapAction(router.logs.fetchRepos, input);
}

export async function toggleRepositoryAction(input: any) {
  return wrapAction(router.logs.toggleRepository, input);
}

export async function toggleGlobalLogsAction(input: any) {
  return wrapAction(router.logs.toggleGlobalLogs, input);
}
