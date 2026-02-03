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
import TextField from "@mui/material/TextField";

import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { apiFetch } from "services/api";
import { getAuthContext } from "services/auth";

const parseRecebidoEmDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  // Fallback for legacy "dd/MM HH:mm" strings
  const [datePart, timePart = "00:00"] = value.split(" ");
  const [day, month] = datePart.split("/").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const now = new Date();
  const legacy = new Date(now.getFullYear(), (month || 1) - 1, day || 1, hour || 0, minute || 0);
  return Number.isNaN(legacy.getTime()) ? null : legacy;
};

const formatRecebidoEmLabel = (value) => {
  const date = parseRecebidoEmDate(value);
  if (!date) return value || "-";
  const datePart = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const timePart = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} ${timePart}`;
};

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
          "& .resumo-card__text": { color: palette.common.white },
        };
      }}
    >
      <MDBox p={2.5}>
        <MDTypography className="resumo-card__text" variant="h6" fontWeight="medium" color="inherit">
          {label}
        </MDTypography>
        <MDTypography className="resumo-card__text" variant="h3" fontWeight="bold" color="inherit">
          {value}
        </MDTypography>
        {helper && (
          <MDTypography
            className="resumo-card__text"
            variant="button"
            color="inherit"
            opacity={0.9}
          >
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
  const [dataFiltro, setDataFiltro] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { profileUuid } = getAuthContext();
        if (!profileUuid) {
          setRecebimentos([]);
          return;
        }
        const resp = await apiFetch(`/received-package/find-received-package/${profileUuid}`);
        const all = [...(resp?.deliver || []), ...(resp?.pickup || [])];
        const normalized = all.map((item) => ({
          id: item.uuid_package,
          morador: item.ownerName || "-",
          unidade: `${item.blockOwner || "-"} - ${item.apartmentOwner || "-"}`,
          bloco: item.blockOwner || "-",
          item: item.note || "-",
          recebidoPor: item.receiverName || "-",
          recebidoEm: item.created_at,
          status: item.status_package === "DELIVERED" ? "Retirado" : "Pendente",
          confirmation_code: item.confirmation_code,
          uuid_package: item.uuid_package,
        }));
        setRecebimentos(normalized);
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

  const filteredRecebimentos = useMemo(() => {
    const selectedDate = dataFiltro ? new Date(dataFiltro) : null;

    if (selectedDate) selectedDate.setHours(0, 0, 0, 0);
    const selectedEnd = selectedDate ? new Date(selectedDate.getTime()) : null;
    if (selectedEnd) selectedEnd.setHours(23, 59, 59, 999);

    return recebimentos.filter((item) => {
      if (statusFilter !== "todos" && item.status !== statusFilter) {
        return false;
      }
      if (blocoFilter !== "todos" && item.bloco !== blocoFilter) {
        return false;
      }

      if (selectedDate) {
        const recebimentoDate = parseRecebidoEmDate(item.recebidoEm);
        if (
          !recebimentoDate ||
          recebimentoDate.getTime() < selectedDate.getTime() ||
          recebimentoDate.getTime() > selectedEnd.getTime()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [recebimentos, statusFilter, blocoFilter, dataFiltro]);

  const handleRegistrarRetirada = async (id) => {
    const item = recebimentos.find((row) => row.id === id);
    if (!item) return;
    try {
      await apiFetch("/received-package/update-received-package", {
        method: "PUT",
        body: JSON.stringify({
          uuid_package: item.uuid_package,
          confirmation_code: item.confirmation_code,
        }),
      });
      setRecebimentos((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                status: "Retirado",
              }
            : row
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleNovoRecebimento = async () => {
    const { profileUuid } = getAuthContext();
    if (!profileUuid) return;
    const block = window.prompt("Bloco (ex.: Bloco A)");
    if (!block) return;
    const apartment = window.prompt("Apartamento (ex.: 101)");
    if (!apartment) return;
    const recipient = window.prompt("Nome do morador");
    if (!recipient) return;
    const note = window.prompt("Descrição do item");

    try {
      await apiFetch("/received-package/create-received-package", {
        method: "POST",
        body: JSON.stringify({
          block,
          apartment,
          recipient,
          note: note || "",
          received: profileUuid,
        }),
      });
      setLoading(true);
      const resp = await apiFetch(`/received-package/find-received-package/${profileUuid}`);
      const all = [...(resp?.deliver || []), ...(resp?.pickup || [])];
      const normalized = all.map((item) => ({
        id: item.uuid_package,
        morador: item.ownerName || "-",
        unidade: `${item.blockOwner || "-"} - ${item.apartmentOwner || "-"}`,
        bloco: item.blockOwner || "-",
        item: item.note || "-",
        recebidoPor: item.receiverName || "-",
        recebidoEm: item.created_at,
        status: item.status_package === "DELIVERED" ? "Retirado" : "Pendente",
        confirmation_code: item.confirmation_code,
        uuid_package: item.uuid_package,
      }));
      setRecebimentos(normalized);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
                    Dados da API. Registre a retirada quando o morador buscar o item.
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
                  sx={{ minWidth: 180, ".MuiOutlinedInput-root": { minHeight: 44 } }}
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
                  sx={{ minWidth: 200, ".MuiOutlinedInput-root": { minHeight: 44 } }}
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
                <TextField
                  size="small"
                  type="date"
                  label="Data Recebimento"
                  value={dataFiltro}
                  onChange={(event) => setDataFiltro(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 180, ".MuiOutlinedInput-root": { minHeight: 44 } }}
                />
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
                          <TableCell>{formatRecebidoEmLabel(item.recebidoEm)}</TableCell>
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
