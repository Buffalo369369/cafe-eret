export const CAFE_TIME_ZONE = "Europe/Berlin";
export const ORDERING_REOPENS_ON = "2026-08-25";

export const VACATION_NOTICE = `🌴 Wir machen Urlaub!

Unser Café ist bis einschließlich 24. August geschlossen.
Ab dem 25. August sind wir wieder für Sie da und nehmen gerne Ihre Bestellungen entgegen.

Vielen Dank für Ihr Verständnis ❤️
Ihr ERET Café Team`;

function getBerlinDateKey(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CAFE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

/**
 * Ordering is unavailable through 24 August 2026 in the cafe's local time.
 * Comparing ISO date keys avoids any server or browser timezone differences.
 */
export function getOrderingAvailability(now = new Date()) {
  const berlinDate = getBerlinDateKey(now);

  return {
    isAvailable: berlinDate >= ORDERING_REOPENS_ON,
    berlinDate,
  };
}
