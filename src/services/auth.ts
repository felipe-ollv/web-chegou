type AuthPayload = {
  phone?: string;
  ps?: string;
  cs?: string;
  ts?: string;
};

const TOKEN_KEYS = ["chegou:token", "token"];

export const getAuthToken = (): string | null => {
  for (const key of TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }
  return null;
};

export const decodeJwt = (token: string): AuthPayload | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getAuthContext = (): {
  profileUuid?: string;
  condominiumUuid?: string;
  profileType?: string;
} => {
  const token = getAuthToken();
  if (!token) return {};
  const payload = decodeJwt(token);
  if (!payload) return {};
  return {
    profileUuid: payload.ps,
    condominiumUuid: payload.cs,
    profileType: payload.ts,
  };
};

