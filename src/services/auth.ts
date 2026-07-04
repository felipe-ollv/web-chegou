type AuthPayload = {
  phone?: string;
  ps?: string;
  cs?: string;
  ts?: string;
  exp?: number;
};

let authToken: string | null = null;
const AUTH_NOTICE_KEY = "auth_notice";

export type AuthNotice = "session-expired";

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

export const saveAuthNotice = (notice: AuthNotice): void => {
  window.sessionStorage.setItem(AUTH_NOTICE_KEY, notice);
};

export const consumeAuthNotice = (): AuthNotice | null => {
  const notice = window.sessionStorage.getItem(AUTH_NOTICE_KEY) as AuthNotice | null;

  if (notice) {
    window.sessionStorage.removeItem(AUTH_NOTICE_KEY);
  }

  return notice;
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

export const isJwtTokenValid = (token: string | null | undefined): boolean => {
  if (!token) return false;

  const payload = decodeJwt(token);
  if (!payload) return false;

  if (payload.exp) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (nowInSeconds >= payload.exp) {
      return false;
    }
  }

  return true;
};

export const isTokenValid = (): boolean => {
  const token = getAuthToken();

  if (!isJwtTokenValid(token)) {
    if (token) {
      clearAuthToken();
    }

    return false;
  }

  return true;
};

export const isSindico = (): boolean => {
  const { profileType } = getAuthContext();
  return profileType === "SINDICO" || profileType === "MANAGER" || profileType === "ADMIN";
};
