import { GeneralTab } from '@/components/code/settings/components/GeneralTab';

export default async function GeneralSettingsPage() {
  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-3xl p-8">
        <div className="mb-8">
          <h2 className="mb-2 font-semibold text-foreground text-xl">
            General
          </h2>
          <p className="text-muted-foreground text-sm">
            Customize your code assistant behavior and preferences
          </p>
        </div>
        <GeneralTab />
      </div>
    </div>
  );
}
