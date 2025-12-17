import Link from 'next/link';

export function FooterNavigation() {
  return (
    <footer className="mt-12 border-t border-border/30 pt-6">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          © 2025 logs
        </div>
        <nav className="flex gap-3">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-0">
            home
          </Link>
          <Link href="/settings" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-0">
            settings
          </Link>
        </nav>
      </div>
    </footer>
  );
}