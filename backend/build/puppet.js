"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSquarespaceQueue = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const gas_1 = require("./gas");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
/**
 * Obfuscates email for the sake of extensive error logging
 * @param {string} email - The email address to cache.
 */
function obfuscatedEmail(email) {
    if (!email || typeof email !== "string")
        return "invalid_email";
    if (!email.includes("@"))
        return email;
    if (email.length < 5)
        return email;
    return `${email.slice(0, 5)}*****${email.split('@')[1]}`;
}
const processSquarespaceQueue = () => __awaiter(void 0, void 0, void 0, function* () {
    const email = (0, gas_1.getNextSquarespaceEmail)();
    if (!email) {
        console.log(JSON.stringify({ ev: "squarespace_queue_empty" }));
        return;
    }
    const obEmail = obfuscatedEmail(email);
    console.log(JSON.stringify({ obEmail, ev: "processing_squarespace_email" }));
    const browser = yield puppeteer_extra_1.default.launch({
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
    const page = yield browser.newPage();
    try {
        yield page.setViewport({ width: 1280, height: 800 });
        console.log(JSON.stringify({ obEmail, ev: "on_form" }));
        yield page.goto("https://www.yourhiddengenius.com/918347nfa-jaof9-email-confirmation", {
            waitUntil: "networkidle2",
            timeout: 60000,
        });
        // console.log(JSON.stringify({ obEmail, ev: "scrolling_randomly" }));
        for (let i = 0; i < 3; i++) {
            yield page.evaluate(() => window.scrollBy(0, Math.random() * 300));
            yield new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        }
        // console.log(JSON.stringify({ obEmail, ev: "waiting_for_email_input" }));
        yield page.waitForSelector('input[type="email"]', { visible: true, timeout: 30000 });
        // console.log(JSON.stringify({ obEmail, ev: "moving_mouse_to_email_input" }));
        const emailInput = yield page.$('input[type="email"]');
        if (emailInput) {
            const box = yield emailInput.boundingBox();
            if (box) {
                yield page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
                yield page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            }
        }
        // console.log(JSON.stringify({ obEmail, ev: "typing_email" }));
        yield page.keyboard.type(email, { delay: 120 + Math.random() * 50 });
        console.log(JSON.stringify({ obEmail, ev: "waiting_for_recaptcha_execution" }));
        yield new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 1000));
        // console.log(JSON.stringify({ obEmail, ev: "submitting_form" }));
        yield page.click('button[type="submit"]');
        console.log(JSON.stringify({ obEmail, ev: "waiting_for_form_submission" }));
        yield page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
        console.log(JSON.stringify({ obEmail, ev: "squarespace_submission_success" }));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(JSON.stringify({ obEmail, ev: "squarespace_submission_failed", error: errorMessage }));
        if (errorMessage.includes("Navigation timeout")) {
            console.error(JSON.stringify({ obEmail, ev: "likely_recaptcha_blocking" }));
        }
    }
    finally {
        yield browser.close();
        console.log(JSON.stringify({ ev: "browser_closed", obEmail }));
    }
});
exports.processSquarespaceQueue = processSquarespaceQueue;
//# sourceMappingURL=puppet.js.map