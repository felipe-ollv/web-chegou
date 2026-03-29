import { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { QRCodeCanvas } from "qrcode.react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { useMaterialUIController, setLayout } from "context";

import logo from "assets/images/chegou-logo.svg";
import { RandomCodeGenerating } from "../../utils/random-code-generating";
import { ExecuteInTime } from "../../utils/execute-in-time";
import api from "services/api";

function Login() {
  const [, dispatch] = useMaterialUIController();
  const [ qrValue, setQrValue] = useState("");
  const [ tickTime, setTickTime] = useState(60);

  useEffect(() => {
    const stopCountdown = ExecuteInTime.countdown(
      (remaining) => setTickTime(remaining),
      () => console.log('Tempo esgotado!')
    );

    const newCode = RandomCodeGenerating.generateAlphanumericCode();
    setQrValue(newCode);
    console.log('MUDOU o CODIGO', newCode);

    const stopCodeRefresh = ExecuteInTime.execute(() => {
      const refreshedCode = RandomCodeGenerating.generateAlphanumericCode();
      setQrValue(refreshedCode);
      console.log('MUDOU o CODIGO', refreshedCode);
    }, 60000);

    return () => {
      stopCountdown();
      stopCodeRefresh();
    };
  }, []);

  useEffect(() => {
    // apiFetch('/condominium?condominiumId="43fedb21-ad93-405b-9bf1-e10a67ff1686"');
    setLayout(dispatch, "page");

    return () => setLayout(dispatch, "dashboard");
  }, [dispatch]);

  useEffect(() => {
    if (!qrValue) return;

    const stopValidation = ExecuteInTime.execute(() => {
      validateUser(qrValue);
    }, 5000);

    return () => stopValidation();
  }, [qrValue]);

  async function validateUser(data: string) {
    console.log()
    const res = await api.post('/validate/access', { key: data})
    console.log('chamando o back', res)
  }

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
              <MDTypography variant="h4" textAlign="center" fontWeight="medium" mb={1}>
                Acesse pelo app
              </MDTypography>
              <MDTypography
                variant="button"
                color="text"
                display="block"
                textAlign="start"
                mt={1}
              >
               1 - Abra o aplicativo no celular.
              </MDTypography>
              <MDTypography
                variant="button"
                color="text"
                display="block"
                textAlign="start"
                mt={1}
              >
               2 - Clique em Ajustes.
              </MDTypography>
              <MDTypography
                variant="button"
                color="text"
                display="block"
                textAlign="start"
                mt={1}
              >
               3 - Clique em Acessar painel Web.
              </MDTypography>
              <MDTypography variant="h6" textAlign="center" fontWeight="medium" mt={1}>
                Válido por { tickTime }s
              </MDTypography>
              <Divider sx={{ my: 3 }} />
              <MDBox display="flex" justifyContent="center" alingn-items="center">
                <QRCodeCanvas
                  value={qrValue}
                  size={260}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </MDBox>
              <Divider sx={{ my: 3 }} />
              <MDTypography variant="button" color="text" textAlign="center">
                Escaneie o QR Code para autenticar no painel do síndico.
              </MDTypography>
            </Card>
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default Login;
