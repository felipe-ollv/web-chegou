import { Link } from "react-router-dom";
import PdfUpload from "../components/PdfUpload";

export default function PdfPage() {
  return (
    <div style={{ padding: 20 }}>
      <PdfUpload />
      <div style={{ marginTop: 20 }}>
        <Link to="/dashboard">Voltar ao Dashboard</Link>
      </div>
    </div>
  );
}
