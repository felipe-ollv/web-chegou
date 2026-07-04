import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from "react";
import {
  setUnauthorizedHandler,
  setUserDataSetter,
  setToken as setApiToken,
} from "../services/api";
import { clearAuthToken, decodeJwt, saveAuthNotice, saveAuthToken } from "../services/auth";

type UserContextType = {
    userData: any | null;
    setUserData: React.Dispatch<React.SetStateAction<any | null>>;
    token: string | null;
    selectedCondominium: any | null;
    setSelectedCondominium: React.Dispatch<React.SetStateAction<any | null>>;
    shouldShowSessionNotice: boolean;
    saveTokenAndLogin: (newToken: string) => void;
    selectCondominium: (condominium: any) => void;
    consumeSessionNotice: () => void;
    logout: () => void;
    expireSession: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedCondominium, setSelectedCondominium] = useState<any | null>(null);
  const [shouldShowSessionNotice, setShouldShowSessionNotice] = useState(false);
  const sessionTimeoutRef = useRef<number | null>(null);

  const clearSessionTimeout = () => {
    if (sessionTimeoutRef.current !== null) {
      window.clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  };

  const resetSessionState = () => {
    clearSessionTimeout();
    clearAuthToken();
    setToken(null);
    setApiToken(null);
    setUserData(null);
    setSelectedCondominium(null);
    setShouldShowSessionNotice(false);
  };

  const redirectToLogin = () => {
    if (window.location.pathname !== "/entrar") {
      window.location.replace("/entrar");
    }
  };

  const expireSession = () => {
    saveAuthNotice("session-expired");
    resetSessionState();
    redirectToLogin();
  };

  const scheduleSessionExpiration = (newToken: string) => {
    clearSessionTimeout();

    const payload = decodeJwt(newToken);
    const expiresAt = payload?.exp ? payload.exp * 1000 : null;

    if (!expiresAt) {
      return;
    }

    const remainingTime = expiresAt - Date.now();

    if (remainingTime <= 0) {
      expireSession();
      return;
    }

    sessionTimeoutRef.current = window.setTimeout(() => {
      expireSession();
    }, remainingTime);
  };

  useEffect(() => {
    setUserDataSetter(setUserData);
    setUnauthorizedHandler(() => {
      saveAuthNotice("session-expired");
      resetSessionState();
    });

    return () => {
      clearSessionTimeout();
      setUnauthorizedHandler(undefined);
    };
  }, []);

  const saveTokenAndLogin = (newToken: string) => {
    const decoded = decodeJwt(newToken);

    if (!decoded) {
      resetSessionState();
      redirectToLogin();
      return;
    }

    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      expireSession();
      return;
    }

    setToken(newToken);
    setApiToken(newToken);
    saveAuthToken(newToken);
    setShouldShowSessionNotice(true);
    setUserData(decoded);
    scheduleSessionExpiration(newToken);
  };

  const selectCondominium = (condominium: any) => {
    setSelectedCondominium(condominium);
  };

  const consumeSessionNotice = () => {
    setShouldShowSessionNotice(false);
  };

  const logout = () => {
    resetSessionState();
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        token,
        selectedCondominium,
        setSelectedCondominium,
        shouldShowSessionNotice,
        saveTokenAndLogin,
        selectCondominium,
        consumeSessionNotice,
        logout,
        expireSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser deve ser usado dentro do UserProvider");
  return context;
};
