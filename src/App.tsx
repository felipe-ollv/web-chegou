import { useState, useEffect, useMemo, ReactNode } from "react";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Sidenav from "examples/Sidenav";

import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

import { CacheProvider } from "@emotion/react";
import createCache, { EmotionCache } from "@emotion/cache";

import routes, { AppRoute } from "routes";
import { useMaterialUIController, setMiniSidenav } from "context";
import { isTokenValid, clearAuthToken } from "services/auth";

// ─── Proteção de rota ─────────────────────────────────────────────────────────

function RotaProtegida({ children }: { children: ReactNode }) {
  if (!isTokenValid()) {
    clearAuthToken();
    return <Navigate to="/entrar" replace />;
  }
  return <>{children}</>;
}

// ─── Geração de <Route> ───────────────────────────────────────────────────────

const getRoutes = (allRoutes: AppRoute[]): ReactNode =>
  allRoutes.flatMap((route) => {
    if (route.collapse) {
      return getRoutes(route.collapse);
    }

    if (route.route && route.component) {
      const element = route.public ? (
        route.component
      ) : (
        <RotaProtegida>{route.component}</RotaProtegida>
      );
      return <Route path={route.route} element={element} key={route.key} />;
    }

    return [];
  });

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, direction, layout, sidenavColor, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const rtlCache = useMemo<EmotionCache>(() => createCache({ key: "rtl" }), []);
  const { pathname } = useLocation();

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const sidebar = layout === "dashboard" && (
    <Sidenav
      color={sidenavColor}
      brandName="ChegouApp"
      brand={null}
      routes={routes}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
    />
  );

  const appRoutes = (
    <Routes>
      {getRoutes(routes)}
      {/* Raiz redireciona para /inicio se autenticado, senão para /entrar */}
      <Route
        path="/"
        element={
          isTokenValid() ? (
            <Navigate to="/inicio" replace />
          ) : (
            <Navigate to="/entrar" replace />
          )
        }
      />
      {/* Qualquer rota desconhecida vai para a raiz */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (direction === "rtl") {
    return (
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
          <CssBaseline />
          {sidebar}
          {appRoutes}
        </ThemeProvider>
      </CacheProvider>
    );
  }

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {sidebar}
      {appRoutes}
    </ThemeProvider>
  );
}
