/**
 * Centralized error catalog.
 *
 * Every user-facing error message lives here. Server code imports the needed
 * error def and uses AppError(code, message) so text can be changed in one place.
 *
 * Rules:
 * - Codes are stable identifiers (never change after ship)
 * - Messages name the actual thing that failed, in plain language
 * - No provider names, no env vars, no jargon, no ALL CAPS
 * - If the user can't fix it themselves, include support@goodshepherdinsights.com
 */

import type { ErrorCode } from "@/shared/error-codes";
export interface ErrorDef {
  code: ErrorCode;
  message: string;
}

// ── Billing ──────────────────────────────────────────────────────────────────

export const insufficientCredits: ErrorDef = {
  code: "INSUFFICIENT_CREDITS",
  message: "You've run out of usage credits. Go to Billing to add more and keep using OpenSEO.",
};

export const paymentRequired: ErrorDef = {
  code: "PAYMENT_REQUIRED",
  message: "This feature needs a paid plan. Go to Billing to upgrade and unlock it.",
};

export const balanceIssue: ErrorDef = {
  code: "PAYMENT_REQUIRED",
  message: "Your payment method was declined. Go to Billing to update it and try again.",
};

export const billingCustomerMissing: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "We couldn't load your billing info. Email support@goodshepherdinsights.com and we'll sort it out.",
};

export const authConfigMissing: ErrorDef = {
  code: "AUTH_CONFIG_MISSING",
  message: "Sign-in isn't set up right now. Email support@goodshepherdinsights.com and we'll get it working.",
};

// ── Validation ───────────────────────────────────────────────────────────────

export const domainRequired: ErrorDef = {
  code: "VALIDATION_ERROR",
  message: "Enter a domain to scan — like example.com.",
};

export const domainInvalid: ErrorDef = {
  code: "VALIDATION_ERROR",
  message: "That domain doesn't look right. Try something like example.com.",
};

export const urlInvalid: ErrorDef = {
  code: "VALIDATION_ERROR",
  message: "That link doesn't look right. Try a full URL like https://example.com/page.",
};

export const nameRequired: ErrorDef = {
  code: "VALIDATION_ERROR",
  message: "Give this a name so you can find it later.",
};

export const jsonRequired: ErrorDef = {
  code: "VALIDATION_ERROR",
  message: "Something got mixed up with that request. Please try again.",
};

// ── Not found ────────────────────────────────────────────────────────────────

export const auditNotFound: ErrorDef = {
  code: "NOT_FOUND",
  message: "We couldn't find that audit in this project. It may have been deleted.",
};

export const chatSessionNotFound: ErrorDef = {
  code: "NOT_FOUND",
  message: "That chat session has expired or been removed. Start a new one.",
};

export const rankConfigNotFound: ErrorDef = {
  code: "NOT_FOUND",
  message: "Rank tracking isn't set up for this project yet. Add keywords to get started.",
};

export const notFound: ErrorDef = {
  code: "NOT_FOUND",
  message: "We couldn't find that. It may have been moved or deleted.",
};

// ── Auth ─────────────────────────────────────────────────────────────────────

export const unauthenticated: ErrorDef = {
  code: "UNAUTHENTICATED",
  message: "Your session expired. Sign back in to continue.",
};

export const authMissingEnv: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "Sign-in isn't set up right now. Email support@goodshepherdinsights.com and we'll get it working.",
};

// ── Audit ────────────────────────────────────────────────────────────────────

export const auditAlreadyRunning: ErrorDef = {
  code: "AUDIT_ALREADY_RUNNING",
  message: "An audit is already running on this project. Wait for it to finish or stop it first.",
};

export const auditCapacityReached: ErrorDef = {
  code: "AUDIT_CAPACITY_REACHED",
  message: "We're running at full capacity. Try again in a few minutes.",
};

export const auditPageLimitExceeded: ErrorDef = {
  code: "AUDIT_PAGE_LIMIT_EXCEEDED",
  message: "This audit would scan more pages than your plan allows. Upgrade to cover the whole site.",
};

export const auditContextMismatch: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "We lost track of that audit mid-run. Email support@goodshepherdinsights.com if this keeps happening.",
};

export const auditProjectMismatch: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "We lost track of that audit mid-run. Email support@goodshepherdinsights.com if this keeps happening.",
};

export const auditConfigInvalid: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "That audit's settings are mixed up. Email support@goodshepherdinsights.com and we'll fix it.",
};

// ── Upstream / service ───────────────────────────────────────────────────────

export const serviceTaskMissing: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "We couldn't start that scan. Please try again — if it keeps happening, email support@goodshepherdinsights.com.",
};

export const serviceUnavailable: ErrorDef = {
  code: "UPSTREAM_UNAVAILABLE",
  message: "We're having a moment. Please try again in a minute.",
};

export const rateLimited: ErrorDef = {
  code: "RATE_LIMITED",
  message: "You're moving fast. Slow down a moment and try again.",
};

// ── Crawl ────────────────────────────────────────────────────────────────────

export const crawlTargetBlocked: ErrorDef = {
  code: "CRAWL_TARGET_BLOCKED",
  message: "This site won't let us scan it. Try a different site.",
};

export const crawlFailed: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "We couldn't scan that site. Please try again — email support@goodshepherdinsights.com if it keeps happening.",
};

export const crawlTimeout: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "That site took too long to respond. Please try again.",
};

// ── Rendering ────────────────────────────────────────────────────────────────

export const renderInvalidTarget: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "We couldn't process that page. Please try again.",
};

export const renderEmptyResponse: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "That page came back blank. It may be blocking us — try a different URL.",
};

export const renderFailed: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "We couldn't load that page. Please try again — email support@goodshepherdinsights.com if it keeps happening.",
};

// ── Rank tracking ────────────────────────────────────────────────────────────

export const rankNoKeywords: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "Add at least one keyword to start tracking your rankings.",
};

// ── Project ──────────────────────────────────────────────────────────────────

export const projectArchiveOnly: ErrorDef = {
  code: "CONFLICT",
  message: "You need at least one project. Create a new one before archiving this.",
};

export const projectStopAudit: ErrorDef = {
  code: "CONFLICT",
  message: "We couldn't stop that audit. Refresh and try again — email support@goodshepherdinsights.com if it keeps happening.",
};

export const projectDefault: ErrorDef = {
  code: "CONFLICT",
  message: "We couldn't save that change. Please try again.",
};

// ── Permission ───────────────────────────────────────────────────────────────

export const forbidden: ErrorDef = {
  code: "FORBIDDEN",
  message: "Only the project owner can do that. Ask them to make the change.",
};

// ── Stub ─────────────────────────────────────────────────────────────────────

export const notImplemented: ErrorDef = {
  code: "INTERNAL_ERROR",
  message: "This feature is coming soon. Check back in a few days.",
};
