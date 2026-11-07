export const GOOGLE_ADS_ID = "AW-18558576145";
export const GOOGLE_ADS_CONVERSION_LABEL = "r3RhCK6j47IdEJHMtZFF";
export const GOOGLE_ADS_SEND_TO = `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`;
export const GOOGLE_CONSENT_DENIED = {
  ad_storage: "denied",
  analytics_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

export const CONSENT_STORAGE_KEY = "eret-cookie-consent-v2";
export const LEGACY_CONSENT_STORAGE_KEY = "cookie-consent";
export const CONSENT_CHANGE_EVENT = "eret-consent-change";
export const GOOGLE_ADS_READY_EVENT = "eret-google-ads-ready";
export const CASH_CONFIRMATION_STORAGE_KEY = "eret-cash-confirmation";

const ATTEMPT_TIMEOUT_MS = 3_000;
const GOOGLE_EVENT_TIMEOUT_MS = 5_000;
const RETRY_DELAY_MS = 1_000;
const RETRY_COOLDOWN_MS = 5 * 60_000;
const MAX_AUTOMATIC_ATTEMPTS = 2;

export type ConsentChoice = {
  version: 2;
  advertising: boolean;
};

export type PurchaseConversion = {
  transactionId: string;
  value: number;
  currency: "EUR";
};

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type Gtag = (...args: unknown[]) => void;
type TimerHandle = ReturnType<typeof setTimeout>;

type RetryRecord = {
  attempts: number;
  nextRetryAt: number;
};

type DispatcherOptions = {
  storage: StorageLike;
  gtag: Gtag;
  getPageLocation: () => string;
  now?: () => number;
  setTimer?: (callback: () => void, delay: number) => TimerHandle;
  clearTimer?: (handle: TimerHandle) => void;
};

export function parseConsentChoice(value: string | null): ConsentChoice | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ConsentChoice>;
    if (parsed.version !== 2 || typeof parsed.advertising !== "boolean") return null;
    return { version: 2, advertising: parsed.advertising };
  } catch {
    return null;
  }
}

export function readConsentChoice(storage: StorageLike): ConsentChoice | null {
  const current = parseConsentChoice(storage.getItem(CONSENT_STORAGE_KEY));
  if (current) return current;

  // A previous rejection remains a rejection. The old generic acceptance did
  // not explicitly cover advertising and therefore must not be upgraded.
  if (storage.getItem(LEGACY_CONSENT_STORAGE_KEY) === "rejected") {
    return { version: 2, advertising: false };
  }

  return null;
}

export function isPurchaseConversion(value: unknown): value is PurchaseConversion {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PurchaseConversion>;

  return (
    typeof candidate.transactionId === "string" &&
    /^(cash|stripe):[A-Za-z0-9_-]+$/.test(candidate.transactionId) &&
    typeof candidate.value === "number" &&
    Number.isFinite(candidate.value) &&
    candidate.value >= 0 &&
    candidate.currency === "EUR"
  );
}

export function parsePurchaseConversion(value: string | null): PurchaseConversion | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return isPurchaseConversion(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function sanitizePageLocation(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "";
  }
}

export function getSafeGooglePageMetadata(value: string) {
  return {
    page_location: sanitizePageLocation(value),
    page_referrer: "",
  } as const;
}

export function getGoogleAdsConfig(value: string) {
  return {
    allow_ad_personalization_signals: false,
    send_page_view: false,
    ...getSafeGooglePageMetadata(value),
  } as const;
}

export function conversionMarkerKey(transactionId: string) {
  return `eret-google-ads-sent:${transactionId}`;
}

function retryMarkerKey(transactionId: string) {
  return `eret-google-ads-retry:${transactionId}`;
}

