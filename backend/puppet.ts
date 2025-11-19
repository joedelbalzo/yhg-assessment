/**
 * @fileoverview Puppeteer automation for Squarespace newsletter form submission.
 * Runs in background after successful code redemption (non-blocking).
 *
 * @module puppet
 *
 * @description
 * **Purpose**: Automatically subscribe users to newsletter after assessment signup.
 *
 * **Architecture**:
 * - Triggered by gas.ts after successful domain assignment
 * - 5-second delay before processing (gives user time to navigate away)
 * - Headless Chrome with stealth plugin (bypasses bot detection)
 * - Human behavior simulation: random scrolling, mouse movement, typing delays
 *
 * **Workflow**:
 * 1. Email added to queue in gas.ts (line 630)
 * 2. 5-second setTimeout triggers processSquarespaceQueue()
 * 3. getNextSquarespaceEmail() retrieves next email from queue
 * 4. Puppeteer launches Chrome and navigates to Squarespace form
 * 5. Simulates human interaction: scroll, mouse move, type with delays
 * 6. Submits form and waits for navigation
 * 7. Success/failure logged (doesn't affect user's assessment access)
 *
 * **Render.com Deployment**:
 * - Chrome path hardcoded for Render: `/opt/render/.cache/puppeteer/chrome/...`
 * - Chrome installed via `npx puppeteer browsers install chrome` in start script
 * - Update executablePath if Render changes cache location
 *
 * **Error Handling**:
 * - Failures are logged but don't block user flow
 * - Common failure: Navigation timeout (likely reCAPTCHA blocking)
 * - All errors logged with obfuscated emails for privacy
 *
 * **Email Obfuscation**:
 * - Logs show: `${email.slice(0,5)}*****${email.split('@')[1]}`
 * - Example: `user@*****example.com`
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { getNextSquarespaceEmail } from "./gas";

puppeteer.use(StealthPlugin());

/**
 * Obfuscates email for the sake of extensive error logging
 * @param {string} email - The email address to cache.
 */
function obfuscatedEmail(email: string): string {
  if (!email || typeof email !== "string") return "invalid_email";
  if (!email.includes("@")) return email;
  if (email.length < 5) return email;
  return `${email.slice(0, 5)}*****${email.split('@')[1]}`;
}

export const processSquarespaceQueue = async () => {
  const email = getNextSquarespaceEmail();
  if (!email) {
    console.log(JSON.stringify({ ev: "squarespace_queue_empty" }));
    return;
  }
  const obEmail = obfuscatedEmail(email)

  console.log(JSON.stringify({ obEmail, ev: "processing_squarespace_email" }));

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/opt/render/.cache/puppeteer/chrome/linux-133.0.6943.98/chrome-linux64/chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--start-maximized",
    ],
  });

  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1280, height: 800 });

    console.log(JSON.stringify({ obEmail, ev: "on_form" }));
    await page.goto("https://www.yourhiddengenius.com/918347nfa-jaof9-email-confirmation", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // console.log(JSON.stringify({ obEmail, ev: "scrolling_randomly" }));
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, Math.random() * 300));
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    }

    // console.log(JSON.stringify({ obEmail, ev: "waiting_for_email_input" }));
    await page.waitForSelector('input[type="email"]', { visible: true, timeout: 30000 });

    // console.log(JSON.stringify({ obEmail, ev: "moving_mouse_to_email_input" }));
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      const box = await emailInput.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      }
    }

    // console.log(JSON.stringify({ obEmail, ev: "typing_email" }));
    await page.keyboard.type(email, { delay: 120 + Math.random() * 50 });

    console.log(JSON.stringify({ obEmail, ev: "waiting_for_recaptcha_execution" }));
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 1000));

    // console.log(JSON.stringify({ obEmail, ev: "submitting_form" }));
    await page.click('button[type="submit"]');

    console.log(JSON.stringify({ obEmail, ev: "waiting_for_form_submission" }));
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });

    console.log(JSON.stringify({ obEmail, ev: "squarespace_submission_success" }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ obEmail, ev: "squarespace_submission_failed", error: errorMessage }));
    if (errorMessage.includes("Navigation timeout")) {
      console.error(JSON.stringify({ obEmail, ev: "likely_recaptcha_blocking" }));
    }
  } finally {
    await browser.close();
    console.log(JSON.stringify({ ev: "browser_closed", obEmail }));
  }
};
