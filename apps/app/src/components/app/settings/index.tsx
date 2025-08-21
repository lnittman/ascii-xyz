import type React from 'react';
import { useState } from 'react';

import {
  CreditCard,
  CubeTransparent,
  Database,
  Sliders,
  Sun,
  User,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { cn } from '@repo/design/lib/utils';

import { AppearanceTab } from './components/AppearanceTab';
import { BillingTab } from './components/BillingTab';
import { CustomizeTab } from './components/CustomizeTab';
import { DataTab } from './components/DataTab';
import { ModelsTab } from './components/ModelsTab';
// Import tab content components
import { ProfileTab } from './components/ProfileTab';

type Tab = {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
};

export function Settings() {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const isDesktop = useIsMobile();

  // Define tabs with their content components
  const tabs: Tab[] = [
    {
      id: 'profile',
      label: 'profile',
      icon: <User weight="duotone" className="h-4 w-4" />,
      component: <ProfileTab />,
    },
    {
      id: 'models',
      label: 'ai models',
      icon: <CubeTransparent weight="duotone" className="h-4 w-4" />,
      component: <ModelsTab />,
    },
    {
      id: 'appearance',
      label: 'appearance',
      icon: <Sun weight="duotone" className="h-4 w-4" />,
      component: <AppearanceTab />,
    },
    {
      id: 'customize',
      label: 'customize',
      icon: <Sliders weight="duotone" className="h-4 w-4" />,
      component: <CustomizeTab />,
    },
    {
      id: 'data',
      label: 'data',
      icon: <Database weight="duotone" className="h-4 w-4" />,
      component: <DataTab />,
    },
    {
      id: 'billing',
      label: 'billing',
      icon: <CreditCard weight="duotone" className="h-4 w-4" />,
      component: <BillingTab />,
    },
  ];

  // Find the current active tab
  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  if (!isDesktop) {
    return (
      <div className="px-2 text-foreground">
        {/* Mobile tabs navigation */}
        <div className="hide-scrollbar mb-4 flex overflow-x-auto border-border/20 border-b pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap px-3 py-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary border-b-2 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="h-4 w-4">{tab.icon}</span>
              <span
                className={cn(
                  'transition-colors duration-200',
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content with fade animation */}
        <div className="py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTabData.component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex h-full flex-1 overflow-hidden">
      {/* Sidebar navigation */}
      <div className="w-48 overflow-y-auto border-border/20 border-r py-2">
        <ul className="space-y-1 px-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-none px-3 py-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-accent/70 text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                {tab.icon}
                <span
                  className={cn(
                    'transition-colors duration-200',
                    activeTab === tab.id
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab content with fade animation - fixed height container */}
      <div className="relative flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTabData.component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
