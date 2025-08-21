/**
 * attachment embeddings service for ai
 * uses openai embeddings for production deployment
 * more reliable and smaller bundle size than fastembed
 */

import { openai } from '@ai-sdk/openai';

// Import AI SDK functions from external package
// Mastra doesn't re-export these from 'ai' package
const { embed, embedMany } = await import('ai');

/**
 * generate embedding for a single attachment
 * uses openai text-embedding-3-small for consistency with agent memory
 */
export async function generateAttachmentEmbedding(text: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });

  return embedding;
}

/**
 * generate embeddings for multiple attachments
 * uses openai text-embedding-3-small for consistency with agent memory
 */
export async function generateAttachmentEmbeddings(texts: string[]) {
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: texts,
  });

  return embeddings;
}

/**
 * search for similar attachments using cosine similarity
 * this is a simple implementation - in production you'd use pgvector
 */
export function findSimilarAttachments(
  queryEmbedding: number[],
  attachmentEmbeddings: Array<{
    id: string;
    embedding: number[];
    metadata: any;
  }>,
  topK = 5
) {
  // calculate cosine similarity
  const similarities = attachmentEmbeddings.map((item) => {
    const similarity = cosineSimilarity(queryEmbedding, item.embedding);
    return { ...item, similarity };
  });

  // sort by similarity and return top k
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
