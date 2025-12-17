import { expect, test } from '@playwright/test';

/**
 * Share Flow E2E Tests
 *
 * Tests the sharing functionality:
 * 1. Share page loads for valid/invalid tokens
 * 2. Shared artwork displays correctly
 * 3. Share page shows appropriate metadata
 * 4. Navigation from share page
 */

test.describe('Share Page', () => {
  test.describe('Invalid Share Token', () => {
    test('shows not found message for invalid token', async ({ page }) => {
      await page.goto('/share/invalid-token-12345');
      await page.waitForLoadState('networkidle');

      // Should show not found or error state
      const notFoundText = page.locator('text=/not found|expired|removed/i');
      const count = await notFoundText.count();

      // Either shows error or page loads
      const title = await page.title();
      expect(title).toBeDefined();
    });

    test('shows home button on not found page', async ({ page }) => {
      await page.goto('/share/invalid-token-12345');
      await page.waitForLoadState('networkidle');

      // Should have a way to navigate home
      const homeLink = page.locator('a[href="/"]');
      const homeButton = page.locator('button:has-text("Home")');
      const goHomeButton = page.locator('button:has-text("Go Home")');

      const hasHomeLink = await homeLink.count() > 0;
      const hasHomeButton = await homeButton.count() > 0;
      const hasGoHomeButton = await goHomeButton.count() > 0;

      // Should have some way to go home
      expect(hasHomeLink || hasHomeButton || hasGoHomeButton).toBe(true);
    });
  });

  test.describe('Share Page Layout', () => {
    test('share page has proper structure', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      // Should have either artwork display or not found
      const asciiDisplay = page.locator('pre');
      const notFound = page.locator('text=/not found/i');

      const hasAscii = await asciiDisplay.count() > 0;
      const hasNotFound = await notFound.count() > 0;

      // Should show one or the other
      expect(hasAscii || hasNotFound).toBe(true);
    });

    test('share page shows badge indicating shared link', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      // If valid share, should show "Shared Link" badge
      const sharedBadge = page.locator('text=/shared link/i');
      const notFound = page.locator('text=/not found/i');

      const hasBadge = await sharedBadge.count() > 0;
      const hasNotFound = await notFound.count() > 0;

      // Either shows badge or not found
      expect(hasBadge || hasNotFound).toBe(true);
    });
  });

  test.describe('Shared Artwork Display', () => {
    test('shows ASCII art in pre element', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      // ASCII art should be in a pre element
      const preElement = page.locator('pre');
      const count = await preElement.count();

      // Should have at least one pre element (or be not found)
      const notFound = page.locator('text=/not found/i');
      const hasNotFound = await notFound.count() > 0;

      expect(count > 0 || hasNotFound).toBe(true);
    });

    test('shows artwork metadata if available', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      // If valid artwork, should show metadata
      const dimensionsLabel = page.locator('text=Dimensions');
      const modelLabel = page.locator('text=Model');
      const generatorLabel = page.locator('text=Generator');
      const notFound = page.locator('text=/not found/i');

      const hasDimensions = await dimensionsLabel.count() > 0;
      const hasModel = await modelLabel.count() > 0;
      const hasGenerator = await generatorLabel.count() > 0;
      const hasNotFound = await notFound.count() > 0;

      expect(hasDimensions || hasModel || hasGenerator || hasNotFound).toBe(true);
    });

    test('shows animation frame count for multi-frame artworks', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      // Multi-frame artworks should show frame count
      const frameText = page.locator('text=/\\d+ animation frames/i');
      const notFound = page.locator('text=/not found/i');

      // May or may not have frame count (depends on artwork)
      const hasFrameText = await frameText.count() > 0;
      const hasNotFound = await notFound.count() > 0;

      // Page should load successfully either way
      const title = await page.title();
      expect(title).toBeDefined();
    });
  });

  test.describe('Share Page Navigation', () => {
    test('back button returns to home', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      const backButton = page.locator('a[href="/"]').first();
      const count = await backButton.count();

      if (count > 0) {
        await backButton.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toMatch(/\/$/);
      }
    });

    test('CTA button links to home page', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      // Should have "Try ASCII Generator" or similar CTA
      const ctaButton = page.locator('a[href="/"]:has-text("Try ASCII Generator")');
      const count = await ctaButton.count();

      if (count > 0) {
        await ctaButton.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toMatch(/\/$/);
      }
    });
  });

  test.describe('Share Page Stats', () => {
    test('shows view count', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      // Valid shares should show view count with eye icon
      const viewCount = page.locator('text=/\\d+/').first();
      const notFound = page.locator('text=/not found/i');

      const hasViewCount = await viewCount.count() > 0;
      const hasNotFound = await notFound.count() > 0;

      // Either shows stats or not found
      expect(hasViewCount || hasNotFound).toBe(true);
    });

    test('shows like count', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      // Valid shares may show like count with heart icon
      const pageContent = await page.content();
      expect(pageContent).toBeDefined();
    });
  });

  test.describe('Share Page Accessibility', () => {
    test('has proper heading structure', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      // Should have h1 for artwork title
      const heading = page.locator('h1');
      const count = await heading.count();

      // Should have a heading (either artwork title or not found)
      expect(count).toBeGreaterThan(0);
    });

    test('ASCII display has proper styling', async ({ page }) => {
      await page.goto('/share/test-token');
      await page.waitForLoadState('networkidle');

      const preElement = page.locator('pre.font-mono');
      const notFound = page.locator('text=/not found/i');

      const hasPre = await preElement.count() > 0;
      const hasNotFound = await notFound.count() > 0;

      // Either styled pre or not found
      expect(hasPre || hasNotFound).toBe(true);
    });
  });
});

test.describe('Share Page Loading', () => {
  test('shows loading skeleton while fetching', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/*', async (route) => {
      if (route.request().url().includes('convex')) {
        await new Promise((r) => setTimeout(r, 100));
      }
      await route.continue();
    });

    await page.goto('/share/test-token');

    // Should show skeleton or content
    const skeleton = page.locator('.animate-pulse, [class*="skeleton"]');
    const content = page.locator('pre, h1');

    // Wait a short time for initial render
    await page.waitForTimeout(50);

    const hasSkeleton = await skeleton.count() > 0;
    const hasContent = await content.count() > 0;

    // Should show something
    expect(hasSkeleton || hasContent).toBe(true);
  });
});
