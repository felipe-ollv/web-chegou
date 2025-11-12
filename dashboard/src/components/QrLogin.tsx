import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import api from "../api/axiosConfig";

interface QrLoginProps {
  onAuthenticated: (jwt: string) => void;
}

interface QrCreateResponse {
  token: string;
}

export default function QrLogin({ onAuthenticated }: QrLoginProps) {
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: number | undefined;

    async function createQr() {
      try {
        const res = await api.post<QrCreateResponse>("/auth/qr-create");
        setQrToken(res.data.token);
        setLoading(false);

        interval = setInterval(async () => {
          try {
            const check = await api.get<{ valid: boolean; jwt?: string }>(
              `/auth/qr-status/${res.data.token}`
            );
            if (check.data.valid && check.data.jwt) {
              clearInterval(interval);
              onAuthenticated(check.data.jwt);
            }
          } catch {}
        }, 2000);
      } catch (err) {
        console.error("Erro ao gerar QR:", err);
      }
    }

    createQr();
    return () => clearInterval(interval);
  }, [onAuthenticated]);

  if (loading) return <p>Gerando QR Code...</p>;

  const qrUrl = `https://seuapp.com/qr-login/${qrToken}`;

  return (
    <div style={{ textAlign: "center" }}>
      <p>Escaneie com o app logado:</p>
      <QRCodeCanvas value={qrUrl} size={200} />
    </div>
  );
}
