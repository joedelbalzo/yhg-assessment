/**
 * @fileoverview Express application configuration and middleware setup.
 * Configures security, CORS, rate limiting, and routes for the backend API.
 *
 * @module app
 *
 * @description
 * **Security Features**:
 * - Helmet.js for HTTP headers (CSP disabled for reCAPTCHA)
 * - Rate limiting: 1000 requests per 15 minutes per IP
 * - CORS whitelist for authorized origins only
 * - Trust proxy enabled for accurate IP detection behind proxies
 *
 * **Routes**:
 * - `/api/gas/*` - Code redemption and email checking (gas.ts)
 * - `/api/recaptcha/*` - reCAPTCHA verification (recaptcha.ts)
 * - `/` - Static frontend files from frontend/dist (production)
 * - `*` - Fallback to index.html for client-side routing
 *
 * **Middleware Chain**:
 * 1. CORS validation (whitelist check)
 * 2. Helmet security headers
 * 3. JSON body parsing
 * 4. URL-encoded body parsing
 * 5. Rate limiter
 * 6. Static file serving
 * 7. API routes
 * 8. Error handler (catches all unhandled errors)
 */
import { Express } from "express";
declare const app: Express;
export default app;
