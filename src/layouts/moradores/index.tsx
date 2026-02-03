import { useEffect, useState } from "react";
import { lighten, useTheme } from "@mui/material/styles";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
// import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { apiFetch } from "services/api";
import { getAuthContext } from "services/auth";

const statusColor = {
  Ativo: "success",
  Desativado: "warning",
};

function Moradores() {
  const theme = useTheme();
  const [moradores, setMoradores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const selected = localStorage.getItem("condominioSelecionado");
        const parsed = selected ? JSON.parse(selected) : null;
        const { condominiumUuid } = getAuthContext();
        const uuidCondominium = parsed?.uuid_condominium || condominiumUuid;
        if (!uuidCondominium) {
          setMoradores([]);
          return;
        }
        const data = await apiFetch(`/user-profile/find-residents/${uuidCondominium}`);
        const normalized = (data || []).map((row, index) => ({
          id: row.uuid_user_profile || `${row.name}-${index}`,
          nome: row.name,
          unidade: `${row.apartment_block} - ${row.apartment}`,
          telefone: row.phone_number || "-",
          status:
            row.access_status === "ACTIVE" && Number(row.deleted || 0) === 0 ? "Ativo" : "Desativado",
        }));
        setMoradores(normalized);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <MDTypography variant="h5" fontWeight="medium">
                    Moradores
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Lista de moradores vinda da API.
                  </MDTypography>
                </div>
              </MDBox>
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Unidade</TableCell>
                      <TableCell>Telefone</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!loading &&
                      moradores.map((morador) => (
                        <TableRow key={morador.id}>
                          <TableCell>
                            <MDTypography variant="button" fontWeight="medium">
                              {morador.nome}
                            </MDTypography>
                          </TableCell>
                          <TableCell>{morador.unidade}</TableCell>
                          <TableCell>{morador.telefone}</TableCell>
                          <TableCell>
                            <Chip
                              label={morador.status}
                              size="small"
                              sx={{
                                bgcolor: lighten(
                                  theme.palette[statusColor[morador.status]]?.main ||
                                    theme.palette.grey[600],
                                  0.15
                                ),
                                color: theme.palette.common.white,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <MDBox py={2}>
                            <MDTypography variant="button" color="text">
                              Carregando...
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {!loading && moradores.length === 0 && (
                <>
                  <Divider />
                  <MDBox p={3}>
                    <MDTypography variant="button" color="text">
                      Nenhum morador encontrado.
                    </MDTypography>
                  </MDBox>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Moradores;
