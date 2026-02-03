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

import { apiFetch } from "services/api";

const parseUnitsFromBlocks = (blocksValue) => {
  if (!blocksValue) return 0;
  let blocks = blocksValue;
  if (typeof blocksValue === "string") {
    try {
      blocks = JSON.parse(blocksValue);
    } catch {
      return 0;
    }
  }
  if (!Array.isArray(blocks)) return 0;
  return blocks.reduce((acc, block) => {
    if (typeof block === "number") return acc + block;
    if (typeof block === "object" && block) {
      return (
        acc +
        (Number(block.units) ||
          Number(block.apartments) ||
          Number(block.total_units) ||
          Number(block.totalUnits) ||
          0)
      );
    }
    return acc;
  }, 0);
};

function Condominios() {
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiFetch("/condominium/find-all");
        const normalized = (data || []).map((condo) => ({
          id: condo.uuid_condominium,
          nome: condo.condominium_name,
          unidades:
            parseUnitsFromBlocks(condo.blocks) ||
            Number(condo.total_units) ||
            Number(condo.units) ||
            0,
          raw: condo,
        }));
        setCondominios(normalized);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelect = (condominio) => {
    const selected = condominio?.raw || condominio;
    localStorage.setItem("condominioSelecionado", JSON.stringify(selected));
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
