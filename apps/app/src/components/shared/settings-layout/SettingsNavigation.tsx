'use client';

import {
  CreditCard,
  CubeTransparent,
  Database,
  Key,
  Sliders,
  Sun,
  User,
} from '@phosphor-icons/react';
import { SettingsLayout } from './index';

type IconName =
  | 'User'
  | 'CubeTransparent'
  | 'Sun'
  | 'Sliders'
  | 'Database'
  | 'CreditCard'
  | 'Key';

const iconMap = {
  User,
  CubeTransparent,
  Sun,
  Sliders,
  Database,
  CreditCard,
  Key,
} as const;

interface SettingsNavigationProps {
  items: {
    id: string;
    label: string;
    iconName: IconName;
    href: string;
  }[];
  children: React.ReactNode;
}

export function SettingsNavigation({
  items,
  children,
}: SettingsNavigationProps) {
  // Convert iconName to actual icon components
  const itemsWithIcons = items.map((item) => ({
    ...item,
    icon: (() => {
      const IconComponent = iconMap[item.iconName];
      return <IconComponent weight="duotone" className="h-4 w-4" />;
    })(),
  }));

  return <SettingsLayout items={itemsWithIcons}>{children}</SettingsLayout>;
}
