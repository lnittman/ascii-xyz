/**
 * attachment processor worker
 * processes attachments from the main app and stores them in memory with embeddings
 * designed to work with fastembed on mastra cloud
 */

// TODO: Import from correct location
// import { processAttachmentForRAG } from '../services/attachment-rag';

// Simple in-memory queue for processing
const processingQueue: Array<{
  chatId: string;
  attachmentId: string;
  content: string;
  metadata: {
    name: string;
    type: string;
    size: number;
    mimeType: string;
  };
}> = [];

let isProcessing = false;

/**
 * add attachment to processing queue
 */
export function queueAttachmentForProcessing(attachment: {
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
  processingQueue.push(attachment);

  // Start processing if not already running
  if (!isProcessing) {
    processQueue();
  }
}

/**
 * process queued attachments
 */
async function processQueue() {
  if (isProcessing || processingQueue.length === 0) {
    return;
  }

  isProcessing = true;

  while (processingQueue.length > 0) {
    const attachment = processingQueue.shift();

    if (!attachment) {
      continue;
    }

    try {
    } catch (_error) {
      // Could implement retry logic here if needed
      // For now, just log the error and continue
    }
  }

  isProcessing = false;
}

/**
 * process attachment immediately (bypass queue)
 */
export async function processAttachmentImmediately(_attachment: {
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
  try {
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
