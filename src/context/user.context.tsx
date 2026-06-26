import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { setUserDataSetter, setToken as setApiToken } from '../services/api';
import { clearAuthToken, saveAuthToken } from '../services/auth';

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
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [userData, setUserData] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [selectedCondominium, setSelectedCondominium] = useState<any | null>(null);
    const [shouldShowSessionNotice, setShouldShowSessionNotice] = useState(false);

    useEffect(() => {
        setUserDataSetter(setUserData);
    }, []);

    const saveTokenAndLogin = (newToken: string) => {
        setToken(newToken);
        setApiToken(newToken);
        saveAuthToken(newToken);
        setShouldShowSessionNotice(true);

        try {
            const decoded = jwtDecode(newToken);
            setUserData(decoded);
        } catch (error) {
            console.error("Erro ao decodificar o token JWT", error);
        }
    };

    const selectCondominium = (condominium: any) => {
        setSelectedCondominium(condominium);
    };

    const consumeSessionNotice = () => {
        setShouldShowSessionNotice(false);
    };

    const logout = () => {
        clearAuthToken();
        setToken(null);
        setApiToken(null);
        setUserData(null);
        setSelectedCondominium(null);
        setShouldShowSessionNotice(false);
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
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser deve ser usado dentro do UserProvider');
    return context;
};
