import { useEffect, useState, useRef } from "react";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { QRCodeCanvas } from "qrcode.react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useUser } from "context/user.context";
import { useMaterialUIController, setLayout } from "context";
import { useNavigate } from "react-router-dom";

import logo from "assets/images/chegou-logo.svg";
import { RandomCodeGenerating } from "../../utils/random-code-generating";
import { ExecuteInTime } from "../../utils/execute-in-time";
import api from "services/api";

function Login() {
  const { saveTokenAndLogin } = useUser();
  const [, dispatch] = useMaterialUIController();
  const navigate = useNavigate();
  const [qrValue, setQrValue] = useState("");

  const attemptsRef = useRef(0);
  const stopIntervalRef = useRef<(() => void) | null>(null);
  const successRef = useRef(false);

  useEffect(() => {
    const newCode = RandomCodeGenerating.generateAlphanumericCode();
    setQrValue(newCode);

    setLayout(dispatch, "page");

    return () => setLayout(dispatch, "dashboard");
  }, [dispatch]);

  useEffect(() => {
    if (!qrValue) return;

    stopIntervalRef.current = ExecuteInTime.execute(() => {
      validateUser(qrValue);
    }, 5000);

    return () => {
      if (stopIntervalRef.current) {
        stopIntervalRef.current();
      }
    };
  }, [qrValue]);

  async function validateUser(data: string) {
    if (successRef.current) return;

    if (attemptsRef.current >= 10) {
      console.log("Limite de tentativas atingido. Parando requisições.");
      if (stopIntervalRef.current) {
        stopIntervalRef.current();
      }
      return;
    }

    try {
      attemptsRef.current += 1;
      console.log(`Tentativa ${attemptsRef.current} de 10`);

      const res = await api.post('/validate/access', { key: data });

      if (res.status === 200 || res.status === 201) {
        console.log('Autenticado com sucesso!', res);
        successRef.current = true;

        if (res.data && res.data.token) {
          saveTokenAndLogin(res.data.token);
        }

        if (stopIntervalRef.current) {
          stopIntervalRef.current();
        }

        navigate("/condominios");
      }
    } catch (error) {
      console.error('Erro na validação ou acesso xpto', error);
    }
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

                <Divider sx={{ my: 3 }} />
                <MDBox display="flex" justifyContent="center" alignItems="center">
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
