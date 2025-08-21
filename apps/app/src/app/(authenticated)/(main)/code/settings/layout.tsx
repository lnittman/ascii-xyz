'use client';

import { Database, Folders, Gear } from '@phosphor-icons/react';

import { SettingsLayout } from '@/components/shared/settings-layout';

type CodeIconName = 'Gear' | 'Folders' | 'Database';

const iconMap = {
  Gear,
  Folders,
  Database,
} as const;

const codeSettingsItems = [
  {
    id: 'general',
    label: 'General',
    iconName: 'Gear' as CodeIconName,
    href: '/code/settings/general',
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    iconName: 'Folders' as CodeIconName,
    href: '/code/settings/workspaces',
  },
  {
    id: 'data',
    label: 'Data',
    iconName: 'Database' as CodeIconName,
    href: '/code/settings/data',
  },
];

export default function CodeSettingsLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Convert iconName to actual icon components
  const itemsWithIcons = codeSettingsItems.map((item) => ({
    ...item,
    icon: (() => {
      const IconComponent = iconMap[item.iconName];
      return <IconComponent weight="duotone" className="h-4 w-4" />;
    })(),
  }));

  return (
    <SettingsLayout
      title="Code Settings"
      centerLayout={false}
      items={itemsWithIcons}
    >
      {children}
    </SettingsLayout>
  );
}
