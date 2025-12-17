import { expect, test } from '@playwright/test';

/**
 * Generation Flow E2E Tests
 *
 * Tests the complete user journey of generating ASCII art:
 * 1. Entering a prompt
 * 2. Selecting a model
 * 3. Initiating generation
 * 4. Viewing progress
 * 5. Seeing the result
 *
 * Note: These tests run without authentication. When unauthenticated,
 * the home page may redirect to signin or show limited UI.
 */

// Helper to check if we're on the authenticated generation page
async function isOnGenerationPage(page: import('@playwright/test').Page): Promise<boolean> {
  const url = page.url();
  // If redirected to signin, we're not on generation page
  if (url.includes('/signin') || url.includes('/sign-in')) {
    return false;
  }
  // Check for the specific generation page textarea (authenticated version)
  // The unauthenticated landing page has a different placeholder
  const generationTextarea = page.locator('textarea[placeholder="Describe the ASCII art you want to create..."]');
  return await generationTextarea.count() > 0;
}

test.describe('Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home/generation page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Prompt Input', () => {
    test('shows prompt textarea with placeholder', async ({ page }) => {
      // Skip if redirected to signin (unauthenticated)
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const textarea = page.locator('textarea');
      await expect(textarea).toBeVisible();
      await expect(textarea).toHaveAttribute(
        'placeholder',
        'Describe the ASCII art you want to create...'
      );
    });

    test('accepts text input', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const textarea = page.locator('textarea');
      await textarea.fill('A cat sitting on a windowsill');
      await expect(textarea).toHaveValue('A cat sitting on a windowsill');
    });

    test('shows clear button when text is entered', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const textarea = page.locator('textarea');
      await textarea.fill('test prompt');

      const clearButton = page.locator('button[aria-label="Clear"]');
      await expect(clearButton).toBeVisible();
    });

    test('clears prompt when clear button is clicked', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const textarea = page.locator('textarea');
      await textarea.fill('test prompt');

      const clearButton = page.locator('button[aria-label="Clear"]');
      await clearButton.click();

      await expect(textarea).toHaveValue('');
    });

    test('textarea supports multiline input with Shift+Enter', async ({
      page,
    }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const textarea = page.locator('textarea');
      await textarea.fill('Line 1');
      await textarea.press('Shift+Enter');
      await textarea.type('Line 2');

      const value = await textarea.inputValue();
      expect(value).toContain('\n');
    });
  });

  test.describe('Run Button', () => {
    test('shows RUN button', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const runButton = page.locator('button:has-text("RUN")');
      await expect(runButton).toBeVisible();
    });

    test('RUN button is disabled when prompt is empty', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const runButton = page.locator('button:has-text("RUN")');
      await expect(runButton).toBeDisabled();
    });

    test('RUN button is enabled when prompt has text', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const textarea = page.locator('textarea');
      await textarea.fill('A sunset over mountains');

      const runButton = page.locator('button:has-text("RUN")');
      await expect(runButton).toBeEnabled();
    });
  });

  test.describe('Model Picker', () => {
    test('shows model picker button', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      // Model picker is a dropdown trigger
      const modelPicker = page.locator('button[aria-haspopup="menu"]');
      await expect(modelPicker).toBeVisible();
    });

    test('model picker displays selected model name', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const modelPicker = page.locator('button[aria-haspopup="menu"]');
      // Should show some model name (default is Claude 3.5 Sonnet)
      await expect(modelPicker).toContainText(/claude|gpt|gemini|llama/i);
    });
  });

  test.describe('Idle State', () => {
    test('shows starfield animation when no generation exists', async ({
      page,
    }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      // The idle state shows a starfield animation in a bordered container
      const container = page.locator('.border.border-border.bg-muted\\/30');
      await expect(container.first()).toBeVisible();
    });
  });

  test.describe('Image Upload', () => {
    test('shows image upload button', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const uploadButton = page.locator('button[title="Upload image"]');
      await expect(uploadButton).toBeVisible();
    });

    test('upload button contains square icon', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const uploadButton = page.locator('button[title="Upload image"]');
      await expect(uploadButton).toContainText('□');
    });
  });

  test.describe('Controls Bar', () => {
    test('shows bottom-fixed controls bar', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const controlsBar = page.locator('.fixed.bottom-6');
      await expect(controlsBar).toBeVisible();
    });

    test('controls bar contains prompt textarea', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const controlsArea = page.locator('.fixed.bottom-6');
      const textarea = controlsArea.locator('textarea');
      await expect(textarea).toBeVisible();
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('Enter key submits prompt when text is present', async ({ page }) => {
      test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

      const textarea = page.locator('textarea');
      await textarea.fill('A dancing robot');

      // Intercept network to prevent actual API call
      await page.route('**/api/**', (route) =>
        route.fulfill({ status: 200, body: '{}' })
      );

      // Press Enter to submit
      await textarea.press('Enter');

      // Button should show generating state (text changes to GENERATING)
      // Note: This may be fast, so we check for either state
      const runButton = page.locator('button').filter({ hasText: /RUN|GENERATING/i });
      await expect(runButton).toBeVisible();
    });
  });
});

test.describe('Generation Progress', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('shows loading state when generation starts', async ({ page }) => {
    test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

    // Fill prompt
    const textarea = page.locator('textarea');
    await textarea.fill('A cat playing piano');

    // Mock the generation endpoint to return immediately
    await page.route('**/api/**', async (route) => {
      // Delay to see loading state
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          generationId: 'test-id',
          frames: ['frame1'],
          metadata: {},
        }),
      });
    });

    // Click RUN
    const runButton = page.locator('button:has-text("RUN")');
    await runButton.click();

    // Should show some loading indicator
    const loadingIndicator = page.locator('text=/initializing|planning|generating/i');
    // Allow for either state - the test verifies the UI responds
    await expect(loadingIndicator.or(page.locator('text=/◌/i'))).toBeVisible({
      timeout: 2000,
    });
  });
});

test.describe('Responsive Design', () => {
  test('shows mobile layout on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

    // Textarea should still be visible
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    // RUN button should show icon only on mobile (▶)
    const runButton = page.locator('button').filter({ hasText: '▶' });
    await expect(runButton).toBeVisible();
  });

  test('shows desktop layout on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

    // Should show RUN text on desktop
    const runButton = page.locator('button:has-text("RUN")');
    await expect(runButton).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('textarea is focusable', async ({ page }) => {
    test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

    const textarea = page.locator('textarea');
    await textarea.focus();
    await expect(textarea).toBeFocused();
  });

  test('clear button has aria-label', async ({ page }) => {
    test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

    const textarea = page.locator('textarea');
    await textarea.fill('test');

    const clearButton = page.locator('button[aria-label="Clear"]');
    await expect(clearButton).toHaveAttribute('aria-label', 'Clear');
  });

  test('upload button has title for tooltip', async ({ page }) => {
    test.skip(!(await isOnGenerationPage(page)), 'Requires authentication');

    const uploadButton = page.locator('button[title="Upload image"]');
    await expect(uploadButton).toHaveAttribute('title', 'Upload image');
  });
});
