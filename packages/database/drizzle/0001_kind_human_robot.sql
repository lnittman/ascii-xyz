CREATE TYPE "public"."Visibility" AS ENUM('public', 'private', 'unlisted');--> statement-breakpoint
CREATE TABLE "AsciiArtwork" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"prompt" text NOT NULL,
	"frames" json NOT NULL,
	"parentId" text,
	"metadata" json,
	"visibility" "Visibility" DEFAULT 'private' NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"remixCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AsciiCollectionItem" (
	"id" text PRIMARY KEY NOT NULL,
	"collectionId" text NOT NULL,
	"artworkId" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AsciiCollection" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"visibility" "Visibility" DEFAULT 'private' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AsciiGenerationHistory" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"artworkId" text,
	"prompt" text NOT NULL,
	"modifiedPrompt" text,
	"model" text NOT NULL,
	"tokensUsed" integer,
	"generationTime" integer,
	"success" boolean NOT NULL,
	"error" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AsciiShare" (
	"id" text PRIMARY KEY NOT NULL,
	"artworkId" text NOT NULL,
	"shareUrl" text NOT NULL,
	"expiresAt" timestamp,
	"password" text,
	"maxViews" integer,
	"currentViews" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "AsciiShare_shareUrl_unique" UNIQUE("shareUrl")
);
--> statement-breakpoint
CREATE INDEX "AsciiArtwork_userId_index" ON "AsciiArtwork" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "AsciiArtwork_parentId_index" ON "AsciiArtwork" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "AsciiArtwork_visibility_index" ON "AsciiArtwork" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "AsciiArtwork_createdAt_index" ON "AsciiArtwork" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "AsciiCollectionItem_collectionId_artworkId_index" ON "AsciiCollectionItem" USING btree ("collectionId","artworkId");--> statement-breakpoint
CREATE INDEX "AsciiCollectionItem_collectionId_index" ON "AsciiCollectionItem" USING btree ("collectionId");--> statement-breakpoint
CREATE INDEX "AsciiCollectionItem_artworkId_index" ON "AsciiCollectionItem" USING btree ("artworkId");--> statement-breakpoint
CREATE INDEX "AsciiCollection_userId_index" ON "AsciiCollection" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "AsciiCollection_visibility_index" ON "AsciiCollection" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "AsciiGenerationHistory_userId_index" ON "AsciiGenerationHistory" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "AsciiGenerationHistory_artworkId_index" ON "AsciiGenerationHistory" USING btree ("artworkId");--> statement-breakpoint
CREATE INDEX "AsciiGenerationHistory_createdAt_index" ON "AsciiGenerationHistory" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "AsciiShare_artworkId_index" ON "AsciiShare" USING btree ("artworkId");--> statement-breakpoint
CREATE INDEX "AsciiShare_shareUrl_index" ON "AsciiShare" USING btree ("shareUrl");