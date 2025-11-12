import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

interface UploadItem {
  id: string;
  name: string;
  url: string;
}

export default function PdfUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const fetchUploads = async () => {
    const res = await api.get<UploadItem[]>("/pdf/list");
    setUploads(res.data);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/pdf/upload", formData);
    setFile(null);
    fetchUploads();
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  return (
    <div>
      <h2>Enviar PDF</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file}>
        Enviar
      </button>

      <h3>Uploads anteriores</h3>
      <ul>
        {uploads.map((u) => (
          <li key={u.id}>
            <a href={u.url} target="_blank" rel="noreferrer">
              {u.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
