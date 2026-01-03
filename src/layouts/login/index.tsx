import { useEffect } from "react";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { useMaterialUIController, setLayout } from "context";

import logo from "assets/images/chegou-logo.svg";
import qrImage from "assets/images/qr-chegouapp.svg";

function Login() {
  const [, dispatch] = useMaterialUIController();

  useEffect(() => {
    setLayout(dispatch, "page");

    return () => setLayout(dispatch, "dashboard");
  }, [dispatch]);

  return (
    <MDBox minHeight="100vh" sx={{ backgroundColor: "#0b1327" }}>
      <Grid container sx={{ minHeight: "100vh" }}>
        <Grid item xs={12} md={6}>
          <MDBox
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={{ xs: 4, md: 6 }}
            py={{ xs: 6, md: 0 }}
            sx={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(0,212,43,0.22), transparent 30%), radial-gradient(circle at 80% 80%, rgba(0,212,43,0.12), transparent 30%), linear-gradient(135deg, #0a152a 0%, #050b19 100%)",
            }}
          >
            <MDBox
              component="img"
              src={logo}
              alt="ChegouApp"
              sx={{
                width: "100%",
                maxWidth: 380,
                filter: "drop-shadow(0 14px 34px rgba(0,0,0,0.35))",
              }}
            />
          </MDBox>
        </Grid>

        <Grid item xs={12} md={6}>
          <MDBox
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={{ xs: 3, md: 6 }}
            py={{ xs: 6, md: 0 }}
          >
            <Card sx={{ width: "100%", maxWidth: 420, p: { xs: 3, md: 4 } }}>
              <MDTypography variant="h4" fontWeight="medium" mb={1}>
                Acesse pelo app
              </MDTypography>
              <MDTypography variant="button" color="text">
                Escaneie o QR Code para autenticar no painel do síndico.
              </MDTypography>
              <Divider sx={{ my: 3 }} />
              <MDBox
                component="img"
                src={qrImage}
                alt="QR Code ChegouApp"
                width="100%"
                maxWidth={260}
                mx="auto"
                borderRadius="lg"
                display="block"
                boxShadow="lg"
              />
              <MDTypography
                variant="caption"
                color="text"
                display="block"
                textAlign="center"
                mt={2}
              >
                Abra o aplicativo no celular e aponte a câmera para o QR Code.
              </MDTypography>
            </Card>
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default Login;
