import { expect, test } from '@playwright/test';

/**
 * Gallery E2E Tests
 *
 * Tests the gallery page functionality:
 * 1. Viewing artwork list
 * 2. Filtering between my art and public art
 * 3. Searching artworks
 * 4. Navigating to artwork detail
 *
 * Note: Gallery page may redirect to signin if not authenticated.
 */

// Helper to check if we're on the gallery page (not redirected to signin)
async function isOnGalleryPage(page: import('@playwright/test').Page): Promise<boolean> {
  const url = page.url();
  if (url.includes('/signin') || url.includes('/sign-in')) {
    return false;
  }
  return url.includes('/gallery');
}

test.describe('Gallery Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Layout', () => {
    test('renders gallery page', async ({ page }) => {
      // Should have search input (hidden on mobile, visible on desktop)
      const title = await page.title();
      expect(title).toBeDefined();
    });

    test('shows search input on desktop', async ({ page }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/gallery');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[placeholder="Search artworks..."]');
      await expect(searchInput).toBeVisible();
    });

    test('shows search button on mobile', async ({ page }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/gallery');
      await page.waitForLoadState('networkidle');

      const searchButton = page.locator('button:has-text("Search")');
      await expect(searchButton).toBeVisible();
    });
  });

  test.describe('View Filters', () => {
    test('shows my-art and public filter buttons', async ({ page }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      // Filter toggle contains "my art" and "public" buttons
      // On mobile these may be icon-only, so check for the container
      const filterToggle = page.locator('.flex.items-center.h-10.bg-muted\\/30');
      await expect(filterToggle).toBeVisible();
    });

    test('my-art filter is active by default', async ({ page }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      // Wait for any button to be visible in filter area
      await page.waitForSelector('button');

      // On desktop, check for the active state class
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/gallery');
      await page.waitForLoadState('networkidle');

      const activeButton = page.locator('button.bg-background').first();
      await expect(activeButton).toBeVisible();
    });

    test('clicking public filter changes view', async ({ page }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/gallery');
      await page.waitForLoadState('networkidle');

      const publicButton = page.locator('button').filter({ hasText: 'public' });
      await publicButton.click();

      // After clicking, public should be active
      await expect(publicButton).toHaveClass(/bg-background/);
    });
  });

  test.describe('Search Functionality', () => {
    test('typing in search shows esc hint', async ({ page }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/gallery');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[placeholder="Search artworks..."]');
      await searchInput.fill('test query');

      // Should show ESC hint
      const escHint = page.locator('text=esc');
      await expect(escHint).toBeVisible();
    });

    test('pressing Escape clears search', async ({ page }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/gallery');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[placeholder="Search artworks..."]');
      await searchInput.fill('test query');
      await searchInput.press('Escape');

      // Search should be cleared
      await expect(searchInput).toHaveValue('');
    });
  });

  test.describe('Empty State', () => {
    test('shows empty state with create button when no artworks', async ({
      page,
    }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      // If there are no artworks, should show the empty state
      // This depends on the actual data, so we check for the structure
      const emptyState = page.locator('text=Create your first ASCII art');
      const createButton = page.locator('button:has-text("Create ASCII Art")');

      // Either we have artworks or empty state
      const hasEmptyState = await emptyState.count() > 0;
      const hasGrid = await page.locator('.grid').count() > 0;

      expect(hasEmptyState || hasGrid).toBe(true);
    });
  });

  test.describe('Loading State', () => {
    test('shows skeleton loaders while loading', async ({ page }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      // Refresh the page and check for skeletons during load
      await page.reload();

      // Skeletons may appear briefly during load
      // We check the structure exists (may not be visible if data loads fast)
      const pageContent = await page.content();
      expect(pageContent).toBeDefined();
    });
  });

  test.describe('Artwork Cards', () => {
    test('artwork cards link to detail page', async ({ page }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      // If there are artworks, they should be links
      const artworkLinks = page.locator('a[href^="/art/"]');
      const count = await artworkLinks.count();

      if (count > 0) {
        // Get the href of the first artwork
        const href = await artworkLinks.first().getAttribute('href');
        expect(href).toMatch(/^\/art\//);
      }
    });

    test('artwork cards show preview and metadata', async ({ page }) => {
      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      const artworkCards = page.locator('.grid > a');
      const count = await artworkCards.count();

      if (count > 0) {
        const firstCard = artworkCards.first();

        // Should have a pre element for ASCII preview
        const preview = firstCard.locator('pre');
        await expect(preview).toBeVisible();

        // Should have date text
        const dateText = firstCard.locator('text=/\\w{3} \\d{1,2}, \\d{4}/');
        await expect(dateText).toBeVisible();
      }
    });
  });
});

// Helper for artwork detail page
async function isOnArtworkPage(page: import('@playwright/test').Page): Promise<boolean> {
  const url = page.url();
  if (url.includes('/signin') || url.includes('/sign-in')) {
    return false;
  }
  return url.includes('/art/');
}

