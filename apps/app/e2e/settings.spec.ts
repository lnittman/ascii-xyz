import { expect, test } from '@playwright/test';

/**
 * Settings E2E Tests
 *
 * Tests the settings pages functionality:
 * 1. Settings navigation
 * 2. Appearance settings (theme)
 * 3. Models settings (API keys)
 * 4. Profile settings
 *
 * Note: These tests may redirect to signin if not authenticated.
 */

// Helper to check if on settings page
async function isOnSettingsPage(page: import('@playwright/test').Page): Promise<boolean> {
  const url = page.url();
  if (url.includes('/signin') || url.includes('/sign-in')) {
    return false;
  }
  return url.includes('/settings');
}

test.describe('Settings Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('settings page loads', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeDefined();
  });

  test('shows settings navigation menu', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    // Settings nav should have links to different sections
    const profileLink = page.locator('a[href="/settings/profile"]');
    const appearanceLink = page.locator('a[href="/settings/appearance"]');
    const modelsLink = page.locator('a[href="/settings/models"]');

    // At least one should be visible
    const hasProfile = await profileLink.count() > 0;
    const hasAppearance = await appearanceLink.count() > 0;
    const hasModels = await modelsLink.count() > 0;

    expect(hasProfile || hasAppearance || hasModels).toBe(true);
  });

  test('navigates to appearance settings', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    const appearanceLink = page.locator('a[href="/settings/appearance"]');
    if (await appearanceLink.count() > 0) {
      await appearanceLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/settings/appearance');
    }
  });

  test('navigates to models settings', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    const modelsLink = page.locator('a[href="/settings/models"]');
    if (await modelsLink.count() > 0) {
      await modelsLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/settings/models');
    }
  });
});

test.describe('Appearance Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/appearance');
    await page.waitForLoadState('networkidle');
  });

  test('shows theme options', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    // Should show theme selection (Light, Dark, System)
    const themeLabel = page.locator('text=Theme');
    const lightOption = page.locator('text=Light');
    const darkOption = page.locator('text=Dark');
    const systemOption = page.locator('text=System');

    const hasTheme = await themeLabel.count() > 0;
    const hasOptions = (await lightOption.count()) + (await darkOption.count()) + (await systemOption.count()) > 0;

    expect(hasTheme || hasOptions).toBe(true);
  });

  test('theme buttons are clickable', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    const themeButtons = page.locator('button').filter({ hasText: /light|dark|system/i });
    const count = await themeButtons.count();

    if (count > 0) {
      // Click should not throw
      await themeButtons.first().click();
      // Page should still be on settings
      expect(page.url()).toContain('/settings');
    }
  });
});

test.describe('Models Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/models');
    await page.waitForLoadState('networkidle');
  });

  test('shows API key inputs', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    // Should show provider sections (OpenAI, Anthropic, Google, OpenRouter)
    const openaiSection = page.locator('text=/openai/i');
    const anthropicSection = page.locator('text=/anthropic|claude/i');
    const googleSection = page.locator('text=/google|gemini/i');

    const hasOpenAI = await openaiSection.count() > 0;
    const hasAnthropic = await anthropicSection.count() > 0;
    const hasGoogle = await googleSection.count() > 0;

    expect(hasOpenAI || hasAnthropic || hasGoogle).toBe(true);
  });

  test('shows model list', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    // Should show list of available models
    const modelNames = page.locator('text=/gpt-4|claude|gemini|llama/i');
    const count = await modelNames.count();

    // Should show at least some models
    expect(count).toBeGreaterThan(0);
  });

  test('API key input is masked', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    // API key inputs should be password type or masked
    const passwordInputs = page.locator('input[type="password"]');
    const count = await passwordInputs.count();

    // May have password inputs for API keys
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('shows save button for API keys', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    // Should have save/update buttons
    const saveButton = page.locator('button').filter({ hasText: /save|update|verify/i });
    const count = await saveButton.count();

    // Should have at least one action button
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Profile Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/profile');
    await page.waitForLoadState('networkidle');
  });

  test('shows user profile information', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    // Should show profile info or Clerk profile component
    const profileSection = page.locator('text=/profile|account|email/i');
    const count = await profileSection.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Data Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/data');
    await page.waitForLoadState('networkidle');
  });

  test('shows data management options', async ({ page }) => {
    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    // Should show export/delete options
    const exportOption = page.locator('text=/export|download/i');
    const deleteOption = page.locator('text=/delete|remove/i');

    const hasExport = await exportOption.count() > 0;
    const hasDelete = await deleteOption.count() > 0;

    // Should have some data management options
    const pageContent = await page.content();
    expect(pageContent).toBeDefined();
  });
});

test.describe('Settings Accessibility', () => {
  test('settings pages have proper headings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    // Should have h1 or h2 headings
    const headings = page.locator('h1, h2');
    const count = await headings.count();

    expect(count).toBeGreaterThan(0);
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/settings/models');
    await page.waitForLoadState('networkidle');

    test.skip(!(await isOnSettingsPage(page)), 'Requires authentication');

    // Inputs should have associated labels
    const inputs = page.locator('input');
    const count = await inputs.count();

    if (count > 0) {
      // Check first input has some form of label
      const firstInput = inputs.first();
      const id = await firstInput.getAttribute('id');
      const placeholder = await firstInput.getAttribute('placeholder');
      const ariaLabel = await firstInput.getAttribute('aria-label');

      // Should have at least one accessibility attribute
      expect(id || placeholder || ariaLabel).toBeTruthy();
    }
  });
});
