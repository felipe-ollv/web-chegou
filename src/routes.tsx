import { ReactNode } from "react";

import Home from "layouts/home";
import Condominios from "layouts/condominios";
import Recebimentos from "layouts/recebimentos";
import Moradores from "layouts/moradores";
import Avisos from "layouts/avisos";
import Login from "layouts/login";

import Icon from "@mui/material/Icon";

export type AppRoute = {
  type?: string;
  name?: string;
  key: string;
  icon?: ReactNode;
  route?: string;
  component?: ReactNode;
  collapse?: AppRoute[];
};

const routes: AppRoute[] = [
  {
    type: "collapse",
    name: "Início",
    key: "home",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/",
    component: <Home />,
  },
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
    name: "Recebimentos",
    key: "recebimentos",
    icon: <Icon fontSize="small">inventory_2</Icon>,
    route: "/recebimentos",
    component: <Recebimentos />,
  },
  {
    type: "collapse",
    name: "Moradores",
    key: "moradores",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/moradores",
    component: <Moradores />,
  },
  {
    type: "collapse",
    name: "Avisos",
    key: "avisos",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/avisos",
    component: <Avisos />,
  },
  {
    type: "route",
    name: "Login",
    key: "login",
    route: "/login",
    component: <Login />,
  },
];

export default routes;
