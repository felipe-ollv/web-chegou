import { ReactNode } from "react";

import Home from "layouts/home";
import Condominios from "layouts/condominios";
import Receipts from "layouts/recebimentos";
import Residents from "layouts/moradores";
import Avisos from "layouts/avisos";
import Login from "layouts/login";

import Icon from "@mui/material/Icon";
import Dashboard from "layouts/dashboard";

export type AppRoute = {
  type?: string;
  name?: string;
  key: string;
  icon?: ReactNode;
  route?: string;
  component?: ReactNode;
  collapse?: AppRoute[];
  public?: boolean;
};

const routes: AppRoute[] = [
  // ─── Rota pública ─────────────────────────────────────────────────────────
  {
    type: "route",
    name: "Login",
    key: "login",
    route: "/entrar",
    component: <Login />,
    public: true,
  },

  // ─── Rotas protegidas (sidebar) ───────────────────────────────────────────
  {
    type: "collapse",
    name: "Condomínios",
    key: "condominios",
    icon: <Icon fontSize="small">business</Icon>,
    route: "/condominios",
    component: <Condominios />,
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "home",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/dashboard",
    component: <Home />,
  },
  {
    type: "collapse",
    name: "Recebimentos",
    key: "recebimentos",
    icon: <Icon fontSize="small">inventory_2</Icon>,
    route: "/recebimentos",
    component: <Receipts />,
  },
  {
    type: "collapse",
    name: "Moradores",
    key: "moradores",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/moradores",
    component: <Residents />,
  },
  {
    type: "collapse",
    name: "Avisos",
    key: "avisos",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/avisos",
    component: <Avisos />,
  },
];

export default routes;
