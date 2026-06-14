import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Upload, FileText, Image as ImageIcon, FileCheck,
  Download, Trash2, Loader2, ShieldCheck, Lock,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout/AdminLayout";
import { encryptedFilesApi, type EncryptedFile, type EncryptedFileType } from "../../../infrastructure/api/encryptedFilesApi";
import "./AdminCommon.css";
import "./AdminFiles.css";

const FILE_TYPE_LABEL: Record<EncryptedFileType, string> = {
  IDENTITY_DOC: "Documento de identidad",
  CONTRACT: "Contrato",
  VERIFICATION_IMAGE: "Imagen de verificación",
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatDate = (iso: string) => new Date(iso).toLocaleString("es-CO", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
});

const getIcon = (mime: string) => {
  if (mime.startsWith("image/")) return <ImageIcon size={22} />;
  if (mime === "application/pdf") return <FileText size={22} />;
  return <FileCheck size={22} />;
};

const AdminFiles = () => {
  const [files, setFiles] = useState<EncryptedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [fileType, setFileType] = useState<EncryptedFileType>("IDENTITY_DOC");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await encryptedFilesApi.list();
      setFiles(data);
    } catch {
      toast.error("No se pudieron cargar los archivos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo supera los 10 MB");
      return;
    }
    if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.type)) {
      toast.error("Solo se permiten JPG, PNG, WEBP o PDF");
      return;
    }

    setUploading(true);
    try {
      await encryptedFilesApi.upload(file, fileType);
      toast.success(`${file.name} cifrado y guardado`);
      await load();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Error al subir el archivo";
      toast.error(typeof msg === "string" ? msg : "Error al subir el archivo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (file: EncryptedFile) => {
    setDownloadingId(file.id);
    try {
      await encryptedFilesApi.download(file.id, file.original_filename);
      toast.success("Archivo descifrado y descargado");
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 403) toast.error("No tienes permisos para descargar este archivo");
      else toast.error("No se pudo descargar el archivo");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (file: EncryptedFile) => {
    if (!confirm(`¿Eliminar "${file.original_filename}" definitivamente?`)) return;
    setDeletingId(file.id);
    try {
      await encryptedFilesApi.remove(file.id);
      toast.success("Archivo eliminado");
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch {
      toast.error("No se pudo eliminar el archivo");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">
              <ShieldCheck size={26} /> Archivos cifrados
            </h1>
            <p className="admin-page-subtitle">
              Sube documentos, imágenes o PDFs cifrados con AES-256-GCM. Solo los usuarios autorizados pueden descargarlos descifrados.
            </p>
          </div>
        </div>

        {/* Tarjeta de subida */}
        <div className="admin-files-upload-card">
          <div className="admin-files-upload-icon">
            <Lock size={28} />
          </div>
          <div className="admin-files-upload-info">
            <h3>Subir nuevo archivo cifrado</h3>
            <p>Formatos: JPG, PNG, WEBP, PDF · Máximo 10 MB</p>
            <div className="admin-files-upload-controls">
              <select
                className="admin-files-select"
                value={fileType}
                onChange={(e) => setFileType(e.target.value as EncryptedFileType)}
                disabled={uploading}
              >
                <option value="IDENTITY_DOC">Documento de identidad</option>
                <option value="CONTRACT">Contrato</option>
                <option value="VERIFICATION_IMAGE">Imagen de verificación</option>
              </select>
              <button
                type="button"
                className="admin-files-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                {uploading ? "Subiendo..." : "Seleccionar archivo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                hidden
                onChange={handleUpload}
              />
            </div>
          </div>
        </div>

        {/* Listado */}
        <div className="admin-files-list-card">
          <div className="admin-files-list-header">
            <h2>Mis archivos ({files.length})</h2>
            <button type="button" className="admin-files-refresh" onClick={load} disabled={loading}>
              {loading ? <Loader2 size={14} className="spin" /> : null} Refrescar
            </button>
          </div>

          {loading && files.length === 0 ? (
            <div className="admin-files-empty">
              <Loader2 className="spin" size={28} />
              <p>Cargando archivos...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="admin-files-empty">
              <Lock size={32} />
              <p>No hay archivos cifrados aún.</p>
              <span>Sube el primero usando el panel de arriba.</span>
            </div>
          ) : (
            <div className="admin-files-table">
              {files.map((f) => (
                <div key={f.id} className="admin-files-row">
                  <div className="admin-files-row-icon">{getIcon(f.mime_type)}</div>
                  <div className="admin-files-row-info">
                    <span className="admin-files-row-name">{f.original_filename}</span>
                    <span className="admin-files-row-meta">
                      <span className="admin-files-badge">{FILE_TYPE_LABEL[f.file_type]}</span>
                      · {f.mime_type} · {formatDate(f.created_at)}
                    </span>
                  </div>
                  <div className="admin-files-row-actions">
                    <button
                      type="button"
                      className="admin-files-action-btn download"
                      onClick={() => handleDownload(f)}
                      disabled={downloadingId === f.id}
                      title="Descargar (descifrado)"
                    >
                      {downloadingId === f.id ? <Loader2 size={15} className="spin" /> : <Download size={15} />}
                    </button>
                    <button
                      type="button"
                      className="admin-files-action-btn delete"
                      onClick={() => handleDelete(f)}
                      disabled={deletingId === f.id}
                      title="Eliminar"
                    >
                      {deletingId === f.id ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFiles;
