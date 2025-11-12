import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function MetabaseEmbed() {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmbed() {
      const res = await api.get<{ url: string }>("/metabase/dashboard");
      setEmbedUrl(res.data.url);
    }
    loadEmbed();
  }, []);

  if (!embedUrl) return <p>Carregando dashboard...</p>;

  return (
    <div style={{ position: "relative", paddingTop: "56.25%" }}>
      <iframe
        src={embedUrl}
        title="Dashboard"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
      />
    </div>
  );
}
