import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// Enums
export const daemonStatusEnum = pgEnum('DaemonStatus', [
  'connected',
  'disconnected',
  'syncing',
]);
export const outputTypeEnum = pgEnum('OutputType', [
  'document',
  'code',
  'markdown',
  'html',
  'json',
  'text',
  'diagram',
  'table',
]);
export const projectKindEnum = pgEnum('ProjectKind', ['chat', 'code']);
export const taskStatusEnum = pgEnum('TaskStatus', [
  'pending',
  'running',
  'completed',
  'failed',
]);
export const feedbackTypeEnum = pgEnum('FeedbackType', [
  'helpful',
  'not_helpful',
]);
export const visibilityEnum = pgEnum('Visibility', [
  'public',
  'private',
  'unlisted',
]);

// Tables
export const users = pgTable('User', {
  id: text('id').primaryKey(),
  clerkId: text('clerkId').notNull().unique(),
  activeModel: text('activeModel'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

export const aiSettings = pgTable(
  'AISettings',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    defaultModelId: text('defaultModelId').default(
      'google/gemini-2.5-flash-preview-05-20'
    ),
    customInstructions: text('customInstructions'),
    branchFormat: text('branchFormat').default('arbor/{feature}'),
    allowTraining: boolean('allowTraining').default(true).notNull(),
    openaiApiKey: text('openaiApiKey'),
    anthropicApiKey: text('anthropicApiKey'),
    googleApiKey: text('googleApiKey'),
    openrouterApiKey: text('openrouterApiKey'),
    enabledModels: json('enabledModels').default({}),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index().on(table.userId),
  })
);

export const appearanceSettings = pgTable(
  'AppearanceSettings',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    fontFamily: text('fontFamily').default('iosevka-term').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index().on(table.userId),
  })
);

export const chats = pgTable(
  'Chat',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    userId: text('userId').notNull(),
    projectId: text('projectId'),
    activeModel: text('activeModel'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index().on(table.projectId),
    userIdx: index().on(table.userId),
  })
);

export const dataSettings = pgTable(
  'DataSettings',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    hideSharedWarning: boolean('hideSharedWarning').default(false).notNull(),
    usageAnalyticsEnabled: boolean('usageAnalyticsEnabled')
      .default(true)
      .notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index().on(table.userId),
  })
);

export const notificationSettings = pgTable(
  'NotificationSettings',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    notifyProcessingComplete: boolean('notifyProcessingComplete')
      .default(true)
      .notNull(),
    notifyProcessingFailed: boolean('notifyProcessingFailed')
      .default(true)
      .notNull(),
    notifyWeeklySummary: boolean('notifyWeeklySummary')
      .default(false)
      .notNull(),
    notifyFeatureUpdates: boolean('notifyFeatureUpdates')
      .default(false)
      .notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index().on(table.userId),
  })
);

export const outputs = pgTable(
  'Output',
  {
    id: text('id').primaryKey(),
    chatId: text('chatId').notNull(),
    messageId: text('messageId').notNull(),
    title: text('title').notNull(),
    type: outputTypeEnum('type').notNull(),
    content: text('content').notNull(),
    metadata: json('metadata'),
    isPinned: boolean('isPinned').default(false).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    chatIdx: index().on(table.chatId),
    messageIdx: index().on(table.messageId),
    typeIdx: index().on(table.type),
  })
);

export const outputVersions = pgTable(
  'OutputVersion',
  {
    id: text('id').primaryKey(),
    outputId: text('outputId').notNull(),
    content: text('content').notNull(),
    metadata: json('metadata'),
    version: integer('version').default(1).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueOutputVersion: uniqueIndex().on(table.outputId, table.version),
    outputIdx: index().on(table.outputId),
  })
);

export const profileSettings = pgTable(
  'ProfileSettings',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    displayName: text('displayName'),
    username: text('username').unique(),
    phoneNumber: text('phoneNumber'),
    tier: text('tier').default('free').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index().on(table.userId),
    usernameIdx: index().on(table.username),
  })
);

export const projects = pgTable(
  'Project',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    userId: text('userId').notNull(),
    description: text('description'),
    imageUrl: text('imageUrl'),
    instructions: text('instructions'),
    files: json('files'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
    kind: projectKindEnum('kind').default('chat').notNull(),
  },
  (table) => ({
    userIdx: index().on(table.userId),
  })
);

