/** Decode a JWT payload and check its time-based validity. */
export const isAccessTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payloadJson = decodeURIComponent(
      Array.from(atob(padded), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
    );
    const payload = JSON.parse(payloadJson);
    const now = Date.now() / 1000;

    return Number.isFinite(payload.exp) && payload.exp > now && (!payload.nbf || payload.nbf <= now);
  } catch {
    return false;
  }
};

export const clearAuthSession = () => {
  ['access_token', 'currentUser', 'authUser', 'savedProfileImage'].forEach((key) => localStorage.removeItem(key));
};
