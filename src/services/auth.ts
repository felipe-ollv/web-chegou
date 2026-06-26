type AuthPayload = {
  phone?: string;
  ps?: string;
  cs?: string;
  ts?: string;
  exp?: number;
};

let authToken: string | null = null;

// ─── Token Memory ─────────────────────────────────────────────────────────────

export const getAuthToken = (): string | null => {
  return authToken;
};

export const saveAuthToken = (token: string): void => {
  authToken = token;
};

export const clearAuthToken = (): void => {
  authToken = null;
};

// ─── JWT Decode ───────────────────────────────────────────────────────────────

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

// ─── Auth Context ─────────────────────────────────────────────────────────────

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

// ─── Validações ───────────────────────────────────────────────────────────────

export const isTokenValid = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload) return false;
  if (payload.exp) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (nowInSeconds >= payload.exp) {
      clearAuthToken();
      return false;
    }
  }
  return true;
};

export const isSindico = (): boolean => {
  const { profileType } = getAuthContext();
  return profileType === "SINDICO" || profileType === "MANAGER" || profileType === "ADMIN";
};
