import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import * as schema from './schema';

// User schemas
export const insertUserSchema = createInsertSchema(schema.users);
export const selectUserSchema = createSelectSchema(schema.users);
export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

// AI Settings schemas
export const insertAISettingsSchema = createInsertSchema(schema.aiSettings);
export const selectAISettingsSchema = createSelectSchema(schema.aiSettings);
export type AISettings = InferSelectModel<typeof schema.aiSettings>;
export type NewAISettings = InferInsertModel<typeof schema.aiSettings>;

// Appearance Settings schemas
export const insertAppearanceSettingsSchema = createInsertSchema(
  schema.appearanceSettings
);
export const selectAppearanceSettingsSchema = createSelectSchema(
  schema.appearanceSettings
);
export type AppearanceSettings = InferSelectModel<
  typeof schema.appearanceSettings
>;
export type NewAppearanceSettings = InferInsertModel<
  typeof schema.appearanceSettings
>;

// Chat schemas
export const insertChatSchema = createInsertSchema(schema.chats);
export const selectChatSchema = createSelectSchema(schema.chats);
export type Chat = InferSelectModel<typeof schema.chats>;
export type NewChat = InferInsertModel<typeof schema.chats>;

// Data Settings schemas
export const insertDataSettingsSchema = createInsertSchema(schema.dataSettings);
export const selectDataSettingsSchema = createSelectSchema(schema.dataSettings);
export type DataSettings = InferSelectModel<typeof schema.dataSettings>;
export type NewDataSettings = InferInsertModel<typeof schema.dataSettings>;

// Notification Settings schemas
export const insertNotificationSettingsSchema = createInsertSchema(
  schema.notificationSettings
);
export const selectNotificationSettingsSchema = createSelectSchema(
  schema.notificationSettings
);
export type NotificationSettings = InferSelectModel<
  typeof schema.notificationSettings
>;
export type NewNotificationSettings = InferInsertModel<
  typeof schema.notificationSettings
>;

// Output schemas
export const insertOutputSchema = createInsertSchema(schema.outputs);
export const selectOutputSchema = createSelectSchema(schema.outputs);
export type Output = InferSelectModel<typeof schema.outputs>;
export type NewOutput = InferInsertModel<typeof schema.outputs>;

// Output Version schemas
export const insertOutputVersionSchema = createInsertSchema(
  schema.outputVersions
);
export const selectOutputVersionSchema = createSelectSchema(
  schema.outputVersions
);
export type OutputVersion = InferSelectModel<typeof schema.outputVersions>;
export type NewOutputVersion = InferInsertModel<typeof schema.outputVersions>;

// Profile Settings schemas
export const insertProfileSettingsSchema = createInsertSchema(
  schema.profileSettings
);
export const selectProfileSettingsSchema = createSelectSchema(
  schema.profileSettings
);
export type ProfileSettings = InferSelectModel<typeof schema.profileSettings>;
export type NewProfileSettings = InferInsertModel<
  typeof schema.profileSettings
>;

// Project schemas
export const insertProjectSchema = createInsertSchema(schema.projects);
export const selectProjectSchema = createSelectSchema(schema.projects);
export type Project = InferSelectModel<typeof schema.projects>;
export type NewProject = InferInsertModel<typeof schema.projects>;

// Shared Link schemas
export const insertSharedLinkSchema = createInsertSchema(schema.sharedLinks);
export const selectSharedLinkSchema = createSelectSchema(schema.sharedLinks);
export type SharedLink = InferSelectModel<typeof schema.sharedLinks>;
export type NewSharedLink = InferInsertModel<typeof schema.sharedLinks>;

// Task schemas
export const insertTaskSchema = createInsertSchema(schema.tasks);
export const selectTaskSchema = createSelectSchema(schema.tasks);
export type Task = InferSelectModel<typeof schema.tasks>;
export type NewTask = InferInsertModel<typeof schema.tasks>;

// Workspace schemas
export const insertWorkspaceSchema = createInsertSchema(schema.workspaces);
export const selectWorkspaceSchema = createSelectSchema(schema.workspaces);
export type Workspace = InferSelectModel<typeof schema.workspaces>;
export type NewWorkspace = InferInsertModel<typeof schema.workspaces>;

// Attachment schemas
export const insertAttachmentSchema = createInsertSchema(schema.attachments);
export const selectAttachmentSchema = createSelectSchema(schema.attachments);
export type Attachment = InferSelectModel<typeof schema.attachments>;
export type NewAttachment = InferInsertModel<typeof schema.attachments>;

// Message Feedback schemas
export const insertMessageFeedbackSchema = createInsertSchema(
  schema.messageFeedback
);
export const selectMessageFeedbackSchema = createSelectSchema(
  schema.messageFeedback
);
export type MessageFeedback = InferSelectModel<typeof schema.messageFeedback>;
export type NewMessageFeedback = InferInsertModel<
  typeof schema.messageFeedback
>;

// Enum exports for convenience
export const DaemonStatus = z.enum(['connected', 'disconnected', 'syncing']);
export type DaemonStatus = z.infer<typeof DaemonStatus>;

export const OutputType = z.enum([
  'document',
  'code',
  'markdown',
  'html',
  'json',
  'text',
  'diagram',
  'table',
]);
export type OutputType = z.infer<typeof OutputType>;

export const ProjectKind = z.enum(['chat', 'code']);
export type ProjectKind = z.infer<typeof ProjectKind>;

export const TaskStatus = z.enum(['pending', 'running', 'completed', 'failed']);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const FeedbackType = z.enum(['helpful', 'not_helpful']);
export type FeedbackType = z.infer<typeof FeedbackType>;
