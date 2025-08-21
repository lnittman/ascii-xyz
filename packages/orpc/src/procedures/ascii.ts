import { z } from 'zod';
import { createProcedure } from '../base';
import { database } from '@repo/database';
import { asciiArtworks, asciiGenerationHistory, asciiShares } from '@repo/database/schema';
import { eq, and, or, desc } from '@repo/database';
import { nanoid } from 'nanoid';

const visibilityEnum = z.enum(['public', 'private', 'unlisted']);

// Create ASCII artwork
export const createArtwork = createProcedure
  .protected()
  .input(
    z.object({
      prompt: z.string().min(1).max(1000),
      frames: z.array(z.string()),
      parentId: z.string().optional(),
      metadata: z.object({
        width: z.number(),
        height: z.number(),
        fps: z.number().default(12),
        frameCount: z.number(),
        generator: z.string(),
        model: z.string(),
      }),
      visibility: visibilityEnum.default('private'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const artworkId = nanoid();
    
    // Create artwork
    const [artwork] = await database
      .insert(asciiArtworks)
      .values({
        id: artworkId,
        userId: ctx.user.id,
        prompt: input.prompt,
        frames: input.frames,
        parentId: input.parentId,
        metadata: input.metadata,
        visibility: input.visibility,
      })
      .returning();
    
    // Log generation history
    await database.insert(asciiGenerationHistory).values({
      id: nanoid(),
      userId: ctx.user.id,
      artworkId: artwork.id,
      prompt: input.prompt,
      model: input.metadata.model,
      success: true,
      generationTime: Date.now(),
    });
    
    // If this is a remix, increment parent's remix count
    if (input.parentId) {
      await database
        .update(asciiArtworks)
        .set({ 
          remixCount: database.raw('remix_count + 1'),
          updatedAt: new Date(),
        })
        .where(eq(asciiArtworks.id, input.parentId));
    }
    
    return artwork;
  });

// Get user's artworks
export const listArtworks = createProcedure
  .protected()
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      visibility: visibilityEnum.optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const conditions = [eq(asciiArtworks.userId, ctx.user.id)];
    
    if (input.visibility) {
      conditions.push(eq(asciiArtworks.visibility, input.visibility));
    }
    
    const artworks = await database
      .select()
      .from(asciiArtworks)
      .where(and(...conditions))
      .orderBy(desc(asciiArtworks.createdAt))
      .limit(input.limit)
      .offset(input.offset);
    
    return artworks;
  });

// Get single artwork
export const getArtwork = createProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const [artwork] = await database
      .select()
      .from(asciiArtworks)
      .where(eq(asciiArtworks.id, input.id))
      .limit(1);
    
    if (!artwork) {
      throw new Error('Artwork not found');
    }
    
    // Check visibility permissions
    if (artwork.visibility === 'private' && artwork.userId !== ctx.user?.id) {
      throw new Error('Artwork is private');
    }
    
    // Increment view count for public/unlisted artworks
    if (artwork.visibility !== 'private' && artwork.userId !== ctx.user?.id) {
      await database
        .update(asciiArtworks)
        .set({ viewCount: database.raw('view_count + 1') })
        .where(eq(asciiArtworks.id, input.id));
    }
    
    return artwork;
  });

// Update artwork
export const updateArtwork = createProcedure
  .protected()
  .input(
    z.object({
      id: z.string(),
      prompt: z.string().min(1).max(1000).optional(),
      visibility: visibilityEnum.optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const [artwork] = await database
      .update(asciiArtworks)
      .set({
        ...(input.prompt && { prompt: input.prompt }),
        ...(input.visibility && { visibility: input.visibility }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(asciiArtworks.id, input.id),
          eq(asciiArtworks.userId, ctx.user.id)
        )
      )
      .returning();
    
    if (!artwork) {
      throw new Error('Artwork not found or unauthorized');
    }
    
    return artwork;
  });

// Delete artwork
export const deleteArtwork = createProcedure
  .protected()
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const [deleted] = await database
      .delete(asciiArtworks)
      .where(
        and(
          eq(asciiArtworks.id, input.id),
          eq(asciiArtworks.userId, ctx.user.id)
        )
      )
      .returning();
    
    if (!deleted) {
      throw new Error('Artwork not found or unauthorized');
    }
    
    return { success: true };
  });

// Create share link
export const createShareLink = createProcedure
  .protected()
  .input(
    z.object({
      artworkId: z.string(),
      expiresIn: z.number().optional(), // Hours
      password: z.string().optional(),
      maxViews: z.number().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    // Verify ownership
    const [artwork] = await database
      .select()
      .from(asciiArtworks)
      .where(
        and(
          eq(asciiArtworks.id, input.artworkId),
          eq(asciiArtworks.userId, ctx.user.id)
        )
      )
      .limit(1);
    
    if (!artwork) {
      throw new Error('Artwork not found or unauthorized');
    }
    
    const shareUrl = nanoid(10);
    const expiresAt = input.expiresIn 
      ? new Date(Date.now() + input.expiresIn * 60 * 60 * 1000)
      : null;
    
    const [share] = await database
      .insert(asciiShares)
      .values({
        id: nanoid(),
        artworkId: input.artworkId,
        shareUrl,
        expiresAt,
        password: input.password,
        maxViews: input.maxViews,
      })
      .returning();
    
    return {
      ...share,
      fullUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareUrl}`,
    };
  });

// Get public gallery
export const getPublicGallery = createProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['recent', 'popular', 'remixed']).default('recent'),
    })
  )
  .query(async ({ input }) => {
    let orderByClause;
    
    switch (input.sortBy) {
      case 'popular':
        orderByClause = desc(asciiArtworks.viewCount);
        break;
      case 'remixed':
        orderByClause = desc(asciiArtworks.remixCount);
        break;
      default:
        orderByClause = desc(asciiArtworks.createdAt);
    }
    
    const artworks = await database
      .select({
        id: asciiArtworks.id,
        prompt: asciiArtworks.prompt,
        frames: asciiArtworks.frames,
        metadata: asciiArtworks.metadata,
        viewCount: asciiArtworks.viewCount,
        remixCount: asciiArtworks.remixCount,
        createdAt: asciiArtworks.createdAt,
      })
      .from(asciiArtworks)
      .where(eq(asciiArtworks.visibility, 'public'))
      .orderBy(orderByClause)
      .limit(input.limit)
      .offset(input.offset);
    
    return artworks;
  });

// Export all procedures
export const asciiProcedures = {
  createArtwork,
  listArtworks,
  getArtwork,
  updateArtwork,
  deleteArtwork,
  createShareLink,
  getPublicGallery,
};