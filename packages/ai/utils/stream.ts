/**
 * Convert a ReadableStream to an async iterator
 */
export async function* streamToAsyncIterator(
  stream: ReadableStream
): AsyncIterableIterator<Uint8Array> {
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Parse SSE (Server-Sent Events) from a stream
 */
export async function* parseSSEStream(
  stream: ReadableStream
): AsyncIterableIterator<any> {
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of streamToAsyncIterator(stream)) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');

    // Keep the last incomplete line in the buffer
    buffer = lines.at(-1);

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();

      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          return;
        }

        try {
          yield JSON.parse(data);
        } catch (_e) {}
      }
    }
  }
}

/**
 * Create a TransformStream for SSE formatting
 */
export function createSSETransformStream(): TransformStream {
  const encoder = new TextEncoder();

  return new TransformStream({
    transform(chunk: any, controller) {
      const data = typeof chunk === 'string' ? chunk : JSON.stringify(chunk);
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
    },

    flush(controller) {
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    },
  });
}

/**
 * Merge multiple streams into one
 */
export function mergeStreams(...streams: ReadableStream[]): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      const readers = streams.map((s) => s.getReader());

      await Promise.all(
        readers.map(async (reader) => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              controller.enqueue(value);
            }
          } finally {
            reader.releaseLock();
          }
        })
      );

      controller.close();
    },
  });
}
