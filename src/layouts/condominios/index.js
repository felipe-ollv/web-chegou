import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const mockFetchCondominios = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: "condo-01", nome: "Residencial Bela Vista", unidades: 120 },
          { id: "condo-02", nome: "Condomínio Jardim das Águas", unidades: 80 },
          { id: "condo-03", nome: "Edifício Horizonte", unidades: 64 },
        ]),
      400
    )
  );

function Condominios() {
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await mockFetchCondominios();
        setCondominios(data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelect = (condominio) => {
    localStorage.setItem("condominioSelecionado", JSON.stringify(condominio));
    navigate("/");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="medium" mb={1}>
                  Selecione o condomínio
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Mostre esta tela após o login do síndico quando houver mais de um condomínio na
                  resposta da API. Ao escolher, salve a seleção (ex.: localStorage ou contexto) e
                  redirecione para o dashboard.
                </MDTypography>
              </MDBox>
              <Divider />
              <MDBox p={3}>
                {loading ? (
                  <MDBox display="flex" alignItems="center" justifyContent="center" py={6}>
                    <CircularProgress size={28} color="info" />
                  </MDBox>
                ) : (
                  <Grid container spacing={2}>
                    {condominios.map((condominio) => (
                      <Grid item xs={12} md={4} key={condominio.id}>
                        <Card>
                          <MDBox p={2.5} display="flex" flexDirection="column" height="100%">
                            <MDTypography variant="h6" fontWeight="medium" mb={0.5}>
                              {condominio.nome}
                            </MDTypography>
                            <MDTypography variant="button" color="text" mb={2}>
                              {condominio.unidades} unidades
                            </MDTypography>
                            <MDBox mt="auto">
                              <MDButton
                                variant="gradient"
                                color="info"
                                fullWidth
                                onClick={() => handleSelect(condominio)}
                              >
                                Ver dashboard
                              </MDButton>
                            </MDBox>
                          </MDBox>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Condominios;
