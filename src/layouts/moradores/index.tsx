import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lighten, useTheme } from "@mui/material/styles";

import Card from "@mui/material/Card";
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
import Chip from "@mui/material/Chip";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from "services/api";
import { useUser } from "context/user.context";

const statusColor = {
  Ativo: "success",
  Desativado: "warning",
};

const EMPTY_RESIDENT_FORM = {
  id: "",
  name: "",
  block: "",
  apartment: "",
  phone: "",
  status: "Ativo",
};

function Residents() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [blockFilter, setBlockFilter] = useState("todos");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editResident, setEditResident] = useState(EMPTY_RESIDENT_FORM);
  const [residentToDelete, setResidentToDelete] = useState(null);
  const { selectedCondominium } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const condominiumUuid = selectedCondominium?.uuid_condominium;
        if (!condominiumUuid) {
          navigate("/condominios");
          return;
        }
        const response = await api.get(`/user-profile/find-residents/${condominiumUuid}`);
        const list = response.data || [];
        const normalized = list.map((row, index) => ({
          id: row.uuid_user_profile || `${row.name}-${index}`,
          name: row.name,
          block: row.apartment_block || "-",
          apartment: row.apartment || "-",
          unit: `${row.apartment_block} - ${row.apartment}`,
          phone: row.phone_number || "-",
          status:
            row.access_status === "ACTIVE" && Number(row.deleted || 0) === 0 ? "Ativo" : "Desativado",
        }));
        setResidents(normalized);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, selectedCondominium]);

  const blocks = useMemo(
    () => Array.from(new Set(residents.map((resident) => resident.block))).filter(Boolean),
    [residents]
  );

  const filteredResidents = useMemo(
    () =>
      residents.filter((resident) => {
        if (statusFilter !== "todos" && resident.status !== statusFilter) return false;
        if (blockFilter !== "todos" && resident.block !== blockFilter) return false;

        return true;
      }),
    [residents, statusFilter, blockFilter]
  );

  const paginatedResidents = useMemo(
    () => filteredResidents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredResidents, page, rowsPerPage]
  );

  useEffect(() => {
    setPage(0);
  }, [statusFilter, blockFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEditResident = (resident) => {
    setEditResident({
      id: resident.id,
      name: resident.name,
      block: resident.block === "-" ? "" : resident.block,
      apartment: resident.apartment === "-" ? "" : resident.apartment,
      phone: resident.phone === "-" ? "" : resident.phone,
      status: resident.status,
    });
  };

  const handleCloseEditResident = () => {
    setEditResident(EMPTY_RESIDENT_FORM);
  };

  const handleEditResidentFieldChange = (field, value) => {
    setEditResident((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenDeleteResident = (resident) => {
    setResidentToDelete(resident);
  };

  const handleCloseDeleteResident = () => {
    setResidentToDelete(null);
  };

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
              <MDBox px={3} pb={1} display="flex" flexWrap="wrap" gap={2}>
                <FormControl
                  size="small"
                  sx={{ minWidth: 180, ".MuiOutlinedInput-root": { minHeight: 44 } }}
                >
                  <InputLabel id="resident-status-filter-label">Status</InputLabel>
                  <Select
                    labelId="resident-status-filter-label"
                    value={statusFilter}
                    label="Status"
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="Ativo">Ativo</MenuItem>
                    <MenuItem value="Desativado">Desativado</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  sx={{ minWidth: 200, ".MuiOutlinedInput-root": { minHeight: 44 } }}
                >
                  <InputLabel id="resident-block-filter-label">Bloco</InputLabel>
                  <Select
                    labelId="resident-block-filter-label"
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
              </MDBox>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Unidade</TableCell>
                      <TableCell>Telefone</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!loading &&
                      paginatedResidents.map((resident) => (
                        <TableRow key={resident.id}>
                          <TableCell>
                            <MDTypography variant="button" fontWeight="medium">
                              {resident.name}
                            </MDTypography>
                          </TableCell>
                          <TableCell>{resident.unit}</TableCell>
                          <TableCell>{resident.phone}</TableCell>
                          <TableCell>
                            <Chip
                              label={resident.status}
                              size="small"
                              sx={{
                                bgcolor: lighten(
                                  theme.palette[statusColor[resident.status]]?.main ||
                                    theme.palette.grey[600],
                                  0.15
                                ),
                                color: theme.palette.common.white,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <MDBox
                              display="flex"
                              justifyContent="flex-end"
                              alignItems="center"
                              gap={1}
                              flexWrap="wrap"
                            >
                              <MDButton
                                variant="text"
                                color="info"
                                size="small"
                                startIcon={<Icon>edit</Icon>}
                                onClick={() => handleOpenEditResident(resident)}
                              >
                                Editar
                              </MDButton>
                              <MDButton
                                variant="text"
                                color="error"
                                size="small"
                                startIcon={<Icon>delete</Icon>}
                                onClick={() => handleOpenDeleteResident(resident)}
                              >
                                Excluir
                              </MDButton>
                            </MDBox>
                          </TableCell>
                        </TableRow>
                      ))}
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={5}>
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
              {!loading && filteredResidents.length > 0 && (
                <TablePagination
                  component="div"
                  count={filteredResidents.length}
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
              {!loading && filteredResidents.length === 0 && (
                <>
                  <Divider />
                  <MDBox p={3}>
                    <MDTypography variant="button" color="text">
                      Nenhum morador encontrado para os filtros selecionados.
                    </MDTypography>
                  </MDBox>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog
        open={Boolean(editResident.id)}
        onClose={handleCloseEditResident}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar morador</DialogTitle>
        <DialogContent dividers>
          <MDBox display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome"
              value={editResident.name}
              onChange={(event) => handleEditResidentFieldChange("name", event.target.value)}
              fullWidth
            />
            <MDBox display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
              <TextField
                label="Bloco"
                value={editResident.block}
                onChange={(event) => handleEditResidentFieldChange("block", event.target.value)}
                fullWidth
              />
              <TextField
                label="Apartamento"
                value={editResident.apartment}
                onChange={(event) =>
                  handleEditResidentFieldChange("apartment", event.target.value)
                }
                fullWidth
              />
            </MDBox>
            <TextField
              label="Telefone"
              value={editResident.phone}
              onChange={(event) => handleEditResidentFieldChange("phone", event.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="resident-edit-status-label">Status</InputLabel>
              <Select
                labelId="resident-edit-status-label"
                label="Status"
                value={editResident.status}
                onChange={(event) => handleEditResidentFieldChange("status", event.target.value)}
              >
                <MenuItem value="Ativo">Ativo</MenuItem>
                <MenuItem value="Desativado">Desativado</MenuItem>
              </Select>
            </FormControl>
            <MDTypography variant="caption" color="text">
              Layout pronto. A integração com os endpoints de edição será ligada no próximo passo.
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MDButton variant="text" color="secondary" onClick={handleCloseEditResident}>
            Cancelar
          </MDButton>
          <MDButton variant="gradient" color="info" onClick={handleCloseEditResident}>
            Salvar
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(residentToDelete)}
        onClose={handleCloseDeleteResident}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Excluir morador</DialogTitle>
        <DialogContent dividers>
          <MDBox mt={1}>
            <MDTypography variant="button" color="text" display="block" mb={1}>
              Confirma a exclusão deste morador?
            </MDTypography>
            <MDTypography variant="h6" fontWeight="medium">
              {residentToDelete?.name || "-"}
            </MDTypography>
            <MDTypography variant="button" color="text" display="block" mt={1}>
              Unidade {residentToDelete?.unit || "-"}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block" mt={2}>
              Layout pronto. A ação de exclusão ainda não está integrada com a API.
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MDButton variant="text" color="secondary" onClick={handleCloseDeleteResident}>
            Cancelar
          </MDButton>
          <MDButton variant="gradient" color="error" onClick={handleCloseDeleteResident}>
            Excluir
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Residents;
