import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { lighten } from "@mui/material/styles";
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
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import api from "services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const criticalPendingHours = 48;

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const baseBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
      grid: { drawBorder: false },
    },
    x: { grid: { display: false } },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
  },
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (value) => {
  const date = parseDate(value);
  if (!date) return "-";
  return `${date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

const getElapsedHours = (value) => {
  const date = parseDate(value);
  if (!date) return 0;
  return Math.floor((Date.now() - date.getTime()) / 36e5);
};

const formatHours = (hours) => {
  if (!hours) return "-";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`;
};

const normalizePackages = (data) => {
  const payload = data?.data || data?.result || data;
  const deliver = Array.isArray(payload?.deliver) ? payload.deliver : [];
  const pickup = Array.isArray(payload?.pickup) ? payload.pickup : [];
  const list = Array.isArray(payload) ? payload : [...deliver, ...pickup];

  return list.map((item) => {
    const status = item.status_package === "DELIVERED" ? "Retirado" : "Pendente";

    return {
      id: item.uuid_package,
      residentName: item.ownerName || "-",
      unit: `${item.blockOwner || "-"} - ${item.apartmentOwner || "-"}`,
      block: item.blockOwner || "-",
      note: item.note || "-",
      receivedBy: item.receiverName || "-",
      receivedAt: item.created_at,
      deliveredAt: status === "Retirado" ? item.delivered_at || item.updated_at || null : null,
      status,
    };
  });
};

function StatCard({ label, value, helper, color }) {
  return (
    <Card
      sx={(theme) => ({
        height: "100%",
        background: `linear-gradient(135deg, ${
          lighten(theme.palette[color]?.main || theme.palette.info.main, 0.14)
        }, ${lighten(theme.palette[color]?.dark || theme.palette.info.dark, 0.06)})`,
        color: theme.palette.common.white,
        "& .stat-card__text": { color: theme.palette.common.white },
      })}
    >
      <MDBox height="4px" borderRadius="md" bgColor="white" opacity={0.4} />
      <MDBox p={2.5} color="inherit">
        <MDTypography className="stat-card__text" variant="h6" fontWeight="medium" color="inherit">
          {label}
        </MDTypography>
        <MDTypography className="stat-card__text" variant="h3" fontWeight="bold" color="inherit">
          {value}
        </MDTypography>
        <MDTypography className="stat-card__text" variant="button" color="inherit">
          {helper}
        </MDTypography>
      </MDBox>
    </Card>
  );
}

StatCard.defaultProps = {
  helper: "",
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  helper: PropTypes.string,
  color: PropTypes.string.isRequired,
};

function SectionHeader({ title, description }) {
  return (
    <MDBox p={3}>
      <MDTypography variant="h6" fontWeight="medium" mb={0.5}>
        {title}
      </MDTypography>
      {description && (
        <MDTypography variant="button" color="text">
          {description}
        </MDTypography>
      )}
    </MDBox>
  );
}

SectionHeader.defaultProps = {
  description: "",
};

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

