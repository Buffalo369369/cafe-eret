export const CAFE_TIME_ZONE = "Europe/Berlin";
export const ORDERING_REOPENS_ON = "2026-08-25";

export const VACATION_NOTICE = `🌴 Wir machen Urlaub!

Unser Café ist bis einschließlich 24. August geschlossen.
Ab dem 25. August sind wir wieder für Sie da und nehmen gerne Ihre Bestellungen entgegen.

Vielen Dank für Ihr Verständnis ❤️
Ihr ERET Café Team`;

export const ORDERING_HOURS_NOTICE =
  "Bestellungen sind zu unseren Öffnungszeiten möglich: Dienstag–Freitag 09:00–18:00 Uhr, Samstag–Sonntag 10:00–18:00 Uhr.";

type BerlinDateTime = {
  date: string;
  hour: number;
  minute: number;
};

function getBerlinDateTime(now: Date): BerlinDateTime {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CAFE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    hour: Number(value("hour")),
    minute: Number(value("minute")),
  };
}

export function getOpeningHoursForDate(date: string) {
  // Noon UTC preserves the requested calendar date when determining its weekday.
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();

  if (weekday === 1) return null;

  return {
    opensAt: weekday >= 2 && weekday <= 5 ? "09:00" : "10:00",
    closesAt: "18:00",
  };
}

export function isTimeWithinOpeningHours({
  date,
  hour,
  minute,
}: BerlinDateTime) {
  const hours = getOpeningHoursForDate(date);
  if (!hours) return false;

  const [openingHour, openingMinute] = hours.opensAt.split(":").map(Number);
  const [closingHour, closingMinute] = hours.closesAt.split(":").map(Number);
  const currentMinutes = hour * 60 + minute;
  const openingMinutes = openingHour * 60 + openingMinute;
  const closingMinutes = closingHour * 60 + closingMinute;

  return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
}

/**
 * Enforces vacation and regular opening hours in the cafe's local timezone.
 * Orders reopen automatically on 25 August 2026 and are then accepted only
 * Tuesday–Friday 09:00–18:00 and Saturday–Sunday 10:00–18:00.
 */
export function getOrderingAvailability(now = new Date()) {
  const berlinDateTime = getBerlinDateTime(now);
  const isVacation = berlinDateTime.date < ORDERING_REOPENS_ON;
  const isOpen = isTimeWithinOpeningHours(berlinDateTime);

  return {
    isAvailable: !isVacation && isOpen,
    berlinDate: berlinDateTime.date,
    isVacation,
    message: isVacation ? VACATION_NOTICE : ORDERING_HOURS_NOTICE,
  };
}
