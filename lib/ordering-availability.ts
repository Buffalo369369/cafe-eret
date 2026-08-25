export const CAFE_TIME_ZONE = "Europe/Berlin";
export const CLOSED_CAFE_NOTICE =
  "Das Café ist derzeit geschlossen. Bestellungen sind nur während unserer Öffnungszeiten möglich.";
export const NO_TODAY_SLOTS_NOTICE =
  "Für heute können leider keine weiteren Bestellungen angenommen werden.";

export type BerlinDateTime = {
  date: string;
  hour: number;
  minute: number;
};

export function getBerlinDateTime(now = new Date()): BerlinDateTime {
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

export function getOrderingAvailability(now = new Date()) {
  const berlinDateTime = getBerlinDateTime(now);

  return {
    isAvailable: isTimeWithinOpeningHours(berlinDateTime),
    berlinDate: berlinDateTime.date,
    message: CLOSED_CAFE_NOTICE,
  };
}

/** Returns future same-day pickup times in 15-minute intervals, ending at 17:30. */
export function getAvailableTodayTimeSlots(now = new Date()) {
  const berlinDateTime = getBerlinDateTime(now);
  const hours = getOpeningHoursForDate(berlinDateTime.date);
  if (!hours) return [];

  const [openingHour, openingMinute] = hours.opensAt.split(":").map(Number);
  const openingMinutes = openingHour * 60 + openingMinute;
  const currentMinutes = berlinDateTime.hour * 60 + berlinDateTime.minute;
  const lastSlotMinutes = 17 * 60 + 30;
  const slots: string[] = [];

  for (let minutes = openingMinutes; minutes <= lastSlotMinutes; minutes += 15) {
    if (minutes <= currentMinutes) continue;

    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    slots.push(`${hour}:${minute}`);
  }

  return slots;
}

/** Validates the only supported timing modes for both cash and Stripe orders. */
export function validateOrderTiming({
  timeType,
  selectedTime,
  requestedDate,
  now = new Date(),
}: {
  timeType: unknown;
  selectedTime: unknown;
  requestedDate: unknown;
  now?: Date;
}) {
  // A date is not accepted at all: today-only orders use Berlin's current date.
  if (
    requestedDate !== undefined &&
    requestedDate !== null &&
    requestedDate !== ""
  ) {
    return "Bestellungen für ein anderes Datum sind nicht möglich.";
  }

  if (timeType === "asap" && !selectedTime) return null;

  if (timeType !== "today") {
    return "Ungültige Bestellzeit.";
  }

  const slots = getAvailableTodayTimeSlots(now);
  if (slots.length === 0) return NO_TODAY_SLOTS_NOTICE;

  if (typeof selectedTime !== "string" || !slots.includes(selectedTime)) {
    return "Bitte wählen Sie eine verfügbare Uhrzeit für heute.";
  }

  return null;
}
