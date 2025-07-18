import React, { useEffect, useState } from "react";
import Load from "../../../../../assets/material-symbols_upload.svg";
import Check from "../../../../../assets/lets-icons_check-fill.svg";
import VerifyIcon from "../../../../../assets/verify-icon.png";
import styles from "./style.module.css";
import { createDocument, uploadDocumentFile, deleteDocument, getDocuments, getTypeDocuments } from "../../../../../Api/documents";

const DocumentsRequest = ({ requestId, requestType }) => {
  const [typeDocuments, setTypeDocuments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({ type_document_id: "", file: null });

  // Cargar tipos de documento
  useEffect(() => {
    getTypeDocuments().then(setTypeDocuments).catch(() => setTypeDocuments([]));
  }, []);

  // Cargar documentos cargados
  useEffect(() => {
    if (!requestId || !requestType) return;
    setLoading(true);
    setFeedback("");
    const params = {};
    if (requestType === "dscr") params.dscr_request_id = requestId;
    if (requestType === "fixflip") params.fixflip_request_id = requestId;
    if (requestType === "construction") params.construction_request_id = requestId;
    getDocuments(params)
      .then(setDocuments)
      .catch(() => setFeedback("Error al cargar documentos"))
      .finally(() => setLoading(false));
  }, [requestId, requestType]);

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((prev) => ({ ...prev, file: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Subir documento
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.type_document_id || !form.file) {
      setFeedback("Selecciona tipo y archivo para subir un documento");
      return;
    }
    setLoading(true);
    setFeedback("");
    try {
      // 1. Crear registro de documento
      const docData = {
        type_document_id: Number(form.type_document_id),
        dscr_request_id: requestType === "dscr" ? requestId : undefined,
        fixflip_request_id: requestType === "fixflip" ? requestId : undefined,
        construction_request_id: requestType === "construction" ? requestId : undefined,
        file_path: ""
      };
      const created = await createDocument(docData);
      // 2. Subir archivo
      const formData = new FormData();
      formData.append("file", form.file);
      await uploadDocumentFile(created.id, formData);
      setForm({ type_document_id: "", file: null });
      setFeedback("Documento cargado exitosamente");
      // Refrescar lista
      const params = {};
      if (requestType === "dscr") params.dscr_request_id = requestId;
      if (requestType === "fixflip") params.fixflip_request_id = requestId;
      if (requestType === "construction") params.construction_request_id = requestId;
      const docs = await getDocuments(params);
      setDocuments(docs);
    } catch {
      setFeedback("Error al cargar el documento");
    }
    setLoading(false);
  };

  // Eliminar documento
  const handleDelete = async (docId) => {
    setLoading(true);
    setFeedback("");
    try {
      await deleteDocument(docId);
      setFeedback("Documento eliminado");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      setFeedback("Error al eliminar el documento");
    }
    setLoading(false);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Columna izquierda - Cargar documentos */}
        <div className="col-7">
          <div className="d-flex flex-column gap-3">
            <form className="p-3 rounded shadow-sm bg-light" onSubmit={handleUpload}>
              <div className="mb-2">
                <label className="form-label">Tipo de documento</label>
                <select
                  className="form-select"
                  name="type_document_id"
                  value={form.type_document_id}
                  onChange={handleFormChange}
                  disabled={loading}
                  required
                >
                  <option value="">Seleccione tipo</option>
                  {typeDocuments.map((td) => (
                    <option value={td.id} key={td.id}>{td.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label">Archivo</label>
                <input
                  type="file"
                  className="form-control"
                  name="file"
                  accept="application/pdf,image/*"
                  onChange={handleFormChange}
                  disabled={loading}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
                {loading ? "CARGANDO..." : "CARGAR DOCUMENTO"}
              </button>
            </form>
            {/* Lista de documentos cargados */}
            {documents.length > 0 && (
              <div className="mt-4">
                <h6>Documentos cargados:</h6>
                {documents.map((doc) => (
                  <div key={doc.id} className="d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <img src={Check} alt="ok" width={20} />
                      <span>{doc.name} ({doc.type_document?.name || ""})</span>
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="ms-2">Ver archivo</a>
                      )}
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc.id)} disabled={loading}>
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
            {feedback && (
              <div className="alert alert-info mt-3">{feedback}</div>
            )}
          </div>
        </div>
        {/* Columna derecha - decorativa */}
        <div className="col-5">
          <div className={styles.comment_box_container}>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
              style={{ width: "80px", height: "80px", marginBottom: "1rem" }}
            >
              <img src={VerifyIcon} alt="verify-icon" />
            </div>
            <h4 className={styles.comment_title}>Carga tus documentos</h4>
            <p className="text-muted text-center">Sube los documentos requeridos para tu solicitud. Puedes cargar varios, uno a uno.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsRequest;
