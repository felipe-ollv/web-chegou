import { useEffect, useMemo, useState } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";

import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { apiFetch } from "services/api";
import { getAuthContext } from "services/auth";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


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

function StatCard({ label, value, helper, color }) {
  return (
    <Card
      sx={(theme) => ({
        background: `linear-gradient(135deg, ${
          theme.palette[color]?.main || theme.palette.info.main
        }, ${theme.palette[color]?.dark || theme.palette.info.dark})`,
        color: theme.palette[color]?.contrastText || theme.palette.white.main,
      })}
    >
      <MDBox height="4px" borderRadius="md" bgColor="white" opacity={0.4} />
      <MDBox p={2.5} color="inherit">
        <MDTypography variant="h6" fontWeight="medium" color="inherit">
          {label}
        </MDTypography>
        <MDTypography variant="h3" fontWeight="bold" color="inherit">
          {value}
        </MDTypography>
        <MDTypography variant="button" color="inherit">
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

function Home() {
  const [summary, setSummary] = useState([
    { label: "Hoje", value: 0, helper: "últimas 24h", color: "info" },
    { label: "Esta semana", value: 0, helper: "últimos 7 dias", color: "warning" },
    { label: "Este mês", value: 0, helper: "mês atual", color: "success" },
  ]);
  const [recebimentosPorHora, setRecebimentosPorHora] = useState([]);
  const [retiradasPorHora, setRetiradasPorHora] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { profileUuid } = getAuthContext();
        if (!profileUuid) return;
        const resp = await apiFetch(`/received-package/find-received-package/${profileUuid}?limit=200`);
        const all = [...(resp?.deliver || []), ...(resp?.pickup || [])];
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - 6);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let todayCount = 0;
        let weekCount = 0;
        let monthCount = 0;
        const recebimentosByHour: Record<string, number> = {};
        const retiradasByHour: Record<string, number> = {};

        all.forEach((item) => {
          const createdAt = new Date(item.created_at);
          if (Number.isNaN(createdAt.getTime())) return;

          if (createdAt >= startOfDay) todayCount += 1;
          if (createdAt >= startOfWeek) weekCount += 1;
          if (createdAt >= startOfMonth) monthCount += 1;

          const hour = `${String(createdAt.getHours()).padStart(2, "0")}h`;
          if (item.status_package === "DELIVERED") {
            retiradasByHour[hour] = (retiradasByHour[hour] || 0) + 1;
          } else {
            recebimentosByHour[hour] = (recebimentosByHour[hour] || 0) + 1;
          }
        });

        const hours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, "0")}h`);
        setRecebimentosPorHora(hours.map((hour) => ({ hour, value: recebimentosByHour[hour] || 0 })));
        setRetiradasPorHora(hours.map((hour) => ({ hour, value: retiradasByHour[hour] || 0 })));

        setSummary([
          { label: "Hoje", value: todayCount, helper: "últimas 24h", color: "info" },
          { label: "Esta semana", value: weekCount, helper: "últimos 7 dias", color: "warning" },
          { label: "Este mês", value: monthCount, helper: "mês atual", color: "success" },
        ]);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const recebimentosChart = useMemo(
    () => ({
      labels: recebimentosPorHora.map((item) => item.hour),
      datasets: [
        {
          label: "Recebimentos",
          data: recebimentosPorHora.map((item) => item.value),
          backgroundColor: "#1A73E8",
          borderRadius: 6,
        },
      ],
    }),
    [recebimentosPorHora]
  );

  const retiradasChart = useMemo(
    () => ({
      labels: retiradasPorHora.map((item) => item.hour),
      datasets: [
        {
          label: "Retiradas",
          data: retiradasPorHora.map((item) => item.value),
          backgroundColor: "#17C1E8",
          borderRadius: 6,
        },
      ],
    }),
    [retiradasPorHora]
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {summary.map((item) => (
            <Grid item xs={12} md={4} key={item.label}>
              <StatCard label={item.label} value={item.value} helper={item.helper} color={item.color} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: "100%" }}>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={1}>
                  Picos de recebimentos
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Distribuição por hora (dados da API).
                </MDTypography>
              </MDBox>
              <Divider />
              <MDBox px={2} py={3} height={320}>
                <Bar data={recebimentosChart} options={baseBarOptions} />
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card sx={{ height: "100%" }}>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={1}>
                  Picos de retiradas
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Distribuição por hora (dados da API).
                </MDTypography>
              </MDBox>
              <Divider />
              <MDBox px={2} py={3} height={320}>
                <Bar data={retiradasChart} options={baseBarOptions} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} mt={1}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={1}>
                  Próximos passos
                </MDTypography>
                <MDTypography component="div" variant="button" color="text">
                  • Use os filtros (dia/semana/mês) para evoluir os cards. <br />
                  • Inclua tabelas de últimos recebimentos/retiradas se precisar de detalhe.
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Home;
