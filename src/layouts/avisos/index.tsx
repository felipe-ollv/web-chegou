import { useEffect, useRef, useState } from "react";
import { lighten, useTheme } from "@mui/material/styles";

import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
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
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const mockFetchAvisos = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          {
            id: "aviso-01",
            titulo: "Manutenção programada dos elevadores",
            data: "2024-05-10",
            tipo: "Comunicado",
            status: "Ativo",
            url: "#",
          },
          {
            id: "aviso-02",
            titulo: "Assembleia geral – 22/05",
            data: "2024-05-02",
            tipo: "Assembleia",
            status: "Ativo",
            url: "#",
          },
          {
            id: "aviso-03",
            titulo: "Relatório financeiro abril",
            data: "2024-04-28",
            tipo: "Financeiro",
            status: "Finalizado",
            url: "#",
          },
        ]),
      300
    )
  );

const tipoColor = {
  Comunicado: "info",
  Assembleia: "warning",
  Financeiro: "success",
};
const statusColor = {
  Ativo: "success",
  Finalizado: "grey",
};

const tipoOptions = Object.keys(tipoColor);

function Avisos() {
  const theme = useTheme();
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [formAviso, setFormAviso] = useState({
    titulo: "",
    tipo: "Comunicado",
    arquivo: null,
  });
  const arquivoInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await mockFetchAvisos();
        setAvisos(data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddClick = () => {
    setModalAberto(true);
  };

  const handleModalClose = () => {
    setModalAberto(false);
    setFormAviso({ titulo: "", tipo: "Comunicado", arquivo: null });
  };

  const handleSalvarAviso = () => {
    if (!formAviso.titulo.trim()) return;

    const novoAviso = {
      id: `novo-${Date.now()}`,
      titulo: formAviso.titulo.trim(),
      data: new Date().toISOString().slice(0, 10),
      tipo: formAviso.tipo,
      status: "Ativo",
      url: "#",
    };

    setAvisos((prev) => [novoAviso, ...prev]);
    handleModalClose();
  };

  const handleToggleStatus = (id) => {
    setAvisos((prev) =>
      prev.map((aviso) =>
        aviso.id === id
          ? {
              ...aviso,
              status: aviso.status === "Ativo" ? "Finalizado" : "Ativo",
            }
          : aviso
      )
    );
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
                    Avisos e notificações
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Crie e gerencie avisos enviados aos moradores. Substitua o mock pela resposta da
                    API.
                  </MDTypography>
                </div>
                <MDButton variant="gradient" color="info" onClick={handleAddClick}>
                  <Icon sx={{ mr: 1 }}>add</Icon> Novo aviso
                </MDButton>
              </MDBox>
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!loading &&
                      avisos.map((aviso) => (
                        <TableRow key={aviso.id}>
                          <TableCell>
                            <MDTypography variant="button" fontWeight="medium">
                              {aviso.titulo}
                            </MDTypography>
                          </TableCell>
                          <TableCell>{aviso.data}</TableCell>
                          <TableCell>
                            <Chip
                              label={aviso.tipo}
                              color={tipoColor[aviso.tipo] || "default"}
                              size="small"
                              sx={{
                                bgcolor: lighten(
                                  theme.palette[tipoColor[aviso.tipo]]?.main ||
                                    theme.palette.info.main,
                                  0.15
                                ),
                                color: theme.palette.common.white,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={aviso.status}
                              size="small"
                              sx={{
                                bgcolor: lighten(
                                  theme.palette[statusColor[aviso.status]]?.main ||
                                    theme.palette.grey[600],
                                  0.15
                                ),
                                color: theme.palette.common.white,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <MDBox display="flex" alignItems="center" gap={1}>
                              <MDButton
                                variant="text"
                                color={aviso.status === "Ativo" ? "warning" : "success"}
                                startIcon={<Icon>toggle_on</Icon>}
                                onClick={() => handleToggleStatus(aviso.id)}
                              >
                                {aviso.status === "Ativo" ? "Desativar" : "Ativar"}
                              </MDButton>
                              <MDButton
                                component="a"
                                href={aviso.url}
                                target="_blank"
                                rel="noreferrer"
                                variant="text"
                                color="info"
                                startIcon={<Icon>file_download</Icon>}
                              >
                                Abrir
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
              {!loading && avisos.length === 0 && (
                <>
                  <Divider />
                  <MDBox p={3}>
                    <MDTypography variant="button" color="text">
                      Nenhum aviso encontrado.
                    </MDTypography>
                  </MDBox>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog open={modalAberto} onClose={handleModalClose} fullWidth maxWidth="sm">
        <DialogTitle>Novo aviso</DialogTitle>
        <DialogContent dividers>
          <MDBox display="flex" flexDirection="column" gap={2} mt={1} width="100%">
            <TextField
              label="Título"
              value={formAviso.titulo}
              onChange={(e) => setFormAviso((prev) => ({ ...prev, titulo: e.target.value }))}
              fullWidth
              autoFocus
            />
            <FormControl
              fullWidth
              variant="outlined"
              sx={{ ".MuiInputBase-root": { height: 56 } }}
            >
              <InputLabel id="tipo-label">Tipo</InputLabel>
              <Select
                labelId="tipo-label"
                label="Tipo"
                value={formAviso.tipo}
                onChange={(e) => setFormAviso((prev) => ({ ...prev, tipo: e.target.value }))}
              >
                {tipoOptions.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <MDBox display="flex" alignItems="center" gap={2}>
              <MDButton
                variant="outlined"
                color="info"
                onClick={() => arquivoInputRef.current?.click()}
                startIcon={<Icon>upload_file</Icon>}
              >
                Selecionar PDF
              </MDButton>
              <MDTypography variant="button" color="text">
                {formAviso.arquivo ? formAviso.arquivo.name : "Nenhum arquivo selecionado"}
              </MDTypography>
              <input
                ref={arquivoInputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) =>
                  setFormAviso((prev) => ({
                    ...prev,
                    arquivo: e.target.files?.[0] || null,
                  }))
                }
              />
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MDButton color="secondary" variant="text" onClick={handleModalClose}>
            Cancelar
          </MDButton>
          <MDButton color="info" variant="gradient" onClick={handleSalvarAviso}>
            Salvar
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Avisos;
