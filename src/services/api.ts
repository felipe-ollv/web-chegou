
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: 'https://app-chegou.com.br/api/painel',
});

let token: string | null = null;
let setUserDataGlobal: ((data: any) => void) | undefined;

export const setToken = (newToken: string | null) => {
  token = newToken;
};

export const setUserDataSetter = (setter: (data: any) => void) => {
  setUserDataGlobal = setter;
};

api.interceptors.request.use(
  async (config) => {
    if (!token) {
      if (token && setUserDataGlobal) {
        try {
          const decoded = jwtDecode(token);
          setUserDataGlobal(decoded);
        } catch (e) {
          console.log("Erro ao decodificar token no intercept", e);
        }
      }
    }

    const publicPaths = ['/validate/access'];
    const isPublic = publicPaths.some(path => config.url?.startsWith(path));

    if (!isPublic && !token) {
      // routes.replace("/"); 
      return Promise.reject("Token ausente");
    }

    if (!isPublic && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
