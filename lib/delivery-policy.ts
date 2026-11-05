// Historical local delivery policy recovered from the app's working implementation.
// This matches the verified cafe coordinates and delivery bands used before the
// pickup-only lockout. The quote logic remains intentionally identical to the
// original service behavior and is suitable for server-side validation.
export const DELIVERY_ENABLED = true;
export const EXISTING_DELIVERY_CONFIG = {
  latitude: 51.4308,
  longitude: 6.8797,
  nearRadiusKm: 3,
  outerRadiusKm: 5,
  nearFee: 2.9,
  outerFee: 3.9,
} as const;

export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function existingDeliveryQuote(distanceKm: number) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return { available: false, fee: 0 };
  const c = EXISTING_DELIVERY_CONFIG;
  return distanceKm <= c.nearRadiusKm
    ? { available: true, fee: c.nearFee }
    : distanceKm <= c.outerRadiusKm
      ? { available: true, fee: c.outerFee }
      : { available: false, fee: 0 };
}

export async function resolveDeliveryQuoteFromAddress(address: string) {
  if (!DELIVERY_ENABLED) {
    return { available: false, fee: 0, distanceKm: Number.NaN, message: "Lieferung derzeit nicht verfügbar." };
  }

  const cleanedAddress = typeof address === "string" ? address.trim() : "";
  if (!cleanedAddress) {
    return { available: false, fee: 0, distanceKm: Number.NaN, message: "No address" };
  }

  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanedAddress)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "ERET Cafe Delivery System",
        },
      },
    );

    const geoData = await geoRes.json();
    if (!Array.isArray(geoData) || !geoData.length) {
      return { available: false, fee: 0, distanceKm: Number.NaN, message: "Adresse nicht gefunden" };
    }

    const lat = Number(geoData[0].lat);
    const lon = Number(geoData[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return { available: false, fee: 0, distanceKm: Number.NaN, message: "Adresse nicht gefunden" };
    }

    const distanceKm = getDistanceKm(EXISTING_DELIVERY_CONFIG.latitude, EXISTING_DELIVERY_CONFIG.longitude, lat, lon);
    const quote = existingDeliveryQuote(distanceKm);

    return {
      available: quote.available,
      fee: quote.fee,
      distanceKm,
      message: quote.available ? "" : "Lieferung nicht verfügbar",
    };
  } catch (error) {
    console.error("Delivery quote resolution failed:", error);
    return { available: false, fee: 0, distanceKm: Number.NaN, message: "Adresse nicht gefunden" };
  }
}
