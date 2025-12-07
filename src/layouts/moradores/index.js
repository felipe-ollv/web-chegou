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

const mockFetchMoradores = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          {
            id: "1",
            nome: "Ana Silva",
            unidade: "Bloco A - 103",
            telefone: "(11) 98888-1122",
            status: "Ativo",
          },
          {
            id: "2",
            nome: "Bruno Costa",
            unidade: "Bloco B - 207",
            telefone: "(11) 97777-3344",
            status: "Ativo",
          },
          {
            id: "3",
            nome: "Carla Nunes",
            unidade: "Bloco A - 305",
            telefone: "(11) 96666-5566",
            status: "Desativado",
          },
          {
            id: "4",
            nome: "Diego Martins",
            unidade: "Bloco C - 110",
            telefone: "(11) 95555-7788",
            status: "Ativo",
          },
        ]),
      350
    )
  );

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
        const data = await mockFetchMoradores();
        setMoradores(data);
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
                    Lista básica com dados mock. Substitua pelo retorno da API.
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
