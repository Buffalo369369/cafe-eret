export function isAdminAuthorized(authorization: string | null) {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD || !authorization?.startsWith("Basic ")) return false;
  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    return separator >= 0 && decoded.slice(0, separator) === process.env.ADMIN_USER &&
      decoded.slice(separator + 1) === process.env.ADMIN_PASSWORD;
  } catch { return false; }
}
