export interface AttachmentMetadata {
  name: string;
  type: string;
  size: number;
  mimeType: string;
}

export interface ProcessAttachmentParams {
  chatId: string;
  attachmentId: string;
  content: string;
  metadata: AttachmentMetadata;
  immediate?: boolean;
}

export interface AttachmentResult {
  success: boolean;
  queued?: boolean;
  error?: string;
}

/**
 * Domain service for attachment processing
 * Wraps the custom attachment RAG functionality from apps/ai
 */
export class AttachmentService {
  private aiServiceUrl: string;

  constructor() {
    this.aiServiceUrl =
      process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:3999';
  }

  /**
   * Process an attachment for RAG (Retrieval Augmented Generation)
   * This is a custom endpoint specific to apps/ai, not part of standard Mastra
   */
  async processAttachment(
    params: ProcessAttachmentParams
  ): Promise<AttachmentResult> {
    try {
      const response = await fetch(
        `${this.aiServiceUrl}/api/attachments/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Request': 'true',
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new ApiError(
          ErrorType.SERVER_ERROR,
          `Failed to process attachment: ${error}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error instanceof ApiError
        ? error
        : new ApiError(ErrorType.SERVER_ERROR, 'Failed to process attachment');
    }
  }

  /**
   * Get attachments for a chat
   */
  async getChatAttachments(chatId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.aiServiceUrl}/api/attachments/${chatId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError(
          ErrorType.SERVER_ERROR,
          'Failed to fetch attachments'
        );
      }

      const data = await response.json();
      return data.attachments || [];
    } catch (error) {
      throw error instanceof ApiError
        ? error
        : new ApiError(ErrorType.SERVER_ERROR, 'Failed to fetch attachments');
    }
  }

  /**
   * Delete attachments for a chat
   */
  async deleteChatAttachments(chatId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.aiServiceUrl}/api/attachments/${chatId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError(
          ErrorType.SERVER_ERROR,
          'Failed to delete attachments'
        );
      }
    } catch (error) {
      throw error instanceof ApiError
        ? error
        : new ApiError(ErrorType.SERVER_ERROR, 'Failed to delete attachments');
    }
  }
}

export const attachmentService = new AttachmentService();
