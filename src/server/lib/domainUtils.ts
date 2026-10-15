import { getDomain } from "tldts";
import { domainInvalid, domainRequired } from "@/shared/errors";
import { AppError } from "@/server/lib/errors";
import {
  isValidDomainHost,
  parseResearchTarget,
  type ResearchScope,
  type ResearchTarget,
} from "@/shared/researchScope";

export function parseResearchTargetOrThrow(
  input: string,
  scope?: ResearchScope,
): ResearchTarget {
  const parsed = parseResearchTarget(input, scope);
  if (!parsed.ok) {
    throw new AppError(domainInvalid.code, parsed.message);
  }
  return parsed.target;
}

export function toRelativePath(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}` || "/";
  } catch {
    return null;
  }
}

export function normalizeDomainInput(
  input: string,
  includeSubdomains: boolean,
): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    throw new AppError(domainRequired.code, domainRequired.message);
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let host: string;
  try {
    host = new URL(withProtocol).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    throw new AppError(domainInvalid.code, domainInvalid.message);
  }

  if (!host) {
    throw new AppError(domainInvalid.code, domainInvalid.message);
  }

  // Reject fake TLDs / non-registrable hosts (e.g. "example.por") before they
  // reach DataForSEO and come back as an opaque "Invalid Field: 'target'".
  if (!isValidDomainHost(host)) {
    throw new AppError(domainInvalid.code, domainInvalid.message);
  }

  if (includeSubdomains) {
    return host;
  }

  return getDomain(host) ?? host;
}
