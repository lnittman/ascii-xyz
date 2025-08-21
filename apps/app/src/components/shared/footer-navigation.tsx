import Link from 'next/link';

export function FooterNavigation() {
  return (
    <footer className="mt-16 border-t border-border/50 pt-8">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          © 2025 Logs
        </div>
        <nav className="flex gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
            Settings
          </Link>
        </nav>
      </div>
    </footer>
  );
}