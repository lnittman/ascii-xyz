'use client';

import { useState, useCallback } from 'react';
import { createGifFromFrames, downloadGif, type GifExportOptions } from '@/lib/export/gif';
import {
  createVideoFromFrames,
  downloadVideo,
  isVideoExportSupported,
  type VideoExportOptions,
} from '@/lib/export/video';

export type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

interface ArtworkLike {
  _id: string;
  frames: string[];
  metadata: {
    fps: number;
  };
}

interface ExportGifOptions {
  filename?: string;
  download?: boolean;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
}

interface UseExportGifReturn {
  status: ExportStatus;
  error: string | undefined;
  progress: number;
  exportGif: (artwork: ArtworkLike, options?: ExportGifOptions) => Promise<Blob | undefined>;
  reset: () => void;
}

/**
 * Hook for exporting ASCII artwork as animated GIF
 */
export function useExportGif(): UseExportGifReturn {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [error, setError] = useState<string | undefined>();
  const [progress, setProgress] = useState(0);

  const exportGif = useCallback(
    async (artwork: ArtworkLike, options: ExportGifOptions = {}): Promise<Blob | undefined> => {
      const {
        filename,
        download: shouldDownload = true,
        backgroundColor,
        textColor,
        fontSize,
        padding,
      } = options;

      setStatus('loading');
      setError(undefined);
      setProgress(0);

      try {
        const gifOptions: GifExportOptions = {
          frames: artwork.frames,
          fps: artwork.metadata.fps || 12,
          backgroundColor,
          textColor,
          fontSize,
          padding,
        };

        const blob = await createGifFromFrames(gifOptions);

        if (shouldDownload) {
          const outputFilename = filename || `ascii-${artwork._id}.gif`;
          downloadGif(blob, outputFilename);
        }

        setStatus('success');
        setProgress(100);
        return blob;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Export failed';
        setError(message);
        setStatus('error');
        return undefined;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(undefined);
    setProgress(0);
  }, []);

  return {
    status,
    error,
    progress,
    exportGif,
    reset,
  };
}

interface ExportVideoOptions {
  filename?: string;
  download?: boolean;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
}

interface UseExportVideoReturn {
  status: ExportStatus;
  error: string | undefined;
  progress: number;
  isSupported: boolean;
  exportVideo: (artwork: ArtworkLike, options?: ExportVideoOptions) => Promise<Blob | undefined>;
  reset: () => void;
}

/**
 * Hook for exporting ASCII artwork as WebM video
 */
export function useExportVideo(): UseExportVideoReturn {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [error, setError] = useState<string | undefined>();
  const [progress, setProgress] = useState(0);

  const isSupported = typeof window !== 'undefined' && isVideoExportSupported();

  const exportVideo = useCallback(
    async (artwork: ArtworkLike, options: ExportVideoOptions = {}): Promise<Blob | undefined> => {
      const {
        filename,
        download: shouldDownload = true,
        backgroundColor,
        textColor,
        fontSize,
        padding,
      } = options;

      if (!isVideoExportSupported()) {
        setError('Video export not supported in this browser');
        setStatus('error');
        return undefined;
      }

      setStatus('loading');
      setError(undefined);
      setProgress(0);

      try {
        const videoOptions: VideoExportOptions = {
          frames: artwork.frames,
          fps: artwork.metadata.fps || 12,
          backgroundColor,
          textColor,
          fontSize,
          padding,
        };

        const blob = await createVideoFromFrames(videoOptions);

        if (shouldDownload) {
          const outputFilename = filename || `ascii-${artwork._id}.webm`;
          downloadVideo(blob, outputFilename);
        }

        setStatus('success');
        setProgress(100);
        return blob;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Video export failed';
        setError(message);
        setStatus('error');
        return undefined;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(undefined);
    setProgress(0);
  }, []);

  return {
    status,
    error,
    progress,
    isSupported,
    exportVideo,
    reset,
  };
}
