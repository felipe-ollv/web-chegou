import { useEffect, useMemo, useState } from "react";

import { lighten, useTheme } from "@mui/material/styles";

import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
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
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";

import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from "services/api";
import { getAuthContext } from "services/auth";

const EMPTY_RECEIPT_FORM = {
  block: "",
  apartment: "",
  recipient: "",
  note: "",
};

const normalizeReceipts = (data) => {
  const all = [...(data?.deliver || []), ...(data?.pickup || [])];
  return all.map((item) => ({
    id: item.uuid_package,
    residentName: item.ownerName || "-",
    unit: `${item.blockOwner || "-"} - ${item.apartmentOwner || "-"}`,
    block: item.blockOwner || "-",
    note: item.note || "-",
    receivedBy: item.receiverName || "-",
    receivedAt: item.created_at,
    status: item.status_package === "DELIVERED" ? "Retirado" : "Pendente",
    confirmation_code: item.confirmation_code,
    uuid_package: item.uuid_package,
  }));
};

const parseReceivedAtDate = (value) => {
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

const formatReceivedAtLabel = (value) => {
  const date = parseReceivedAtDate(value);
  if (!date) return value || "-";
  const datePart = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const timePart = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} ${timePart}`;
};

function SummaryCard({ label, value, helper, color }) {
  return (
    <Card
      sx={(theme) => ({
        background: `linear-gradient(135deg, ${
          lighten(theme.palette[color]?.main || theme.palette.info.main, 0.14)
        }, ${lighten(theme.palette[color]?.dark || theme.palette.info.dark, 0.06)})`,
        color: theme.palette.common.white,
        "& .summary-card__text": { color: theme.palette.common.white },
      })}
    >
      <MDBox height="4px" borderRadius="md" bgColor="white" opacity={0.4} />
      <MDBox p={2.5} color="inherit">
        <MDTypography className="summary-card__text" variant="h6" fontWeight="medium" color="inherit">
          {label}
        </MDTypography>
        <MDTypography className="summary-card__text" variant="h3" fontWeight="bold" color="inherit">
          {value}
        </MDTypography>
        {helper && (
          <MDTypography
            className="summary-card__text"
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

SummaryCard.defaultProps = {
  helper: "",
};

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  helper: PropTypes.string,
  color: PropTypes.string.isRequired,
};

function Receipts() {
  const theme = useTheme();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [blockFilter, setBlockFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptForm, setReceiptForm] = useState(EMPTY_RECEIPT_FORM);
  const [formError, setFormError] = useState("");
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/received-package/find-received-package/9df71478-4a39-42df-9419-f4ebebfd7d66?limit=200`
      );
      setReceipts(normalizeReceipts(data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const totals = useMemo(
    () =>
      receipts.reduce(
        (acc, item) => {
          acc.registered += 1;
          if (item.status === "Pendente") acc.pending += 1;
          if (item.status === "Retirado") acc.delivered += 1;
          return acc;
        },
        { registered: 0, pending: 0, delivered: 0 }
      ),
    [receipts]
  );

  const blocks = useMemo(
    () => Array.from(new Set(receipts.map((item) => item.block))),
    [receipts]
  );

  const filteredReceipts = useMemo(() => {
    const selectedDate = dateFilter ? new Date(dateFilter) : null;

    if (selectedDate) selectedDate.setHours(0, 0, 0, 0);
    const selectedEnd = selectedDate ? new Date(selectedDate.getTime()) : null;
    if (selectedEnd) selectedEnd.setHours(23, 59, 59, 999);

    return receipts.filter((item) => {
      if (statusFilter !== "todos" && item.status !== statusFilter) {
        return false;
      }
      if (blockFilter !== "todos" && item.block !== blockFilter) {
        return false;
      }

      if (selectedDate) {
        const receiptDate = parseReceivedAtDate(item.receivedAt);
        if (
          !receiptDate ||
          receiptDate.getTime() < selectedDate.getTime() ||
          receiptDate.getTime() > selectedEnd.getTime()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [receipts, statusFilter, blockFilter, dateFilter]);

  const paginatedReceipts = useMemo(
    () => filteredReceipts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredReceipts, page, rowsPerPage]
  );

  useEffect(() => {
    setPage(0);
  }, [statusFilter, blockFilter, dateFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRegisterPickup = async (id) => {
    const item = receipts.find((row) => row.id === id);
    if (!item) return;
    try {
      await api.put("/received-package/update-received-package", {
        uuid_package: item.uuid_package,
        confirmation_code: item.confirmation_code,
      });
      setReceipts((prev) =>
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

  const handleNewReceipt = () => {
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSavingReceipt) return;
    setIsModalOpen(false);
    setReceiptForm(EMPTY_RECEIPT_FORM);
    setFormError("");
  };

  const handleSaveReceipt = async () => {
    const { profileUuid } = getAuthContext();
    const block = receiptForm.block.trim();
    const apartment = receiptForm.apartment.trim();
    const recipient = receiptForm.recipient.trim();
    const note = receiptForm.note.trim();

    if (!profileUuid) {
      setFormError("Não foi possível identificar o usuário logado.");
      return;
    }

    if (!block || !apartment || !recipient) {
      setFormError("Preencha bloco, apartamento e nome do morador.");
      return;
    }

    try {
      setIsSavingReceipt(true);
      await api.post("/received-package/create-received-package", {
        block,
        apartment,
        recipient,
        note,
        received: profileUuid,
      });
      handleCloseModal();
      await loadReceipts();
    } catch (error) {
      console.error(error);
      setFormError("Não foi possível registrar o recebimento. Tente novamente.");
    } finally {
      setIsSavingReceipt(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <SummaryCard
              label="Registrados"
              value={totals.registered}
              helper="Total de recebimentos"
              color="info"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              label="Pendentes"
              value={totals.pending}
              helper="Aguardando retirada"
              color="warning"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              label="Retirados"
              value={totals.delivered}
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
                <MDButton variant="gradient" color="info" onClick={handleNewReceipt}>
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
                    value={blockFilter}
                    label="Bloco"
                    onChange={(event) => setBlockFilter(event.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {blocks.map((block) => (
                      <MenuItem key={block} value={block}>
                        {block}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  type="date"
                  label="Data Recebimento"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
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
                      paginatedReceipts.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.residentName}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.receivedBy}</TableCell>
                          <TableCell>{formatReceivedAtLabel(item.receivedAt)}</TableCell>
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
                                onClick={() => handleRegisterPickup(item.id)}
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
                    {!loading && filteredReceipts.length === 0 && (
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
              {!loading && filteredReceipts.length > 0 && (
                <TablePagination
                  component="div"
                  count={filteredReceipts.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[10, 25, 50]}
                  labelRowsPerPage="Itens por página"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                  }
                />
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Novo recebimento</DialogTitle>
        <DialogContent dividers>
          <MDBox display="flex" flexDirection="column" gap={2} mt={1} width="100%">
            <TextField
              label="Bloco"
              placeholder="Ex.: Bloco A"
              value={receiptForm.block}
              onChange={(event) =>
                setReceiptForm((prev) => ({ ...prev, block: event.target.value }))
              }
              fullWidth
              autoFocus
            />
            <TextField
              label="Apartamento"
              placeholder="Ex.: 101"
              value={receiptForm.apartment}
              onChange={(event) =>
                setReceiptForm((prev) => ({ ...prev, apartment: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Nome do morador"
              value={receiptForm.recipient}
              onChange={(event) =>
                setReceiptForm((prev) => ({ ...prev, recipient: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Descrição do item"
              placeholder="Ex.: Pacote pequeno"
              value={receiptForm.note}
              onChange={(event) =>
                setReceiptForm((prev) => ({ ...prev, note: event.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
            {formError && (
              <MDTypography variant="caption" color="error">
                {formError}
              </MDTypography>
            )}
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MDButton color="secondary" variant="text" onClick={handleCloseModal}>
            Cancelar
          </MDButton>
          <MDButton
            color="info"
            variant="gradient"
            onClick={handleSaveReceipt}
            disabled={isSavingReceipt}
          >
            {isSavingReceipt ? "Salvando..." : "Salvar"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Receipts;
