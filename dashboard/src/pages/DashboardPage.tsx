import { Link } from "react-router-dom";
import MetabaseEmbed from "../components/MetabaseEmbed";

export default function DashboardPage() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <MetabaseEmbed />
      <div style={{ marginTop: 20 }}>
        <Link to="/pdf">Ir para Envio de PDF</Link>
      </div>
    </div>
  );
}
