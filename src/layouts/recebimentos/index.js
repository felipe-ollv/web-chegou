import { useEffect, useMemo, useState } from "react";

import { lighten, useTheme } from "@mui/material/styles";

import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const mockFetchRecebimentos = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          {
            id: "rec-01",
            morador: "Ana Silva",
            unidade: "Bloco A - 103",
            bloco: "Bloco A",
            item: "Pacote pequeno (Shopee)",
            recebidoPor: "Camila - Portaria 1",
            recebidoEm: "12/05 09:10",
            status: "Pendente",
          },
          {
            id: "rec-02",
            morador: "Bruno Costa",
            unidade: "Bloco B - 207",
            bloco: "Bloco B",
            item: "Envelope (cartório)",
            recebidoPor: "Carlos - Portaria 2",
            recebidoEm: "12/05 08:35",
            status: "Pendente",
          },
          {
            id: "rec-03",
            morador: "Carla Nunes",
            unidade: "Bloco A - 305",
            bloco: "Bloco A",
            item: "Pacote médio (Amazon)",
            recebidoPor: "Camila - Portaria 1",
            recebidoEm: "11/05 18:10",
            status: "Retirado",
          },
          {
            id: "rec-04",
            morador: "Diego Martins",
            unidade: "Bloco C - 110",
            bloco: "Bloco C",
            item: "Correspondência interna",
            recebidoPor: "Ricardo - Portaria 3",
            recebidoEm: "12/05 10:05",
            status: "Pendente",
          },
          {
            id: "rec-05",
            morador: "Eduarda Melo",
            unidade: "Bloco B - 504",
            bloco: "Bloco B",
            item: "Caixa refrigerada",
            recebidoPor: "Carlos - Portaria 2",
            recebidoEm: "12/05 07:50",
            status: "Pendente",
          },
        ]),
      320
    )
  );

function ResumoCard({ label, value, helper, color }) {
  return (
    <Card
      sx={({ palette, functions: { linearGradient } }) => {
        const base = palette[color]?.main || palette.info.main;
        const to = lighten(base, 0.15);
        const from = lighten(base, 0.3);
        return {
          background: linearGradient(from, to),
          color: palette.common.white,
        };
      }}
    >
      <MDBox p={2.5}>
        <MDTypography variant="h6" fontWeight="medium" color="inherit">
          {label}
        </MDTypography>
        <MDTypography variant="h3" fontWeight="bold" color="inherit">
          {value}
        </MDTypography>
        {helper && (
          <MDTypography variant="button" color="inherit" opacity={0.9}>
            {helper}
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

ResumoCard.defaultProps = {
  helper: "",
};

ResumoCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  helper: PropTypes.string,
  color: PropTypes.string.isRequired,
};

function Recebimentos() {
  const theme = useTheme();
  const [recebimentos, setRecebimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [blocoFilter, setBlocoFilter] = useState("todos");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await mockFetchRecebimentos();
        setRecebimentos(data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totals = useMemo(
    () =>
      recebimentos.reduce(
        (acc, item) => {
          if (item.status === "Pendente") acc.pendentes += 1;
          if (item.status === "Retirado") acc.retirados += 1;
          return acc;
        },
        { pendentes: 0, retirados: 0 }
      ),
    [recebimentos]
  );

  const blocos = useMemo(
    () => Array.from(new Set(recebimentos.map((item) => item.bloco))),
    [recebimentos]
  );

  const filteredRecebimentos = useMemo(
    () =>
      recebimentos.filter((item) => {
        if (statusFilter !== "todos" && item.status !== statusFilter) {
          return false;
        }
        if (blocoFilter !== "todos" && item.bloco !== blocoFilter) {
          return false;
        }
        return true;
      }),
    [recebimentos, statusFilter, blocoFilter]
  );

  const handleRegistrarRetirada = (id) => {
    setRecebimentos((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Retirado",
            }
          : item
      )
    );
  };

  const handleNovoRecebimento = () => {
    const novo = {
      id: `rec-${Date.now()}`,
      morador: "Novo morador",
      unidade: "Bloco A - 999",
      bloco: "Bloco A",
      item: "Item adicionado via mock",
      recebidoPor: "Portaria",
      recebidoEm: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Pendente",
    };
    setRecebimentos((prev) => [novo, ...prev]);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ResumoCard
              label="Pendentes"
              value={totals.pendentes}
              helper="Aguardando retirada"
              color="warning"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ResumoCard
              label="Retirados"
              value={totals.retirados}
              helper="Movimentações registradas"
              color="success"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} mt={1}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <MDTypography variant="h5" fontWeight="medium">
                    Recebimentos
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Dados mockados. Troque pela sua chamada de API e registre retirada quando o
                    morador buscar o item.
                  </MDTypography>
                </div>
                <MDButton variant="gradient" color="info" onClick={handleNovoRecebimento}>
                  <Icon sx={{ mr: 1 }}>add</Icon> Novo recebimento
                </MDButton>
              </MDBox>
              <Divider />
              <MDBox px={3} pb={1} display="flex" flexWrap="wrap" gap={2}>
                <FormControl
                  size="small"
                  sx={{ minWidth: 180, ".MuiOutlinedInput-root": { minHeight: 48 } }}
                >
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="Status"
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="Pendente">Pendente</MenuItem>
                    <MenuItem value="Retirado">Retirado</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  sx={{ minWidth: 200, ".MuiOutlinedInput-root": { minHeight: 48 } }}
                >
                  <InputLabel id="bloco-filter-label">Bloco</InputLabel>
                  <Select
                    labelId="bloco-filter-label"
                    value={blocoFilter}
                    label="Bloco"
                    onChange={(event) => setBlocoFilter(event.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {blocos.map((bloco) => (
                      <MenuItem key={bloco} value={bloco}>
                        {bloco}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </MDBox>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Morador</TableCell>
                      <TableCell>Unidade</TableCell>
                      <TableCell>Recebido por</TableCell>
                      <TableCell>Recebido em</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!loading &&
                      filteredRecebimentos.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.morador}</TableCell>
                          <TableCell>{item.unidade}</TableCell>
                      <TableCell>{item.recebidoPor}</TableCell>
                      <TableCell>{item.recebidoEm}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          sx={{
                            bgcolor:
                              item.status === "Pendente"
                                ? lighten(theme.palette.warning.main, 0.15)
                                : lighten(theme.palette.success.main, 0.15),
                            color: theme.palette.common.white,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                          <TableCell align="right">
                            {item.status !== "Retirado" ? (
                              <MDButton
                                variant="text"
                                color="success"
                                startIcon={<Icon>inventory_2</Icon>}
                                onClick={() => handleRegistrarRetirada(item.id)}
                              >
                                Registrar retirada
                              </MDButton>
                            ) : (
                              <MDTypography variant="button" color="text">
                                Finalizado
                              </MDTypography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <MDBox py={2}>
                            <MDTypography variant="button" color="text">
                              Carregando...
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && filteredRecebimentos.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <MDBox py={2}>
                            <MDTypography variant="button" color="text">
                              Nenhum recebimento encontrado para os filtros selecionados.
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Recebimentos;