export const sharedLinks = pgTable(
  'SharedLink',
  {
    id: text('id').primaryKey(),
    chatId: text('chatId').notNull(),
    ownerId: text('ownerId').notNull(),
    accessToken: text('accessToken').notNull().unique(),
    isActive: boolean('isActive').default(true).notNull(),
    messageCountAtShare: integer('messageCountAtShare').default(0).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
    expiresAt: timestamp('expiresAt', { mode: 'date' }),
  },
  (table) => ({
    accessTokenIdx: index().on(table.accessToken),
    chatIdx: index().on(table.chatId),
    ownerIdx: index().on(table.ownerId),
  })
);

export const tasks = pgTable(
  'Task',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspaceId').notNull(),
    userId: text('userId').notNull(),
    prompt: text('prompt').notNull(),
    status: taskStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
    completedAt: timestamp('completedAt', { mode: 'date' }),
    description: text('description'),
    error: text('error'),
    output: text('output'),
    startedAt: timestamp('startedAt', { mode: 'date' }),
    title: text('title').notNull(),
  },
  (table) => ({
    statusIdx: index().on(table.status),
    userIdx: index().on(table.userId),
    workspaceIdx: index().on(table.workspaceId),
  })
);

export const workspaces = pgTable(
  'Workspace',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
    daemonId: text('daemonId'),
    daemonStatus: daemonStatusEnum('daemonStatus')
      .default('disconnected')
      .notNull(),
    lastDaemonHeartbeat: timestamp('lastDaemonHeartbeat', { mode: 'date' }),
    localPath: text('localPath'),
  },
  (table) => ({
    daemonIdx: index().on(table.daemonId),
    userIdx: index().on(table.userId),
  })
);

export const attachments = pgTable(
  'Attachment',
  {
    id: text('id').primaryKey(),
    chatId: text('chatId').notNull(),
    messageId: text('messageId').notNull(),
    type: text('type').notNull(), // 'text', 'image', 'document', 'code', 'pdf'
    name: text('name').notNull(),
    size: integer('size').notNull(),
    mimeType: text('mimeType').notNull(),
    content: text('content'), // For text content, stored directly
    metadata: json('metadata'), // For additional metadata like dimensions, keywords, etc.
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    chatIdx: index().on(table.chatId),
    messageIdx: index().on(table.messageId),
  })
);

export const messageFeedback = pgTable(
  'MessageFeedback',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    chatId: text('chatId').notNull(),
    messageId: text('messageId').notNull(),
    type: feedbackTypeEnum('type').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserMessage: uniqueIndex().on(table.userId, table.messageId),
    userIdx: index().on(table.userId),
    chatIdx: index().on(table.chatId),
    messageIdx: index().on(table.messageId),
  })
);

// ASCII Artwork Tables
export const asciiArtworks = pgTable(
  'AsciiArtwork',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    prompt: text('prompt').notNull(),
    frames: json('frames').notNull(), // Array of ASCII frames (data.json format)
    parentId: text('parentId'), // For remixes/modifications
    metadata: json('metadata'), // { width, height, fps, frameCount, generator, model }
    visibility: visibilityEnum('visibility').default('private').notNull(),
    viewCount: integer('viewCount').default(0).notNull(),
    remixCount: integer('remixCount').default(0).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index().on(table.userId),
    parentIdx: index().on(table.parentId),
    visibilityIdx: index().on(table.visibility),
    createdAtIdx: index().on(table.createdAt),
  })
);

export const asciiCollections = pgTable(
  'AsciiCollection',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    visibility: visibilityEnum('visibility').default('private').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index().on(table.userId),
    visibilityIdx: index().on(table.visibility),
  })
);

export const asciiCollectionItems = pgTable(
  'AsciiCollectionItem',
  {
    id: text('id').primaryKey(),
    collectionId: text('collectionId').notNull(),
    artworkId: text('artworkId').notNull(),
    order: integer('order').default(0).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueCollectionArtwork: uniqueIndex().on(table.collectionId, table.artworkId),
    collectionIdx: index().on(table.collectionId),
    artworkIdx: index().on(table.artworkId),
  })
);

export const asciiShares = pgTable(
  'AsciiShare',
  {
    id: text('id').primaryKey(),
    artworkId: text('artworkId').notNull(),
    shareUrl: text('shareUrl').notNull().unique(),
    expiresAt: timestamp('expiresAt', { mode: 'date' }),
    password: text('password'), // Optional password protection
    maxViews: integer('maxViews'), // Optional view limit
    currentViews: integer('currentViews').default(0).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    artworkIdx: index().on(table.artworkId),
    shareUrlIdx: index().on(table.shareUrl),
  })
);

