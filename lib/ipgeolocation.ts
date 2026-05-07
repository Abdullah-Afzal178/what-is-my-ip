import "server-only";

import { isIP } from "node:net";
import { cookies, headers } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { getSessionCache, setSessionCache } from "@/lib/session-cache";
import type { IpLookupData, IpLookupResult } from "@/lib/ip-types";

type JsonObject = Record<string, unknown>;

type ApiError = {
  message?: string;
  detail?: string;
};

const IP_ENDPOINTS = [
  "https://api.ipgeolocation.io/v2/ipgeo",
  "https://api.ipgeolocation.io/v3/ipgeo",
];

export async function getMyIpData(): Promise<IpLookupResult> {
  const headerStore = await headers();
  const clientIp = getPublicClientIp(headerStore);

  return fetchIpLookup({
    cacheKey: "self",
    ip: clientIp,
  });
}

export async function getIpDataByIp(input: string): Promise<IpLookupResult> {
  const ip = input.trim();

  if (!ip) {
    return createErrorResult(
      "Missing IP address",
      "Enter an IPv4 or IPv6 address to run the lookup.",
    );
  }

  if (isIP(ip) === 0) {
    return createErrorResult(
      "Invalid IP address",
      "Enter a valid IPv4 or IPv6 address.",
    );
  }

  return fetchIpLookup({
    cacheKey: `lookup:${ip}`,
    ip,
  });
}

async function fetchIpLookup({
  cacheKey,
  ip,
}: {
  cacheKey: string;
  ip?: string | null;
}): Promise<IpLookupResult> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "anonymous-session";
  const sessionCacheKey = `${sessionId}:${cacheKey}`;
  const cachedResult = getSessionCache<IpLookupData>(sessionCacheKey);

  if (cachedResult) {
    return {
      ok: true,
      cached: true,
      data: cachedResult,
    };
  }

  const apiKey = process.env.IPGEOLOCATION_API_KEY;

  if (!apiKey) {
    return createErrorResult(
      "Missing API key",
      "Set IPGEOLOCATION_API_KEY in your .env file before starting the app.",
    );
  }

  let lastError: IpLookupResult | null = null;

  for (const endpoint of IP_ENDPOINTS) {
    const params = new URLSearchParams({ apiKey });

    if (ip) {
      params.set("ip", ip);
    }

    try {
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorBody = (await safeReadJson(response)) as ApiError | null;
        const result: IpLookupResult = {
          ok: false,
          error: {
            title: getErrorTitle(response.status),
            message:
              errorBody?.message ||
              errorBody?.detail ||
              `The IP geolocation lookup failed with status ${response.status}.`,
            status: response.status,
          },
        };

        lastError = result;

        if (shouldTryNextEndpoint(response.status, endpoint)) {
          continue;
        }

        return result;
      }

      const payload = (await safeReadJson(response)) as JsonObject | null;

      if (!payload) {
        lastError = {
          ok: false,
          error: {
            title: "Invalid API response",
            message: "The API returned an empty or unreadable response.",
          },
        };
        continue;
      }

      const normalized = normalizeIpResponse(payload);

      if (!normalized) {
        lastError = createErrorResult(
          "Unexpected response shape",
          "The API response did not contain the fields needed to render this tool.",
        );
        continue;
      }

      setSessionCache(sessionCacheKey, normalized);

      return {
        ok: true,
        cached: false,
        data: normalized,
      };
    } catch (error) {
      lastError = createErrorResult(
        "Network error",
        error instanceof Error
          ? error.message
          : "The lookup request could not be completed.",
      );
    }
  }

  return (
    lastError ??
    createErrorResult("Lookup failed", "The IP geolocation lookup could not be completed.")
  );
}

function createErrorResult(title: string, message: string, status?: number): IpLookupResult {
  return {
    ok: false,
    error: {
      title,
      message,
      status,
    },
  };
}

