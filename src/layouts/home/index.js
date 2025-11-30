import { useMemo } from "react";

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const summary = [
  { label: "Hoje", value: 24, helper: "+3 vs ontem", color: "info" },
  { label: "Esta semana", value: 182, helper: "+18 vs semana passada", color: "warning" },
  { label: "Este mês", value: 742, helper: "+6% vs mês passado", color: "success" },
];

const recebimentosPorHora = [
  { hour: "08h", value: 12 },
  { hour: "09h", value: 18 },
  { hour: "10h", value: 22 },
  { hour: "11h", value: 16 },
  { hour: "12h", value: 8 },
  { hour: "14h", value: 20 },
  { hour: "15h", value: 24 },
  { hour: "16h", value: 15 },
  { hour: "17h", value: 10 },
];

const retiradasPorHora = [
  { hour: "08h", value: 6 },
  { hour: "09h", value: 9 },
  { hour: "10h", value: 11 },
  { hour: "11h", value: 13 },
  { hour: "12h", value: 7 },
  { hour: "14h", value: 12 },
  { hour: "15h", value: 16 },
  { hour: "16h", value: 18 },
  { hour: "17h", value: 14 },
];

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
    []
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
    []
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {summary.map((item) => (
            <Grid item xs={12} md={4} key={item.label}>
              <StatCard label={item.label} value={item.value} helper={item.helper} />
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
                  Distribuição por hora (dados mock). Conecte sua API para dados reais.
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
                  Distribuição por hora (dados mock). Conecte sua API para dados reais.
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
                  • Troque os dados mock por uma chamada à sua API. <br />
                  • Crie filtros (dia/semana/mês) e use o resultado para atualizar os cards. <br />•
                  Inclua tabelas de últimos recebimentos/retiradas se precisar de detalhe.
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
