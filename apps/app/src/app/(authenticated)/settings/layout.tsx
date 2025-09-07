import { SettingsNavigation, type SettingsItem } from '@/components/shared/settings-layout/SettingsNavigation';

const settingsItems: SettingsItem[] = [
  { id: 'profile', label: 'Profile', iconName: 'User', href: '/settings/profile' },
  { id: 'models', label: 'Models', iconName: 'Models', href: '/settings/models' },
  { id: 'appearance', label: 'Appearance', iconName: 'Palette', href: '/settings/appearance' },
  { id: 'data', label: 'Data', iconName: 'Database', href: '/settings/data' },
  { id: 'billing', label: 'Billing', iconName: 'CreditCard', href: '/settings/billing' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsNavigation items={settingsItems}>{children}</SettingsNavigation>
  );
}