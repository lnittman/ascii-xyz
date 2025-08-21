export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-medium text-foreground mb-6">general</h1>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm text-foreground block mb-2">workspace name</label>
          <input
            type="text"
            defaultValue="Personal"
            className="w-full max-w-md px-3 py-1.5 text-sm text-foreground bg-background border border-border rounded-md focus:outline-none focus:border-primary"
          />
        </div>
        
        <div>
          <label className="text-sm text-foreground block mb-2">default view</label>
          <select className="w-full max-w-md px-3 py-1.5 text-sm text-foreground bg-background border border-border rounded-md">
            <option>today</option>
            <option>week</option>
            <option>month</option>
            <option>all time</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm text-foreground block mb-2">time zone</label>
          <select className="w-full max-w-md px-3 py-1.5 text-sm text-foreground bg-background border border-border rounded-md">
            <option>America/New_York</option>
            <option>America/Los_Angeles</option>
            <option>Europe/London</option>
            <option>Asia/Tokyo</option>
          </select>
        </div>
      </div>
    </div>
  );
}