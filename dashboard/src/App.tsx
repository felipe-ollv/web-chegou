import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PdfPage from "./pages/PdfPage";

export default function App() {
  const isAuth = !!localStorage.getItem("authToken");

  return (
    <BrowserRouter basename="/painel">
      <Routes>
        <Route path="/" element={isAuth ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/dashboard" element={isAuth ? <DashboardPage /> : <Navigate to="/" />} />
        <Route path="/pdf" element={isAuth ? <PdfPage /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

