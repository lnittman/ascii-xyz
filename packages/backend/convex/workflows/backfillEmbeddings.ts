import { v } from 'convex/values';
import { WorkflowManager } from '@convex-dev/workflow';
import { components, internal, api } from '../_generated/api';
import { internalMutation, internalQuery } from '../_generated/server';
import { Id } from '../_generated/dataModel';

// Create workflow manager
const workflow = new WorkflowManager(components.workflow);

// Batch size for pagination
const BATCH_SIZE = 50;

// Internal query to get artworks that need embeddings
export const getArtworksNeedingEmbeddings = internalQuery({
  args: {
    cursor: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, { cursor, limit }) => {
    // Get a batch of artworks
    const artworksQuery = ctx.db.query('artworks').order('desc');

    const paginationResult = await artworksQuery.paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // For each artwork, check if it has an embedding
    const artworksNeedingEmbeddings: Id<'artworks'>[] = [];

    for (const artwork of paginationResult.page) {
      const existingEmbedding = await ctx.db
        .query('artworkEmbeddings')
        .withIndex('by_artwork', (q) => q.eq('artworkId', artwork._id))
        .first();

      if (!existingEmbedding) {
        artworksNeedingEmbeddings.push(artwork._id);
      }
    }

    return {
      artworkIds: artworksNeedingEmbeddings,
      cursor: paginationResult.continueCursor,
      isDone: paginationResult.isDone,
      totalInBatch: paginationResult.page.length,
    };
  },
});

// Internal mutation to record backfill progress
export const recordBackfillProgress = internalMutation({
  args: {
    workflowId: v.string(),
    processed: v.number(),
    embedded: v.number(),
    errors: v.number(),
    status: v.union(v.literal('running'), v.literal('completed'), v.literal('failed')),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Log progress - could also store in a backfillRuns table
    console.log(`Backfill ${args.workflowId}: ${args.status} - processed ${args.processed}, embedded ${args.embedded}, errors ${args.errors}`);
  },
});

// Define the backfill workflow
export const backfillEmbeddingsWorkflow = workflow.define({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (step, args) => {
    const batchSize = args.batchSize ?? BATCH_SIZE;
    let cursor: string | undefined = undefined;
    let totalProcessed = 0;
    let totalEmbedded = 0;
    let totalErrors = 0;
    let batchNumber = 0;

    // Process batches until done
    while (true) {
      batchNumber++;

      // Get next batch of artworks needing embeddings
      const result = await step.runQuery(
        internal.workflows.backfillEmbeddings.getArtworksNeedingEmbeddings,
        { cursor, limit: batchSize }
      );

      console.log(`Backfill batch ${batchNumber}: ${result.artworkIds.length} artworks need embeddings (${result.totalInBatch} checked)`);

      // Generate embeddings for each artwork in this batch
      for (const artworkId of result.artworkIds) {
        try {
          await step.runAction(api.embeddings.generateForArtwork, {
            artworkId,
          });
          totalEmbedded++;
        } catch (error) {
          console.error(`Failed to generate embedding for ${artworkId}:`, error);
          totalErrors++;
        }
      }

      totalProcessed += result.totalInBatch;

      // Check if we're done
      if (result.isDone) {
        break;
      }

      cursor = result.cursor ?? undefined;
    }

    // Record final progress
    await step.runMutation(
      internal.workflows.backfillEmbeddings.recordBackfillProgress,
      {
        workflowId: 'backfill-embeddings',
        processed: totalProcessed,
        embedded: totalEmbedded,
        errors: totalErrors,
        status: 'completed',
      }
    );

    return {
      processed: totalProcessed,
      embedded: totalEmbedded,
      errors: totalErrors,
      batches: batchNumber,
    };
  },
});

// Start the backfill workflow (must be called from mutation context)
export const startBackfill = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workflowId = await workflow.start(
      ctx,
      internal.workflows.backfillEmbeddings.backfillEmbeddingsWorkflow,
      { batchSize: args.batchSize }
    );
    console.log(`Started backfill workflow: ${workflowId}`);
    return workflowId;
  },
});
