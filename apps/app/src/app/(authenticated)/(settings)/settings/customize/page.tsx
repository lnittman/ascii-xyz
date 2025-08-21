import { CustomizeTab } from '@/components/app/settings/components/CustomizeTab';

export default function CustomizeSettingsPage() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Top gradient fade */}
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-6 bg-gradient-to-b from-background to-transparent" />

      {/* Scrollable content */}
      <div className="h-full overflow-y-auto bg-background">
        <div className="p-8">
          <CustomizeTab />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
