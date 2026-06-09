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
export declare const processSquarespaceQueue: () => Promise<void>;
