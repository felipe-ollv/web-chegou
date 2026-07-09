import axios from "axios";
import { isTokenValid } from "./auth";

const api = axios.create({
  baseURL: "https://www.app-chegou.com.br/api/painel",
});

let token: string | null = null;
let unauthorizedHandler: (() => void) | undefined;

const publicPaths = ["/health", "/validate/access"];

const isPublicPath = (url?: string) => publicPaths.some((path) => url?.startsWith(path));

const redirectToLogin = (reason?: string) => {
  const target = reason ? `/entrar?reason=${encodeURIComponent(reason)}` : "/entrar";
  if (`${window.location.pathname}${window.location.search}` !== target) {
    window.location.replace(target);
  }
};

const handleUnauthorized = () => {
  unauthorizedHandler?.();
  redirectToLogin("session-expired");
};

export const setToken = (newToken: string | null) => {
  token = newToken;
};

export const setUnauthorizedHandler = (handler?: () => void) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use(
  async (config) => {
    const isPublic = isPublicPath(config.url);

    if (!isPublic && (!token || !isTokenValid())) {
      handleUnauthorized();
      return Promise.reject(new Error("Token inválido ou expirado"));
    }

    if (!isPublic && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isPublic = isPublicPath(error?.config?.url);

    if (!isPublic && (status === 401 || status === 403)) {
      handleUnauthorized();
    }

    return Promise.reject(error);
  }
);

export default api;