export function createPurchaseDispatcher({
  storage,
  gtag,
  getPageLocation,
  now = Date.now,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
}: DispatcherOptions) {
  let advertisingConsent = false;
  const active = new Map<string, { token: symbol; timer: TimerHandle }>();
  const waiting = new Map<string, TimerHandle>();
  const sentInMemory = new Set<string>();
  const retryInMemory = new Map<string, RetryRecord>();

  const safeGet = (key: string) => {
    try { return storage.getItem(key); } catch { return null; }
  };
  const safeSet = (key: string, value: string) => {
    try { storage.setItem(key, value); } catch { /* In-memory guards still apply. */ }
  };
  const safeRemove = (key: string) => {
    try { storage.removeItem(key); } catch { /* In-memory guards still apply. */ }
  };

  const readRetry = (transactionId: string): RetryRecord => {
    const memory = retryInMemory.get(transactionId);
    if (memory) return memory;
    try {
      const parsed = JSON.parse(safeGet(retryMarkerKey(transactionId)) || "null") as RetryRecord | null;
      if (
        parsed &&
        Number.isInteger(parsed.attempts) &&
        parsed.attempts >= 0 &&
        Number.isFinite(parsed.nextRetryAt)
      ) {
        return parsed;
      }
    } catch { /* Invalid retry state is ignored. */ }
    return { attempts: 0, nextRetryAt: 0 };
  };

  const writeRetry = (transactionId: string, record: RetryRecord) => {
    retryInMemory.set(transactionId, record);
    safeSet(retryMarkerKey(transactionId), JSON.stringify(record));
  };

  const clearRetry = (transactionId: string) => {
    retryInMemory.delete(transactionId);
    safeRemove(retryMarkerKey(transactionId));
  };

  const cancelPending = () => {
    for (const attempt of active.values()) clearTimer(attempt.timer);
    for (const timer of waiting.values()) clearTimer(timer);
    active.clear();
    waiting.clear();
  };

  const setAdvertisingConsent = (granted: boolean) => {
    advertisingConsent = granted;
    if (!granted) cancelPending();
  };

  const hasSent = (transactionId: string) =>
    sentInMemory.has(transactionId) || safeGet(conversionMarkerKey(transactionId)) === "sent";

  const markSent = (transactionId: string) => {
    sentInMemory.add(transactionId);
    safeSet(conversionMarkerKey(transactionId), "sent");
    clearRetry(transactionId);
  };

  const scheduleRetry = (purchase: PurchaseConversion, delay: number) => {
    if (waiting.has(purchase.transactionId) || !advertisingConsent) return;
    const timer = setTimer(() => {
      waiting.delete(purchase.transactionId);
      if (advertisingConsent) dispatch(purchase);
    }, Math.max(delay, 0));
    waiting.set(purchase.transactionId, timer);
  };

  const failAttempt = (
    purchase: PurchaseConversion,
    token: symbol,
    attempts: number
  ) => {
    const current = active.get(purchase.transactionId);
    if (!current || current.token !== token) return;
    clearTimer(current.timer);
    active.delete(purchase.transactionId);

    const canRetryAutomatically = attempts < MAX_AUTOMATIC_ATTEMPTS;
    const nextRetryAt = now() + (canRetryAutomatically ? RETRY_DELAY_MS : RETRY_COOLDOWN_MS);
    writeRetry(purchase.transactionId, { attempts, nextRetryAt });
    if (canRetryAutomatically && advertisingConsent) {
      scheduleRetry(purchase, RETRY_DELAY_MS);
    }
  };

  const attemptDispatch = (purchase: PurchaseConversion, attempts: number) => {
    const token = Symbol(purchase.transactionId);
    const timer = setTimer(
      () => failAttempt(purchase, token, attempts),
      ATTEMPT_TIMEOUT_MS
    );
    active.set(purchase.transactionId, { token, timer });
    writeRetry(purchase.transactionId, {
      attempts,
      nextRetryAt: now() + ATTEMPT_TIMEOUT_MS,
    });

    const eventCallback = () => {
      const current = active.get(purchase.transactionId);
      if (!current || current.token !== token || !advertisingConsent) return;
      clearTimer(current.timer);
      active.delete(purchase.transactionId);
      markSent(purchase.transactionId);
    };

    try {
      gtag("event", "conversion", {
        send_to: GOOGLE_ADS_SEND_TO,
        value: purchase.value,
        currency: purchase.currency,
        transaction_id: purchase.transactionId,
        ...getSafeGooglePageMetadata(getPageLocation()),
        event_callback: eventCallback,
        event_timeout: GOOGLE_EVENT_TIMEOUT_MS,
      });
      return true;
    } catch {
      failAttempt(purchase, token, attempts);
      return false;
    }
  };

  function dispatch(purchase: PurchaseConversion) {
    if (!advertisingConsent || !isPurchaseConversion(purchase)) return false;
    if (hasSent(purchase.transactionId)) return false;
    if (active.has(purchase.transactionId) || waiting.has(purchase.transactionId)) return false;

    let retry = readRetry(purchase.transactionId);
    const currentTime = now();
    if (retry.nextRetryAt > currentTime) {
      if (retry.attempts < MAX_AUTOMATIC_ATTEMPTS) {
        scheduleRetry(purchase, retry.nextRetryAt - currentTime);
      }
      return false;
    }

    if (retry.attempts >= MAX_AUTOMATIC_ATTEMPTS) {
      retry = { attempts: 0, nextRetryAt: 0 };
      writeRetry(purchase.transactionId, retry);
    }

    return attemptDispatch(purchase, retry.attempts + 1);
  }

  return {
    dispatch,
    setAdvertisingConsent,
    hasAdvertisingConsent: () => advertisingConsent,
    cancelPending,
  };
}

let authoritativeAdvertisingConsent = false;
let browserDispatcher: ReturnType<typeof createPurchaseDispatcher> | null = null;

function getBrowserDispatcher() {
  if (typeof window === "undefined") return null;
  if (!browserDispatcher) {
    browserDispatcher = createPurchaseDispatcher({
      storage: window.localStorage,
      gtag: (...args: unknown[]) => window.gtag?.(...args),
      getPageLocation: () => window.location.href,
    });
    browserDispatcher.setAdvertisingConsent(authoritativeAdvertisingConsent);
  }
  return browserDispatcher;
}

export function setAuthoritativeAdvertisingConsent(granted: boolean) {
  authoritativeAdvertisingConsent = granted;
  getBrowserDispatcher()?.setAdvertisingConsent(granted);
}

export function hasAuthoritativeAdvertisingConsent() {
  return authoritativeAdvertisingConsent;
}

export function dispatchGoogleAdsPurchase(purchase: PurchaseConversion) {
  return getBrowserDispatcher()?.dispatch(purchase) ?? false;
}