export const asciiGenerationHistory = pgTable(
  'AsciiGenerationHistory',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    artworkId: text('artworkId'),
    prompt: text('prompt').notNull(),
    modifiedPrompt: text('modifiedPrompt'), // If AI modified the prompt
    model: text('model').notNull(),
    tokensUsed: integer('tokensUsed'),
    generationTime: integer('generationTime'), // In milliseconds
    success: boolean('success').notNull(),
    error: text('error'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index().on(table.userId),
    artworkIdx: index().on(table.artworkId),
    createdAtIdx: index().on(table.createdAt),
  })
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  chats: many(chats),
  projects: many(projects),
  workspaces: many(workspaces),
  tasks: many(tasks),
  sharedLinks: many(sharedLinks),
  messageFeedback: many(messageFeedback),
  aiSettings: one(aiSettings, {
    fields: [users.id],
    references: [aiSettings.userId],
  }),
  appearanceSettings: one(appearanceSettings, {
    fields: [users.id],
    references: [appearanceSettings.userId],
  }),
  dataSettings: one(dataSettings, {
    fields: [users.id],
    references: [dataSettings.userId],
  }),
  notificationSettings: one(notificationSettings, {
    fields: [users.id],
    references: [notificationSettings.userId],
  }),
  profileSettings: one(profileSettings, {
    fields: [users.id],
    references: [profileSettings.userId],
  }),
  asciiArtworks: many(asciiArtworks),
  asciiCollections: many(asciiCollections),
  asciiGenerationHistory: many(asciiGenerationHistory),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [chats.projectId],
    references: [projects.id],
  }),
  outputs: many(outputs),
  sharedLinks: many(sharedLinks),
  attachments: many(attachments),
  messageFeedback: many(messageFeedback),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  chats: many(chats),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, {
    fields: [workspaces.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [tasks.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const outputsRelations = relations(outputs, ({ one, many }) => ({
  chat: one(chats, {
    fields: [outputs.chatId],
    references: [chats.id],
  }),
  versions: many(outputVersions),
}));

export const outputVersionsRelations = relations(outputVersions, ({ one }) => ({
  output: one(outputs, {
    fields: [outputVersions.outputId],
    references: [outputs.id],
  }),
}));

export const sharedLinksRelations = relations(sharedLinks, ({ one }) => ({
  chat: one(chats, {
    fields: [sharedLinks.chatId],
    references: [chats.id],
  }),
  owner: one(users, {
    fields: [sharedLinks.ownerId],
    references: [users.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  chat: one(chats, {
    fields: [attachments.chatId],
    references: [chats.id],
  }),
}));

export const messageFeedbackRelations = relations(
  messageFeedback,
  ({ one }) => ({
    user: one(users, {
      fields: [messageFeedback.userId],
      references: [users.id],
    }),
    chat: one(chats, {
      fields: [messageFeedback.chatId],
      references: [chats.id],
    }),
  })
);

// ASCII Relations
export const asciiArtworksRelations = relations(asciiArtworks, ({ one, many }) => ({
  user: one(users, {
    fields: [asciiArtworks.userId],
    references: [users.id],
  }),
  parent: one(asciiArtworks, {
    fields: [asciiArtworks.parentId],
    references: [asciiArtworks.id],
  }),
  remixes: many(asciiArtworks),
  collectionItems: many(asciiCollectionItems),
  shares: many(asciiShares),
  generationHistory: one(asciiGenerationHistory, {
    fields: [asciiArtworks.id],
    references: [asciiGenerationHistory.artworkId],
  }),
}));

export const asciiCollectionsRelations = relations(asciiCollections, ({ one, many }) => ({
  user: one(users, {
    fields: [asciiCollections.userId],
    references: [users.id],
  }),
  items: many(asciiCollectionItems),
}));

export const asciiCollectionItemsRelations = relations(asciiCollectionItems, ({ one }) => ({
  collection: one(asciiCollections, {
    fields: [asciiCollectionItems.collectionId],
    references: [asciiCollections.id],
  }),
  artwork: one(asciiArtworks, {
    fields: [asciiCollectionItems.artworkId],
    references: [asciiArtworks.id],
  }),
}));

export const asciiSharesRelations = relations(asciiShares, ({ one }) => ({
  artwork: one(asciiArtworks, {
    fields: [asciiShares.artworkId],
    references: [asciiArtworks.id],
  }),
}));

export const asciiGenerationHistoryRelations = relations(asciiGenerationHistory, ({ one }) => ({
  user: one(users, {
    fields: [asciiGenerationHistory.userId],
    references: [users.id],
  }),
  artwork: one(asciiArtworks, {
    fields: [asciiGenerationHistory.artworkId],
    references: [asciiArtworks.id],
  }),
}));
