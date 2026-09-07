import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import api from "services/api";
import { useUser } from "context/user.context";

const tipoColor = {
  Comunicado: "info",
  Assembleia: "warning",
  Financeiro: "success",
};
const statusColor = {
  Ativo: "success",
  Desativado: "grey",
};

const tipoOptions = Object.keys(tipoColor);

const getNoticePdfUrl = (content) => {
  if (!content || typeof content !== "string") return null;
  if (/^https?:\/\//i.test(content)) return content;
  const webBase = api.defaults.baseURL.replace(/\/$/, "");
  if (content.startsWith("/")) return new URL(content, webBase).href;
  const filename = content.split("/").pop();
  const base = /^document-\d+\.pdf$/i.test(filename)
    ? webBase : webBase.replace(/\/painel(?=\/|$)/g, "");
  return `${base}/note-data/pdfs/${encodeURIComponent(filename)}`;
};

const formatNoticeDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const day = date.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  return `${day} ${time}`;
};

const normalizeAvisos = (list = []) =>
  list.map((item) => {
    const url = getNoticePdfUrl(item.content) || "#";
    const fileName = String(url).split("/").pop() || "Documento";

    return {
      id: item.uuid_note_data || fileName,
      titulo: fileName.replace(/[-_]/g, " "),
      descricao: item.description || "",
      data: formatNoticeDate(item.created_at),
      tipo: item.category || "Comunicado",
      status: Number(item.deleted || 0) === 1 ? "Desativado" : "Ativo",
      url,
      raw: item,
    };
  });

function Avisos() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDesativacaoAberto, setModalDesativacaoAberto] = useState(false);
  const [avisoPendenteDesativacao, setAvisoPendenteDesativacao] = useState(null);
  const [formAviso, setFormAviso] = useState({
    titulo: "",
    tipo: "Comunicado",
    arquivo: null,
  });
  const arquivoInputRef = useRef(null);
  const { selectedCondominium } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const condominiumUuid = selectedCondominium?.uuid_condominium;
        if (!condominiumUuid) {
          navigate("/condominios");
          return;
        }
        const response = await api.get(`/note-data/find-note-data/${condominiumUuid}`);
        setAvisos(normalizeAvisos(response.data || []));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, selectedCondominium]);

  const handleAddClick = () => {
    setModalAberto(true);
  };

  const handleModalClose = () => {
    setModalAberto(false);
    setFormAviso({ titulo: "", tipo: "Comunicado", arquivo: null });
  };

  const handleSalvarAviso = async () => {
    if (!formAviso.arquivo) return;
    const uuidCondominium = selectedCondominium?.uuid_condominium;
    if (!uuidCondominium) {
      navigate("/condominios");
      return;
    }

    const formData = new FormData();
    formData.append("file", formAviso.arquivo);
    formData.append("uuidCondominium", uuidCondominium);
    formData.append("category", formAviso.tipo);

    try {
      await api.post("/note-data/document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setLoading(true);
      const response = await api.get(`/note-data/find-note-data/${uuidCondominium}`);
      setAvisos(normalizeAvisos(response.data || []));
      handleModalClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeactivateModal = (id) => {
    const aviso = avisos.find((item) => item.id === id);
    if (!aviso) return;
    setAvisoPendenteDesativacao(aviso);
    setModalDesativacaoAberto(true);
  };

  const handleCloseDeactivateModal = () => {
    setModalDesativacaoAberto(false);
    setAvisoPendenteDesativacao(null);
  };

  const handleDeactivate = async () => {
    const aviso = avisoPendenteDesativacao;
    if (!aviso) return;

    if (!aviso.raw?.uuid_note_data) {
      setAvisos((prev) => prev.filter((item) => item.id !== aviso.id));
      handleCloseDeactivateModal();
      return;
    }

    try {
      await api.post("/note-data/update-status", {
        uuid_note_data: aviso.raw.uuid_note_data,
        deleted: 1,
      });
      setAvisos((prev) => prev.filter((item) => item.id !== aviso.id));
      handleCloseDeactivateModal();
    } catch (error) {
      console.error(error);
    }
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
                    Crie e gerencie avisos enviados aos moradores.
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
                      <TableCell>Descrição / Anotação</TableCell>
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
                          <TableCell sx={{ minWidth: 200, maxWidth: 360, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                            {aviso.descricao || "-"}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{aviso.data}</TableCell>
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
                                color="warning"
                                startIcon={<Icon>toggle_on</Icon>}
                                onClick={() => handleOpenDeactivateModal(aviso.id)}
                              >
                                Desativar
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
                        <TableCell colSpan={6}>
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

      <Dialog
        open={modalDesativacaoAberto}
        onClose={handleCloseDeactivateModal}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Desativar comunicado</DialogTitle>
        <DialogContent dividers>
          <MDBox mt={1}>
            <MDTypography variant="button" color="text">
              Ao desativar este comunicado, ele não irá mais aparecer no app para os moradores.
            </MDTypography>
            {avisoPendenteDesativacao?.titulo && (
              <MDTypography variant="h6" fontWeight="medium" mt={2}>
                {avisoPendenteDesativacao.titulo}
              </MDTypography>
            )}
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MDButton color="secondary" variant="text" onClick={handleCloseDeactivateModal}>
            Cancelar
          </MDButton>
          <MDButton color="warning" variant="gradient" onClick={handleDeactivate}>
            Desativar
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Avisos;
