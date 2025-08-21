CREATE TYPE "public"."DaemonStatus" AS ENUM('connected', 'disconnected', 'syncing');--> statement-breakpoint
CREATE TYPE "public"."FeedbackType" AS ENUM('helpful', 'not_helpful');--> statement-breakpoint
CREATE TYPE "public"."OutputType" AS ENUM('document', 'code', 'markdown', 'html', 'json', 'text', 'diagram', 'table');--> statement-breakpoint
CREATE TYPE "public"."ProjectKind" AS ENUM('chat', 'code');--> statement-breakpoint
CREATE TYPE "public"."TaskStatus" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "AISettings" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"defaultModelId" text DEFAULT 'google/gemini-2.5-flash-preview-05-20',
	"customInstructions" text,
	"branchFormat" text DEFAULT 'arbor/{feature}',
	"allowTraining" boolean DEFAULT true NOT NULL,
	"openaiApiKey" text,
	"anthropicApiKey" text,
	"googleApiKey" text,
	"openrouterApiKey" text,
	"enabledModels" json DEFAULT '{}'::json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "AISettings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "AppearanceSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"fontFamily" text DEFAULT 'iosevka-term' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "AppearanceSettings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "Attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"chatId" text NOT NULL,
	"messageId" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"size" integer NOT NULL,
	"mimeType" text NOT NULL,
	"content" text,
	"metadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Chat" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"userId" text NOT NULL,
	"projectId" text,
	"activeModel" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "DataSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"hideSharedWarning" boolean DEFAULT false NOT NULL,
	"usageAnalyticsEnabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "DataSettings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "MessageFeedback" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"chatId" text NOT NULL,
	"messageId" text NOT NULL,
	"type" "FeedbackType" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "NotificationSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"notifyProcessingComplete" boolean DEFAULT true NOT NULL,
	"notifyProcessingFailed" boolean DEFAULT true NOT NULL,
	"notifyWeeklySummary" boolean DEFAULT false NOT NULL,
	"notifyFeatureUpdates" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "NotificationSettings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "OutputVersion" (
	"id" text PRIMARY KEY NOT NULL,
	"outputId" text NOT NULL,
	"content" text NOT NULL,
	"metadata" json,
	"version" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Output" (
	"id" text PRIMARY KEY NOT NULL,
	"chatId" text NOT NULL,
	"messageId" text NOT NULL,
	"title" text NOT NULL,
	"type" "OutputType" NOT NULL,
	"content" text NOT NULL,
	"metadata" json,
	"isPinned" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProfileSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"displayName" text,
	"username" text,
	"phoneNumber" text,
	"tier" text DEFAULT 'free' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ProfileSettings_userId_unique" UNIQUE("userId"),
	CONSTRAINT "ProfileSettings_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "Project" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"userId" text NOT NULL,
	"description" text,
	"imageUrl" text,
	"instructions" text,
	"files" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"kind" "ProjectKind" DEFAULT 'chat' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SharedLink" (
	"id" text PRIMARY KEY NOT NULL,
	"chatId" text NOT NULL,
	"ownerId" text NOT NULL,
	"accessToken" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"messageCountAtShare" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp,
	CONSTRAINT "SharedLink_accessToken_unique" UNIQUE("accessToken")
);
--> statement-breakpoint
CREATE TABLE "Task" (
	"id" text PRIMARY KEY NOT NULL,
	"workspaceId" text NOT NULL,
	"userId" text NOT NULL,
	"prompt" text NOT NULL,
	"status" "TaskStatus" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"description" text,
	"error" text,
	"output" text,
	"startedAt" timestamp,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"clerkId" text NOT NULL,
	"activeModel" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_clerkId_unique" UNIQUE("clerkId")
);
--> statement-breakpoint
CREATE TABLE "Workspace" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"daemonId" text,
	"daemonStatus" "DaemonStatus" DEFAULT 'disconnected' NOT NULL,
	"lastDaemonHeartbeat" timestamp,
	"localPath" text
);
--> statement-breakpoint
CREATE INDEX "AISettings_userId_index" ON "AISettings" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "AppearanceSettings_userId_index" ON "AppearanceSettings" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Attachment_chatId_index" ON "Attachment" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "Attachment_messageId_index" ON "Attachment" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "Chat_projectId_index" ON "Chat" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "Chat_userId_index" ON "Chat" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "DataSettings_userId_index" ON "DataSettings" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "MessageFeedback_userId_messageId_index" ON "MessageFeedback" USING btree ("userId","messageId");--> statement-breakpoint
CREATE INDEX "MessageFeedback_userId_index" ON "MessageFeedback" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "MessageFeedback_chatId_index" ON "MessageFeedback" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "MessageFeedback_messageId_index" ON "MessageFeedback" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "NotificationSettings_userId_index" ON "NotificationSettings" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "OutputVersion_outputId_version_index" ON "OutputVersion" USING btree ("outputId","version");--> statement-breakpoint
CREATE INDEX "OutputVersion_outputId_index" ON "OutputVersion" USING btree ("outputId");--> statement-breakpoint
CREATE INDEX "Output_chatId_index" ON "Output" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "Output_messageId_index" ON "Output" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "Output_type_index" ON "Output" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ProfileSettings_userId_index" ON "ProfileSettings" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "ProfileSettings_username_index" ON "ProfileSettings" USING btree ("username");--> statement-breakpoint
CREATE INDEX "Project_userId_index" ON "Project" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "SharedLink_accessToken_index" ON "SharedLink" USING btree ("accessToken");--> statement-breakpoint
CREATE INDEX "SharedLink_chatId_index" ON "SharedLink" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "SharedLink_ownerId_index" ON "SharedLink" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "Task_status_index" ON "Task" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Task_userId_index" ON "Task" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Task_workspaceId_index" ON "Task" USING btree ("workspaceId");--> statement-breakpoint
CREATE INDEX "Workspace_daemonId_index" ON "Workspace" USING btree ("daemonId");--> statement-breakpoint
CREATE INDEX "Workspace_userId_index" ON "Workspace" USING btree ("userId");