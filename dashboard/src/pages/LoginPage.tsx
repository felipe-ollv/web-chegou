import { useNavigate } from "react-router-dom";
import QrLogin from "../components/QrLogin";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleAuthenticated = (jwt: string) => {
    localStorage.setItem("authToken", jwt);
    navigate("/dashboard");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", justifyContent: "center" }}>
      <h1 style={{ marginBottom: 20 }}>Painel Administrativo</h1>
      <QrLogin onAuthenticated={handleAuthenticated} />
    </div>
  );
}
