import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { setUserDataSetter, setToken as setApiToken } from '../services/api';
import { clearAuthToken } from '../services/auth';

type UserContextType = {
    userData: any | null;
    setUserData: React.Dispatch<React.SetStateAction<any | null>>;
    token: string | null;
    saveTokenAndLogin: (newToken: string) => void;
    logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [userData, setUserData] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setUserDataSetter(setUserData);
    }, []);

    const saveTokenAndLogin = (newToken: string) => {
        setToken(newToken);
        setApiToken(newToken);

        try {
            const decoded = jwtDecode(newToken);
            console.log(decoded);
            setUserData(decoded);
        } catch (error) {
            console.error("Erro ao decodificar o token JWT", error);
        }
    };

    const logout = () => {
        clearAuthToken();
        sessionStorage.removeItem("showSessionNotice");
        setToken(null);
        setApiToken(null);
        setUserData(null);
    };

    return (
        <UserContext.Provider value={{ userData, setUserData, token, saveTokenAndLogin, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser deve ser usado dentro do UserProvider');
    return context;
};
