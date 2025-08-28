import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import { ClerkProvider } from '@clerk/nextjs';

//import { ReactScan } from '@/components/shared/ReactScan';
import { DesignSystemProvider } from '@repo/design';
import ConvexClientProvider from '@/providers/ConvexClientProvider';

import '@/styles/globals.css';

export const metadata: Metadata = createMetadata({
  title: 'ASCII',
  description: 'AI-powered ASCII art generation platform',
  image: '/assets/ascii-og.png',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#faf9f7" />
        <meta name="keywords" content="ascii, art, ai, generation, text art, ascii animation" />
        <meta name="author" content="ASCII Platform" />
        <meta property="og:site_name" content="ASCII" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="ASCII" />
        <meta name="twitter:description" content="AI-powered ASCII art generation platform" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setInitialTheme() {
                  try {
                    const storageKey = 'next-themes-theme';
                    const stored = localStorage.getItem(storageKey);
                    
                    // Colors that exactly match globals.css CSS variables
                    // Light: oklch(0.98 0.005 85) = #faf9f7
                    // Dark: proper dark gray = #0a0a0a
                    const lightBg = '#faf9f7';
                    const darkBg = '#0a0a0a';
                    
                    function updateTheme(theme) {
                      const html = document.documentElement;
                      
                      // Remove existing theme classes
                      html.classList.remove('light', 'dark');
                      
                      let resolvedTheme;
                      if (theme === 'system') {
                        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      } else {
                        resolvedTheme = theme;
                      }
                      
                      // Add the resolved theme class
                      html.classList.add(resolvedTheme);
                      
                      // Update meta theme color and document background immediately
                      const themeColor = resolvedTheme === 'dark' ? darkBg : lightBg;
                      updateMetaThemeColor(themeColor);
                      
                      // Also update the document background immediately to prevent flash
                      document.documentElement.style.backgroundColor = themeColor;
                      
                      // Force background on mobile by also updating body
                      if (document.body) {
                        document.body.style.backgroundColor = themeColor;
                      }
                      
                      // Also force on main element for extra safety on mobile
                      const main = document.querySelector('main');
                      if (main) {
                        main.style.backgroundColor = themeColor;
                      }
                    }
                    
                    function updateMetaThemeColor(color) {
                      const meta = document.querySelector('meta[name="theme-color"]');
                      if (meta) {
                        meta.setAttribute('content', color);
                      }
                    }
                    
                    // Apply theme based on stored preference or system default
                    const themeToApply = stored || 'system';
                    updateTheme(themeToApply);
                    
                    // Listen for system preference changes when using system theme
                    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                    const handleSystemChange = () => {
                      const currentStored = localStorage.getItem(storageKey);
                      if ((currentStored || 'system') === 'system') {
                        updateTheme('system');
                      }
                    };
                    
                    // Add listener for system changes
                    if (mediaQuery.addEventListener) {
                      mediaQuery.addEventListener('change', handleSystemChange);
                    } else {
                      // Fallback for older browsers
                      mediaQuery.addListener(handleSystemChange);
                    }
                    
                  } catch (error) {
                    // Silently fail - next-themes will handle it
                    console.warn('Theme initialization failed:', error);
                  }
                }
                
                // Disable long press context menu globally
                function disableLongPress() {
                  document.addEventListener('contextmenu', function(e) {
                    const target = e.target;
                    if (target && (target.classList.contains('no-ios-callout') || 
                        target.closest('.no-ios-callout') ||
                        target.closest('aside'))) {
                      e.preventDefault();
                      return false;
                    }
                  });
                }
                
                // Run immediately if DOM is ready, otherwise wait
                if (document.readyState !== 'loading') {
                  setInitialTheme();
                  disableLongPress();
                } else {
                  document.addEventListener('DOMContentLoaded', function() {
                    setInitialTheme();
                    disableLongPress();
                  });
                }
              })();
            `,
          }}
        />
      </head>

      <body className="min-h-screen bg-background" suppressHydrationWarning>
        <ClerkProvider>
          <ConvexClientProvider>
            <DesignSystemProvider>
              <ViewTransitions>{children}</ViewTransitions>
            </DesignSystemProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
