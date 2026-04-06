import { test, expect, type Page } from '@playwright/test';

// SHARED FIXTURE — reuse authenticated session, navigate to Milestones page

const milestoneTest = test.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to home with retry — parallel workers can cause landing-page flakiness
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await page.goto('https://trofos-production.comp.nus.edu.sg/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await page.waitForTimeout(1500);

      const homeMenu = page.getByRole('menuitem', { name: /home/i }).first();
      const isAuthenticated = await homeMenu.isVisible().catch(() => false);
      if (isAuthenticated) break;

      if (attempt < maxRetries) {
        console.log(`[Milestones fixture] Attempt ${attempt}: dashboard not ready. Reloading…`);
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
      } else {
        await homeMenu.waitFor({ state: 'visible', timeout: 15000 });
      }
    }

    // Expand Courses submenu in sidebar
    const coursesMenu = page.locator('span').filter({ hasText: /^Courses$/ });
    await expect(coursesMenu).toBeVisible();
    await coursesMenu.click();
    await page.waitForTimeout(500);

    // Click first available course
    const firstCourse = page.locator('a[href*="/course/"]').first();
    await expect(firstCourse).toBeVisible();
    await firstCourse.click();

    await page.waitForURL('**/course/**');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Retry if server returned error page under load
    for (let retryNav = 0; retryNav < 3; retryNav++) {
      const courseError = await page
        .getByText('does not exist')
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (!courseError) break;
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
    }

    // Click Milestones in the sidebar
    await page.getByRole('menuitem', { name: 'Milestones' }).click();
    await page.waitForTimeout(1000);

    await use(page);
  },
});

// MILESTONE TESTS

// Keep default mode so failures do not skip the remaining tests in this file

  const milestoneName = `AutoTest Milestone ${Date.now()}`;

  milestoneTest('[Milestones] 8.1 - Create milestone', async ({ authenticatedPage: page }) => {
    // Click New button
    await page.locator('button').filter({ hasText: 'New' }).click();
    await page.waitForTimeout(500);

    // Fill milestone name
    await page.getByRole('textbox', { name: '* Milestone Name' }).fill(milestoneName);

    // Open the date range picker and select start + end dates
    await page.locator('.ant-picker').click();
    await page.waitForTimeout(300);

    // Pick start date: click the first "1" in the visible calendar
    await page.locator('.ant-picker-cell-inner').getByText('1', { exact: true }).first().click();
    await page.waitForTimeout(300);

    // Pick end date: click "28" (safe last day that exists in every month)
    await page.locator('.ant-picker-cell-inner').getByText('28', { exact: true }).last().click();
    await page.waitForTimeout(300);

    // Submit
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.waitForTimeout(1000);

    // Verify milestone appears in the list
    await expect(page.getByText(milestoneName)).toBeVisible({ timeout: 5000 });
  });

  milestoneTest('[Milestones] 8.2 - Delete milestone', async ({ authenticatedPage: page }) => {
    // Milestone name lives inside a textbox (custom form layout, not a table row)
    const milestoneInput = page.locator(`input[value="${milestoneName}"]`);
    // Reload page to ensure server-side data is reflected
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await expect(milestoneInput).toBeVisible({ timeout: 15000 });

    // The Delete button is inside the same parent container as the textbox
    const milestoneEntry = milestoneInput.locator('xpath=ancestor::div[.//button[contains(.,"Delete")]]').first();
    await milestoneEntry.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(500);

    // Verify success toast
    await expect(page.getByText('Milestone deleted!')).toBeVisible({ timeout: 5000 });

    // Verify milestone input is gone
    await expect(milestoneInput).not.toBeVisible({ timeout: 5000 });
  });
