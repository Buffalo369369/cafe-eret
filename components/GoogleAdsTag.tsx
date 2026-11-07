"use client";

import { useEffect } from "react";
import {
  CONSENT_CHANGE_EVENT,
  GOOGLE_ADS_ID,
  GOOGLE_ADS_READY_EVENT,
  GOOGLE_CONSENT_DENIED,
  type ConsentChoice,
  getGoogleAdsConfig,
  getSafeGooglePageMetadata,
  hasAuthoritativeAdvertisingConsent,
  readConsentChoice,
  setAuthoritativeAdvertisingConsent,
} from "@/lib/google-ads";

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    __eretGoogleAdsConfigured?: boolean;
    __eretGoogleAdsReady?: boolean;
  }
}

const SCRIPT_ID = "eret-google-ads-tag";

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
  return window.gtag;
}

function setDefaultConsent() {
  ensureGtag()("consent", "default", GOOGLE_CONSENT_DENIED);
}

function updateConsent(advertising: boolean) {
  const state = advertising ? "granted" : "denied";
  ensureGtag()("consent", "update", {
    ad_storage: state,
    analytics_storage: "denied",
    ad_user_data: state,
    ad_personalization: "denied",
  });
}

function setSafePageMetadata() {
  ensureGtag()("set", getSafeGooglePageMetadata(window.location.href));
}

function announceReady() {
  if (!hasAuthoritativeAdvertisingConsent()) return;
  window.__eretGoogleAdsReady = true;
  window.dispatchEvent(new Event(GOOGLE_ADS_READY_EVENT));
}

function loadGoogleAdsTag() {
  const gtag = ensureGtag();

  if (!window.__eretGoogleAdsConfigured) {
    window.__eretGoogleAdsConfigured = true;
    setSafePageMetadata();
    gtag("js", new Date());
    gtag("config", GOOGLE_ADS_ID, getGoogleAdsConfig(window.location.href));
  }

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === "true") announceReady();
    return;
  }

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.referrerPolicy = "no-referrer";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ADS_ID)}`;
  script.addEventListener("load", () => {
    script.dataset.loaded = "true";
    announceReady();
  });
  document.head.appendChild(script);
}

export default function GoogleAdsTag() {
  useEffect(() => {
    setDefaultConsent();
    setAuthoritativeAdvertisingConsent(false);

    let stored: ConsentChoice | null = null;
    try {
      stored = readConsentChoice(window.localStorage);
    } catch {
      stored = null;
    }

    if (stored?.advertising) {
      setSafePageMetadata();
      setAuthoritativeAdvertisingConsent(true);
      updateConsent(true);
      loadGoogleAdsTag();
    }

    const handleConsentChange = (event: Event) => {
      const choice = (event as CustomEvent<ConsentChoice>).detail;
      if (!choice || choice.version !== 2) return;
      setSafePageMetadata();
      setAuthoritativeAdvertisingConsent(choice.advertising);
      if (!choice.advertising) window.__eretGoogleAdsReady = false;
      updateConsent(choice.advertising);
      if (choice.advertising) loadGoogleAdsTag();
    };

    window.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChange);
  }, []);

  return null;
}
