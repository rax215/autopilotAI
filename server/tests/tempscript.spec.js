import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('Amazon: Navigate, handle captcha, and search for Lord of the Rings', async ({ page, context }) => {
  // 1. Navigate to Amazon.com
  await page.goto('https://www.amazon.com', { waitUntil: 'networkidle' });

  // 2. Handle Captcha
  // Input the captcha text
  await page.locator('#captchacharacters[name="field-keywords"][placeholder="Type characters"]').fill('PPJUAL');

  // Click the "Continue shopping" button
  await page.locator('button[type="submit"] > .a-button-text').click();

  // 3. Search for "Lord of the rings"
  // Input "Lord of the rings" into the search box
  await page.locator('input[aria-label="Search Amazon"][name="field-keywords"][role="searchbox"]').fill('Lord of the rings');

  // Click the search submit button
  await page.locator('#nav-search-submit-button[type="submit"]').click();

  // Assertion: Check if the title contains "Lord of the rings" after search
  await expect(page).toHaveTitle(/Lord of the rings/);
});