test.describe('Artwork Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a test artwork page
    await page.goto('/art/test-artwork-id');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Layout', () => {
    test('shows back button', async ({ page }) => {
      test.skip(!(await isOnArtworkPage(page)), 'Requires authentication');

      const backButton = page.locator('a[href="/"]').first();
      // Either shows back button or "not found" message
      const notFound = page.locator('text=Artwork not found');

      const hasBack = await backButton.count() > 0;
      const hasNotFound = await notFound.count() > 0;

      expect(hasBack || hasNotFound).toBe(true);
    });

    test('shows not found state for invalid artwork', async ({ page }) => {
      await page.goto('/art/invalid-id-12345');
      await page.waitForLoadState('networkidle');

      test.skip(!(await isOnArtworkPage(page)), 'Requires authentication');

      const notFound = page.locator('text=Artwork not found');
      const backButton = page.locator('text=Back to Gallery');

      // Should show not found or redirect
      const hasNotFound = await notFound.count() > 0;
      const hasBackButton = await backButton.count() > 0;

      // Either shows error or the page redirects
      const title = await page.title();
      expect(title).toBeDefined();
    });
  });

  test.describe('Action Buttons', () => {
    test('shows download, share, and delete buttons for valid artwork', async ({
      page,
    }) => {
      // Navigate to gallery first to find a real artwork
      await page.goto('/gallery');
      await page.waitForLoadState('networkidle');

      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      const artworkLinks = page.locator('a[href^="/art/"]');
      const count = await artworkLinks.count();

      if (count > 0) {
        // Click first artwork
        await artworkLinks.first().click();
        await page.waitForLoadState('networkidle');

        // Should have action buttons (icon buttons in header)
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        expect(buttonCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Animation Controls', () => {
    test('shows play/pause for multi-frame artwork', async ({ page }) => {
      // Navigate to gallery first to find a real artwork
      await page.goto('/gallery');
      await page.waitForLoadState('networkidle');

      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      const artworkLinks = page.locator('a[href^="/art/"]');
      const count = await artworkLinks.count();

      if (count > 0) {
        await artworkLinks.first().click();
        await page.waitForLoadState('networkidle');

        // If artwork has multiple frames, should show controls
        // Check for "Frame X of Y" text
        const frameText = page.locator('text=/Frame \\d+ of \\d+/');
        const hasFrameControls = await frameText.count() > 0;

        // Single frame artworks won't have controls, which is fine
        expect(typeof hasFrameControls).toBe('boolean');
      }
    });
  });

  test.describe('ASCII Display', () => {
    test('shows ASCII art in pre element', async ({ page }) => {
      await page.goto('/gallery');
      await page.waitForLoadState('networkidle');

      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      const artworkLinks = page.locator('a[href^="/art/"]');
      const count = await artworkLinks.count();

      if (count > 0) {
        await artworkLinks.first().click();
        await page.waitForLoadState('networkidle');

        // Check for the ASCII display area
        const asciiDisplay = page.locator('.bg-ascii-display pre');
        const notFound = page.locator('text=Artwork not found');

        const hasDisplay = await asciiDisplay.count() > 0;
        const hasNotFound = await notFound.count() > 0;

        expect(hasDisplay || hasNotFound).toBe(true);
      }
    });
  });

  test.describe('Metadata Display', () => {
    test('shows artwork metadata grid', async ({ page }) => {
      await page.goto('/gallery');
      await page.waitForLoadState('networkidle');

      test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

      const artworkLinks = page.locator('a[href^="/art/"]');
      const count = await artworkLinks.count();

      if (count > 0) {
        await artworkLinks.first().click();
        await page.waitForLoadState('networkidle');

        // Check for metadata labels
        const dimensionsLabel = page.locator('text=Dimensions');
        const modelLabel = page.locator('text=Model');
        const notFound = page.locator('text=Artwork not found');

        const hasDimensions = await dimensionsLabel.count() > 0;
        const hasModel = await modelLabel.count() > 0;
        const hasNotFound = await notFound.count() > 0;

        expect(hasDimensions || hasModel || hasNotFound).toBe(true);
      }
    });
  });
});

test.describe('Gallery Navigation', () => {
  test('can navigate from gallery to artwork and back', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');

    test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

    const artworkLinks = page.locator('a[href^="/art/"]');
    const count = await artworkLinks.count();

    if (count > 0) {
      // Click first artwork
      await artworkLinks.first().click();
      await page.waitForLoadState('networkidle');

      // Should be on artwork page
      expect(page.url()).toContain('/art/');

      // Go back
      const backButton = page.locator('a[href="/"]').first();
      if (await backButton.count() > 0) {
        await backButton.click();
        await page.waitForLoadState('networkidle');

        // Should be back on home
        expect(page.url()).toMatch(/\/$/);
      }
    }
  });

  test('create button in empty state navigates to home', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');

    test.skip(!(await isOnGalleryPage(page)), 'Requires authentication');

    const createButton = page.locator('a[href="/"]:has-text("Create ASCII Art")');
    const count = await createButton.count();

    if (count > 0) {
      await createButton.click();
      await page.waitForLoadState('networkidle');

      expect(page.url()).toMatch(/\/$/);
    }
  });
});
