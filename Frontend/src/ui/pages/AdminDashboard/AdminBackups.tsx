import { useEffect, useState } from "react";
import { DatabaseBackup, Download, RefreshCw, Play, Loader2, HardDrive } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../components/layout/AdminLayout/AdminLayout";
import { backupApi, type BackupFile } from "../../../infrastructure/api/backupApi";
import "./AdminCommon.css";

const AdminBackups = () => {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    backupApi.list()
      .then(setBackups)
      .catch((e) => console.error("Error listando backups:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRun = async () => {
    setRunning(true);
    try {
      await backupApi.downloadNow();
      toast.success("Backup generado y descargado");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo generar el backup");
    } finally {
      setRunning(false);
    }
  };

  const handleDownload = async (name: string) => {
    setDownloading(name);
    try {
      await backupApi.download(name);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo descargar");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Backups</h1>
          <p>Copias de seguridad de PostgreSQL y MongoDB</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="admin-btn ghost" onClick={load} disabled={loading || running}>
            <RefreshCw size={15} /> Actualizar
          </button>
          <button className="admin-btn primary" onClick={handleRun} disabled={running}>
            {running ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
            {running ? "Generando…" : "Crear backup ahora"}
          </button>
        </div>
      </div>

      <div className="admin-panel" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <DatabaseBackup size={22} color="#ff6a00" />
        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
          Se genera una copia automática cada día a las 2:00 AM. También puedes crear una manual.
          Cada backup incluye un archivo de PostgreSQL y otro de MongoDB en formato JSON.
        </p>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando backups…</div>
        ) : backups.length === 0 ? (
          <div className="admin-empty">Aún no hay backups. Crea el primero con el botón de arriba.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Archivo</th><th>Tamaño</th><th>Fecha</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.name}>
                  <td><HardDrive size={14} style={{ verticalAlign: "-2px", marginRight: 6, color: "#9aa0ab" }} />{b.name}</td>
                  <td>{b.size}</td>
                  <td>{b.date}</td>
                  <td>
                    <button
                      className="admin-icon-btn"
                      title="Descargar"
                      onClick={() => handleDownload(b.name)}
                      disabled={downloading === b.name}
                    >
                      {downloading === b.name ? <Loader2 size={15} className="spin" /> : <Download size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBackups;
