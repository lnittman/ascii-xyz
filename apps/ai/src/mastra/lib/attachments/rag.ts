/**
 * attachment rag service for ai
 * uses mastra memory with fastembed for embeddings
 * designed to work when deployed to mastra cloud
 */

import { generateAttachmentEmbedding } from './embeddings';

// In-memory storage for attachments with embeddings
// In production, this would use pgvector for persistence
const attachmentStore = new Map<
  string,
  Array<{
    attachmentId: string;
    chatId: string;
    content: string;
    embedding?: number[];
    metadata: {
      name: string;
      type: string;
      size: number;
      mimeType: string;
    };
  }>
>();

/**
 * process and store attachment with embeddings
 */
export async function processAttachmentForRAG(options: {
  chatId: string;
  attachmentId: string;
  content: string;
  metadata: {
    name: string;
    type: string;
    size: number;
    mimeType: string;
  };
}) {
  const { chatId, attachmentId, content, metadata } = options;

  try {
    // Generate embedding for the content
    const embedding = await generateAttachmentEmbedding(content);

    // Get existing attachments for this chat
    const chatAttachments = attachmentStore.get(chatId) || [];

    // Add new attachment
    chatAttachments.push({
      attachmentId,
      chatId,
      content,
      embedding,
      metadata,
    });

    // Store back in map
    attachmentStore.set(chatId, chatAttachments);
  } catch (_error) {
    // Store without embedding if generation fails
    const chatAttachments = attachmentStore.get(chatId) || [];
    chatAttachments.push({
      attachmentId,
      chatId,
      content,
      metadata,
    });
    attachmentStore.set(chatId, chatAttachments);
  }
}

/**
 * search attachments using semantic search
 */
export async function searchAttachments(
  chatId: string,
  query: string,
  topK = 5
): Promise<
  Array<{
    attachmentId?: string;
    content: string;
    metadata: {
      name?: string;
      type?: string;
      size?: number;
      mimeType?: string;
    };
    score: number;
  }>
> {
  try {
    const chatAttachments = attachmentStore.get(chatId) || [];

    if (chatAttachments.length === 0) {
      return [];
    }

    // Generate embedding for query
    const queryEmbedding = await generateAttachmentEmbedding(query);

    // Calculate similarity scores
    const results = chatAttachments
      .filter((att) => att.embedding) // Only attachments with embeddings
      .map((attachment) => {
        const score = cosineSimilarity(queryEmbedding, attachment.embedding!);
        return {
          attachmentId: attachment.attachmentId,
          content: attachment.content,
          metadata: attachment.metadata,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    return results;
  } catch (_error) {
    // Fallback to text search if embeddings fail
    const chatAttachments = attachmentStore.get(chatId) || [];
    return chatAttachments
      .filter((att) => att.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, topK)
      .map((att) => ({
        attachmentId: att.attachmentId,
        content: att.content,
        metadata: att.metadata,
        score: 0.5, // Default score for text matches
      }));
  }
}

/**
 * calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
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

/**
 * get all attachments for a chat
 */
export async function getChatAttachments(chatId: string): Promise<
  Array<{
    attachmentId: string;
    name: string;
    type: string;
    size: number;
    mimeType: string;
    content: string;
  }>
> {
  const chatAttachments = attachmentStore.get(chatId) || [];

  return chatAttachments.map((att) => ({
    attachmentId: att.attachmentId,
    name: att.metadata.name,
    type: att.metadata.type,
    size: att.metadata.size,
    mimeType: att.metadata.mimeType,
    content: att.content,
  }));
}

/**
 * delete attachments for a chat
 */
export async function deleteChatAttachments(chatId: string): Promise<void> {
  attachmentStore.delete(chatId);
}
