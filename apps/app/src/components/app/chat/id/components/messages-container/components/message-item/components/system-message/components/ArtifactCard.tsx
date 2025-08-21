'use client';

import {
  ChartLine,
  Code,
  FileCode,
  FileDashed,
  FileHtml,
  FileText,
  Table,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useSetAtom } from 'jotai';
import type React from 'react';

import {
  outputPanelOpenAtom,
  selectedOutputIdAtom,
} from '@/atoms/layout/output';
import { cn } from '@/lib/utils';

interface ArtifactCardProps {
  outputId: string;
  title: string;
  type: string;
  isStreaming?: boolean;
}

// Map types to icons and colors
const typeConfig: Record<
  string,
  { icon: React.ComponentType<any>; color: string; label: string }
> = {
  code: {
    icon: FileCode,
    color: 'text-blue-600 bg-blue-500/10',
    label: 'code',
  },
  markdown: {
    icon: FileText,
    color: 'text-emerald-600 bg-emerald-500/10',
    label: 'document',
  },
  html: {
    icon: FileHtml,
    color: 'text-orange-600 bg-orange-500/10',
    label: 'html',
  },
  json: {
    icon: Code,
    color: 'text-purple-600 bg-purple-500/10',
    label: 'json',
  },
  text: {
    icon: FileDashed,
    color: 'text-gray-600 bg-gray-500/10',
    label: 'text',
  },
  table: { icon: Table, color: 'text-cyan-600 bg-cyan-500/10', label: 'table' },
  mermaid: {
    icon: ChartLine,
    color: 'text-indigo-600 bg-indigo-500/10',
    label: 'diagram',
  },
  document: {
    icon: FileText,
    color: 'text-emerald-600 bg-emerald-500/10',
    label: 'document',
  }, // fallback
};

export function ArtifactCard({
  outputId,
  title,
  type,
  isStreaming = false,
}: ArtifactCardProps) {
  const setOutputPanelOpen = useSetAtom(outputPanelOpenAtom);
  const setSelectedOutputId = useSetAtom(selectedOutputIdAtom);

  const config = typeConfig[type] || typeConfig.document;
  const Icon = config.icon;

  const handleClick = () => {
    setSelectedOutputId(outputId);
    setOutputPanelOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'my-3 overflow-hidden rounded-lg border border-border/60',
        'transition-all duration-200 hover:border-border',
        'group cursor-pointer',
        isStreaming && 'border-purple-500/40'
      )}
      onClick={handleClick}
    >
      <div className="bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Icon with colored background */}
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              config.color
            )}
          >
            <Icon weight="duotone" size={20} />
          </div>

          {/* Title and type */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-foreground text-sm">
              {title}
            </h3>
            <p className="mt-0.5 text-muted-foreground text-xs">
              {config.label} artifact
              {isStreaming && ' • generating...'}
            </p>
          </div>

          {/* View button */}
          <div className="flex items-center gap-2">
            {isStreaming && (
              <div className="flex gap-1">
                <motion.div
                  className="h-1.5 w-1.5 rounded-full bg-purple-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
                <motion.div
                  className="h-1.5 w-1.5 rounded-full bg-purple-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: 0.5,
                  }}
                />
                <motion.div
                  className="h-1.5 w-1.5 rounded-full bg-purple-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: 1,
                  }}
                />
              </div>
            )}

            <button className="font-medium text-muted-foreground text-xs transition-colors hover:text-foreground">
              view
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
