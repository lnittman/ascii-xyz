'use client';

import { Empty, Plus } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import type React from 'react';

import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

import { projectModalOpenAtom } from '@/atoms/layout/modal';
import { sidebarOpenAtom } from '@/atoms/layout/sidebar';
import { mobileProjectModalOpenAtom } from '@/atoms/mobile-menus';
import { currentProjectAtom } from '@/atoms/project';
import { ProjectMenu } from '@/components/shared/menu/project-menu';
import { useProjects } from '@/hooks/project/queries';
import type { Project } from '@repo/database/types';

interface ProjectsSectionProps {
  initialProjects?: Project[];
}

export function ProjectsSection({
  initialProjects,
}: ProjectsSectionProps = {}): React.ReactElement {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const pathname = usePathname();

  const [_, setProjectModalOpen] = useAtom(projectModalOpenAtom);
  const [__, setMobileProjectModalOpen] = useAtom(mobileProjectModalOpenAtom);
  const [isSidebarOpen, _setIsSidebarOpen] = useAtom(sidebarOpenAtom);
  const [, setCurrentProject] = useAtom(currentProjectAtom);

  // Get projects data - SWR will use server-provided fallbackData from parent
  const { projects: projectsList } = useProjects(initialProjects);

  // Handle selecting a project and setting the data
  const handleProjectSelect = (project: any) => {
    setCurrentProject(project);
  };

  return (
    <div style={{ width: '278px' }} className="mt-4">
      {/* Header with create button - sticky */}
      <motion.div
        className="sticky top-0 z-10 mb-2 flex items-center justify-between px-2 py-2"
        style={{ backgroundColor: 'var(--sidebar)' }}
        initial={{ opacity: isSidebarOpen ? 1 : 0 }}
        animate={{ opacity: isSidebarOpen ? 1 : 0 }}
        transition={{ opacity: { duration: 0.3 } }}
      >
        <h3 className="pl-2 font-medium text-muted-foreground text-xs">
          projects
        </h3>

        <button
          className="flex h-6 w-6 items-center justify-center rounded-none text-muted-foreground transition-all duration-300 hover:bg-accent/60 hover:text-foreground/80 focus:outline-none active:bg-accent active:text-foreground"
          onClick={() =>
            isDesktop
              ? setProjectModalOpen(true)
              : setMobileProjectModalOpen(true)
          }
          aria-label="Create new project"
        >
          <Plus weight="duotone" className="h-3 w-3" />
        </button>
      </motion.div>

      {/* Project list */}
      {projectsList?.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center pt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isSidebarOpen ? 1 : 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center bg-muted/40">
            <Empty weight="duotone" className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">no projects yet</p>
        </motion.div>
      ) : (
        <div className="space-y-1 rounded-none px-2">
          <AnimatePresence mode="popLayout">
            {projectsList?.map((project: any) => (
              <motion.div
                key={project.id}
                className="group relative select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isSidebarOpen ? 1 : 0 }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  transition: {
                    opacity: { duration: 0.3 },
                  },
                }}
                transition={{
                  opacity: { duration: 0.3 },
                  height: { duration: 0.3 },
                }}
                layout
              >
                <Link
                  href={`/p/${project.id}`}
                  className={cn(
                    'flex max-h-[32px] w-full cursor-pointer items-center rounded-none px-2 py-2 text-left text-muted-foreground transition-colors group-hover:text-foreground/80 group-active:text-foreground',
                    pathname?.includes(`/p/${project.id}`)
                      ? 'bg-accent'
                      : 'hover:bg-accent/60 active:bg-accent'
                  )}
                  onClick={() => handleProjectSelect(project)}
                >
                  <span
                    className={cn(
                      'flex-1 truncate text-sm leading-normal transition-colors duration-300',
                      pathname?.includes(`/p/${project.id}`)
                        ? 'text-foreground'
                        : ''
                    )}
                    style={{ fontSize: '12px' }}
                  >
                    {project.name}
                  </span>

                  <ProjectMenu
                    projectId={project.id}
                    isActive={pathname?.includes(`/p/${project.id}`) || false}
                  />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
