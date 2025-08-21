'use client';

import React from 'react';

import { Project } from '@/components/app/project';

export default function ProjectPage({
  params,
}: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = React.use(params);
  const { projectId } = resolvedParams;

  return (
    <div className="min-h-screen bg-background">
      <Project projectId={projectId} />
    </div>
  );
}
