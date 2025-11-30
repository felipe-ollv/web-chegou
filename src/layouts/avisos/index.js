import { useEffect, useRef, useState } from "react";

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
            tamanho: "420 KB",
            tipo: "Comunicado",
            url: "#",
          },
          {
            id: "aviso-02",
            titulo: "Assembleia geral – 22/05",
            data: "2024-05-02",
            tamanho: "310 KB",
            tipo: "Assembleia",
            url: "#",
          },
          {
            id: "aviso-03",
            titulo: "Relatório financeiro abril",
            data: "2024-04-28",
            tamanho: "1.2 MB",
            tipo: "Financeiro",
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

function Avisos() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const novoAviso = {
        id: `novo-${Date.now()}`,
        titulo: file.name,
        data: new Date().toISOString().slice(0, 10),
        tamanho: `${(file.size / 1024).toFixed(0)} KB`,
        tipo: "Comunicado",
        url: "#",
      };
      setAvisos((prev) => [novoAviso, ...prev]);
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
                    PDFs enviados aos moradores. Substitua o mock pela resposta da API.
                  </MDTypography>
                </div>
                <MDButton variant="gradient" color="info" onClick={handleAddClick}>
                  <Icon sx={{ mr: 1 }}>upload_file</Icon> Novo aviso (PDF)
                </MDButton>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={handleFileSelected}
                />
              </MDBox>
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Tamanho</TableCell>
                      <TableCell>Tipo</TableCell>
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
                          <TableCell>{aviso.tamanho}</TableCell>
                          <TableCell>
                            <Chip
                              label={aviso.tipo}
                              color={tipoColor[aviso.tipo] || "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
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
    </DashboardLayout>
  );
}

export default Avisos;
