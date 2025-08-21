'use client';

import { Empty } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import type React from 'react';
import { useState } from 'react';

import { promptFocusedAtom } from '@/atoms/chat';
import { selectedModelIdAtom } from '@/atoms/models';
import {
  currentWorkspaceAtom,
  currentWorkspaceIdAtom,
} from '@/atoms/workspace';
import { WorkspaceDropdown } from '@/components/code/WorkspaceDropdown';
import { TaskList } from '@/components/code/task-list';
import { PromptBar } from '@/components/shared/prompt-bar';
import { Tab, TabsList, TabsMinimal } from '@/components/shared/tabs-minimal';
import { useAttachmentModals } from '@/hooks/attachment/use-attachment-modals';
import { useCreateTask } from '@/hooks/code/task/mutations';
import { useWorkspaceTasks } from '@/hooks/code/task/queries';
import { useWorkspaces } from '@/hooks/code/workspace/queries';

export default function CodePage(): React.ReactElement {
  // Load workspaces and sync to global state
  useWorkspaces();

  const [currentWorkspaceId, _setCurrentWorkspaceId] = useAtom(
    currentWorkspaceIdAtom
  );
  const [currentWorkspace] = useAtom(currentWorkspaceAtom);
  const { tasks } = useWorkspaceTasks(currentWorkspaceId);
  const { createTask } = useCreateTask();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromptFocused, setIsPromptFocused] = useAtom(promptFocusedAtom);
  const [selectedModelId, setSelectedModelId] = useAtom(selectedModelIdAtom);
  const [activeTab, setActiveTab] = useState<'tasks' | 'archive'>('tasks');

  // Attachment modals hook
  const { previewAttachment } = useAttachmentModals();

  const handleSubmit = async (cmd: string) => {
    if (!currentWorkspaceId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask({ workspaceId: currentWorkspaceId, prompt: cmd });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  // Filter tasks based on active tab and status
  const activeTasks =
    tasks?.filter((task) => task.status !== 'completed') || [];
  const archivedTasks =
    tasks?.filter((task) => task.status === 'completed') || [];
  const displayTasks = activeTab === 'tasks' ? activeTasks : archivedTasks;

  const hasWorkspace = !!currentWorkspace;
  const showNoWorkspaceState = !hasWorkspace;

  return (
    <div className="min-h-screen bg-background">
      {/* Main content area with centered layout */}
      <div className="flex flex-col items-center justify-start px-6 pt-20">
        {/* Input area */}
        <div className="mb-8 w-full max-w-2xl">
          <PromptBar
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isFocused={isPromptFocused}
            onFocusChange={setIsPromptFocused}
            onAttachmentPreview={previewAttachment}
            selectedModelId={selectedModelId}
            onModelChange={handleModelChange}
            placeholder={
              hasWorkspace ? 'describe a task' : 'select a workspace first'
            }
            disabled={showNoWorkspaceState}
          />
        </div>

        {/* Task list section - always show tabs */}
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            {/* Tabs header with workspace dropdown */}
            <div className="mb-4 flex items-center justify-between">
              <TabsMinimal
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as 'tasks' | 'archive')
                }
              >
                <TabsList>
                  <Tab value="tasks">tasks</Tab>
                  <Tab value="archive">archive</Tab>
                </TabsList>
              </TabsMinimal>

              {/* Workspace dropdown on the right */}
              <WorkspaceDropdown size="sm" />
            </div>

            {/* Animated tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {/* Task list or empty state */}
                {showNoWorkspaceState ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
                      <Empty
                        weight="duotone"
                        className="h-6 w-6 text-muted-foreground"
                      />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      select a workspace to view tasks
                    </p>
                  </div>
                ) : displayTasks.length > 0 ? (
                  <TaskList tasks={displayTasks} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
                      <Empty
                        weight="duotone"
                        className="h-6 w-6 text-muted-foreground"
                      />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {activeTab === 'tasks'
                        ? 'no tasks yet'
                        : 'no archived tasks yet'}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