function normalizeIpResponse(payload: JsonObject): IpLookupData | null {
  const location = asObject(payload.location);
  const timeZone = asObject(payload.time_zone);
  const currency = asObject(payload.currency);
  const countryMetadata = asObject(payload.country_metadata);
  const company = asObject(payload.company);
  const network = asObject(payload.network);
  const asn = asObject(payload.asn);

  const ip = readString(payload.ip);
  const countryName = readString(location?.country_name) ?? readString(payload.country_name);

  if (!ip || !countryName) {
    return null;
  }

  return {
    ip,
    countryName,
    countryFlag:
      readString(location?.country_flag) ??
      readString(payload.country_flag) ??
      "",
    stateOrRegion:
      formatValue(
        readString(location?.state_prov) ?? readString(payload.state_prov),
      ),
    city: formatValue(readString(location?.city) ?? readString(payload.city)),
    zipcode: formatValue(
      readString(location?.zipcode) ?? readString(payload.zipcode),
    ),
    latitude: formatValue(
      readString(location?.latitude) ?? readString(payload.latitude),
    ),
    longitude: formatValue(
      readString(location?.longitude) ?? readString(payload.longitude),
    ),
    isp: formatValue(
      readString(payload.isp) ??
        readString(company?.name) ??
        readString(asn?.organization),
      "Not provided by this API plan",
    ),
    organization: formatValue(
      readString(payload.organization) ??
        readString(asn?.organization) ??
        readString(company?.name),
      "Not provided by this API plan",
    ),
    connectionType: formatValue(
      readString(payload.connection_type) ?? readString(network?.connection_type),
      "Not provided by this API plan",
    ),
    timezoneName: formatValue(readString(timeZone?.name)),
    currentLocalTime: formatValue(readString(timeZone?.current_time)),
    currencyName: formatValue(readString(currency?.name)),
    currencyCode: formatValue(readString(currency?.code)),
    currencySymbol: formatValue(readString(currency?.symbol)),
    callingCode: formatValue(
      readString(countryMetadata?.calling_code) ?? readString(payload.calling_code),
    ),
  };
}

function shouldTryNextEndpoint(status: number, endpoint: string) {
  return endpoint.endsWith("/v2/ipgeo") && [400, 404, 405].includes(status);
}

function getErrorTitle(status: number) {
  if (status === 401 || status === 403) {
    return "Authentication failed";
  }

  if (status === 429) {
    return "Rate limit reached";
  }

  if (status >= 500) {
    return "API unavailable";
  }

  return "Lookup failed";
}

function formatValue(value: string | null | undefined, fallback = "Unavailable") {
  if (!value || !value.trim()) {
    return fallback;
  }

  return value;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

async function safeReadJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getPublicClientIp(headerStore: Headers) {
  const forwarded = [
    headerStore.get("x-forwarded-for"),
    headerStore.get("x-real-ip"),
    headerStore.get("cf-connecting-ip"),
    headerStore.get("x-vercel-forwarded-for"),
    headerStore.get("forwarded"),
  ];

  for (const value of forwarded) {
    const candidate = extractIpCandidate(value);

    if (candidate && isPublicIp(candidate)) {
      return candidate;
    }
  }

  return null;
}

function extractIpCandidate(value: string | null) {
  if (!value) {
    return null;
  }

  const cleaned = value
    .split(",")
    .map((item) => item.trim())
    .find(Boolean);

  if (!cleaned) {
    return null;
  }

  if (cleaned.startsWith("for=")) {
    const match = cleaned.match(/for="?(\[[^\]]+\]|[^;"]+)/i);
    const ip = match?.[1]?.replace(/^\[|\]$/g, "");
    return ip ?? null;
  }

  return cleaned.replace(/^\[|\]$/g, "");
}

function isPublicIp(ip: string) {
  if (ip === "::1" || ip === "127.0.0.1") {
    return false;
  }

  if (ip.includes(":")) {
    const normalized = ip.toLowerCase();

    return !(
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80") ||
      normalized.startsWith("::ffff:127.")
    );
  }

  const octets = ip.split(".").map(Number);

  if (octets.length !== 4 || octets.some((part) => Number.isNaN(part))) {
    return false;
  }

  if (
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127)
  ) {
    return false;
  }

  return true;
}