function Home() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [blockFilter, setBlockFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(
          "/received-package/find-received-package/9df71478-4a39-42df-9419-f4ebebfd7d66?limit=200"
        );
        setPackages(normalizePackages(data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const blocks = useMemo(
    () => Array.from(new Set(packages.map((item) => item.block))).filter(Boolean),
    [packages]
  );

  const filteredPackages = useMemo(() => {
    const selectedDate = dateFilter ? new Date(dateFilter) : null;

    if (selectedDate) selectedDate.setHours(0, 0, 0, 0);
    const selectedEnd = selectedDate ? new Date(selectedDate.getTime()) : null;
    if (selectedEnd) selectedEnd.setHours(23, 59, 59, 999);

    return packages.filter((item) => {
      const receivedAt = parseDate(item.receivedAt);

      if (statusFilter !== "todos" && item.status !== statusFilter) return false;
      if (blockFilter !== "todos" && item.block !== blockFilter) return false;
      if (selectedDate && (!receivedAt || receivedAt < selectedDate || receivedAt > selectedEnd)) {
        return false;
      }

      return true;
    });
  }, [packages, statusFilter, blockFilter, dateFilter]);

  const metrics = useMemo(() => {
    const pending = filteredPackages.filter((item) => item.status === "Pendente");
    const delivered = filteredPackages.filter((item) => item.status === "Retirado");
    const criticalPending = pending.filter(
      (item) => getElapsedHours(item.receivedAt) >= criticalPendingHours
    );
    const residentCounts = filteredPackages.reduce((acc, item) => {
      acc[item.residentName] = (acc[item.residentName] || 0) + 1;
      return acc;
    }, {});
    const topResident = Object.entries(residentCounts).sort((a, b) => b[1] - a[1])[0];
    const pickupTimes = delivered
      .map((item) => {
        const receivedAt = parseDate(item.receivedAt);
        const deliveredAt = parseDate(item.deliveredAt);
        if (!receivedAt || !deliveredAt || deliveredAt < receivedAt) return null;
        return Math.round((deliveredAt.getTime() - receivedAt.getTime()) / 36e5);
      })
      .filter((value) => value !== null);
    const averagePickupHours = pickupTimes.length
      ? Math.round(pickupTimes.reduce((acc, value) => acc + value, 0) / pickupTimes.length)
      : 0;

    return {
      registered: filteredPackages.length,
      pending: pending.length,
      delivered: delivered.length,
      criticalPending: criticalPending.length,
      topResidentName: topResident?.[0] || "-",
      topResidentCount: topResident?.[1] || 0,
      averagePickupHours,
    };
  }, [filteredPackages]);

  const latestPackages = useMemo(
    () =>
      [...filteredPackages]
        .sort((a, b) => (parseDate(b.receivedAt)?.getTime() || 0) - (parseDate(a.receivedAt)?.getTime() || 0))
        .slice(0, 8),
    [filteredPackages]
  );

  const criticalPendingPackages = useMemo(
    () =>
      filteredPackages
        .filter((item) => item.status === "Pendente")
        .filter((item) => getElapsedHours(item.receivedAt) >= criticalPendingHours)
        .sort((a, b) => getElapsedHours(b.receivedAt) - getElapsedHours(a.receivedAt))
        .slice(0, 6),
    [filteredPackages]
  );

  const hourlyChart = useMemo(() => {
    const hours = Array.from({ length: 12 }, (_, index) => `${String(index + 8).padStart(2, "0")}h`);
    const receivedByHour = {};
    const pickedUpByHour = {};

    filteredPackages.forEach((item) => {
      const receivedAt = parseDate(item.receivedAt);
      if (!receivedAt) return;

      const hour = `${String(receivedAt.getHours()).padStart(2, "0")}h`;
      if (item.status === "Retirado") {
        pickedUpByHour[hour] = (pickedUpByHour[hour] || 0) + 1;
      } else {
        receivedByHour[hour] = (receivedByHour[hour] || 0) + 1;
      }
    });

    return {
      labels: hours,
      datasets: [
        {
          label: "Recebimentos",
          data: hours.map((hour) => receivedByHour[hour] || 0),
          backgroundColor: "#1A73E8",
          borderRadius: 6,
        },
        {
          label: "Retiradas",
          data: hours.map((hour) => pickedUpByHour[hour] || 0),
          backgroundColor: "#17C1E8",
          borderRadius: 6,
        },
      ],
    };
  }, [filteredPackages]);

  const statusChart = useMemo(
    () => ({
      labels: ["Pendentes", "Retirados"],
      datasets: [
        {
          data: [metrics.pending, metrics.delivered],
          backgroundColor: ["#fbcf33", "#66bb6a"],
          borderWidth: 0,
        },
      ],
    }),
    [metrics.pending, metrics.delivered]
  );

  const blockChart = useMemo(() => {
    const ranking = Object.entries(
      filteredPackages.reduce((acc, item) => {
        acc[item.block] = (acc[item.block] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      labels: ranking.map(([block]) => block),
      datasets: [
        {
          label: "Recebimentos",
          data: ranking.map(([, count]) => count),
          backgroundColor: "#1A73E8",
          borderRadius: 6,
        },
      ],
    };
  }, [filteredPackages]);

  const weekdayChart = useMemo(() => {
    const counts = dayLabels.reduce((acc, label) => ({ ...acc, [label]: 0 }), {});

    filteredPackages.forEach((item) => {
      const receivedAt = parseDate(item.receivedAt);
      if (!receivedAt) return;
      counts[dayLabels[receivedAt.getDay()]] += 1;
    });

    return {
      labels: dayLabels,
      datasets: [
        {
          label: "Recebimentos",
          data: dayLabels.map((label) => counts[label]),
          backgroundColor: "#43A047",
          borderRadius: 6,
        },
      ],
    };
  }, [filteredPackages]);

  const cards = [
    {
      label: "Registrados",
      value: metrics.registered,
      helper: "no filtro atual",
      color: "info",
    },
    {
      label: "Pendentes",
      value: metrics.pending,
      helper: "aguardando retirada",
      color: "warning",
    },
    {
      label: "Retirados",
      value: metrics.delivered,
      helper: "finalizados",
      color: "success",
    },
    {
      label: "Tempo médio",
      value: formatHours(metrics.averagePickupHours),
      helper: "até retirada",
      color: "primary",
    },
    {
      label: "Top morador",
      value: metrics.topResidentCount,
      helper: metrics.topResidentName,
      color: "dark",
    },
    {
      label: "Pendências 48h+",
      value: metrics.criticalPending,
      helper: "exigem atenção",
      color: "error",
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                <div>
                  <MDTypography variant="h5" fontWeight="medium">
                    Resumo operacional
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Visão rápida para acompanhar volume, pendências e gargalos da portaria.
                  </MDTypography>
                </div>
                <MDBox display="flex" gap={1} flexWrap="wrap">
                  <MDButton component={Link} to="/recebimentos" variant="gradient" color="info">
                    <Icon sx={{ mr: 1 }}>inventory_2</Icon> Novo recebimento
                  </MDButton>
                  <MDButton component={Link} to="/moradores" variant="outlined" color="info">
                    <Icon sx={{ mr: 1 }}>people</Icon> Moradores
                  </MDButton>
                </MDBox>
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
                  <InputLabel id="block-filter-label">Bloco</InputLabel>
                  <Select
                    labelId="block-filter-label"
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
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} mt={1}>
          {cards.map((item) => (
            <Grid item xs={12} sm={6} lg={2} key={item.label}>
              <StatCard label={item.label} value={item.value} helper={item.helper} color={item.color} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: "100%" }}>
              <SectionHeader
                title="Horários de maior movimento"
                description="Recebimentos e retiradas agrupados por hora no filtro atual."
              />
              <Divider />
              <MDBox px={2} py={3} height={320}>
                <Bar data={hourlyChart} options={{ ...baseBarOptions, plugins: { ...baseBarOptions.plugins, legend: { display: true } } }} />
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: "100%" }}>
              <SectionHeader
                title="Distribuição por status"
                description="Comparativo de pendentes e retirados."
              />
              <Divider />
              <MDBox px={2} py={3} height={320}>
                <Doughnut data={statusChart} options={doughnutOptions} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: "100%" }}>
              <SectionHeader title="Ranking por bloco" description="Blocos com maior volume no período." />
              <Divider />
              <MDBox px={2} py={3} height={300}>
                <Bar data={blockChart} options={baseBarOptions} />
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: "100%" }}>
              <SectionHeader title="Picos por dia da semana" description="Dias com maior demanda para a portaria." />
              <Divider />
              <MDBox px={2} py={3} height={300}>
                <Bar data={weekdayChart} options={baseBarOptions} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} lg={7}>
            <Card sx={{ height: "100%" }}>
              <SectionHeader title="Últimos recebimentos" description="Registros mais recentes dentro dos filtros." />
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Morador</TableCell>
                      <TableCell>Unidade</TableCell>
                      <TableCell>Recebido em</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!loading &&
                      latestPackages.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.residentName}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{formatDateTime(item.receivedAt)}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              color={item.status === "Retirado" ? "success" : "warning"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={4}>Carregando...</TableCell>
                      </TableRow>
                    )}
                    {!loading && latestPackages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4}>Nenhum recebimento encontrado.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%" }}>
              <SectionHeader
                title="Pendências críticas"
                description={`Itens pendentes há mais de ${criticalPendingHours} horas.`}
              />
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Morador</TableCell>
                      <TableCell>Unidade</TableCell>
                      <TableCell>Tempo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {criticalPendingPackages.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.residentName}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          <Chip label={formatHours(getElapsedHours(item.receivedAt))} color="error" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {!loading && criticalPendingPackages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3}>Nenhuma pendência crítica no filtro atual.</TableCell>
                      </TableRow>
                    )}
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={3}>Carregando...</TableCell>
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

export default Home;
