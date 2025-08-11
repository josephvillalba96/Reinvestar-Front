import React, { useEffect, useState } from 'react';
import styles from './style.module.css';
import {
  createIntentLetter,
  getIntentLetters,
  uploadIntentLetterFile,
  updateIntentLetterStatus,
} from '../../../../../Api/intentLetters';

const IntentionLetter = ({ requestId, requestType, solicitud }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [intentLetter, setIntentLetter] = useState(null);
  const [file, setFile] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const buildParamsByType = () => {
    const params = { skip: 0, limit: 1 };
    if (requestType === 'dscr') params.dscr_request_id = Number(requestId);
    if (requestType === 'fixflip') params.fixflip_request_id = Number(requestId);
    if (requestType === 'construction') params.construction_request_id = Number(requestId);
    return params;
  };

  const buildCreatePayload = () => {
    // Incluir título y contenido requeridos por el backend
    const base = { title: title?.trim(), content: content?.trim() };
    if (requestType === 'dscr') return { ...base, dscr_request_id: Number(requestId) };
    if (requestType === 'fixflip') return { ...base, fixflip_request_id: Number(requestId) };
    if (requestType === 'construction') return { ...base, construction_request_id: Number(requestId) };
    return base;
  };

  const loadIntentLetter = async () => {
    try {
      const data = await getIntentLetters(buildParamsByType());
      if (Array.isArray(data) && data.length > 0) {
        setIntentLetter(data[0]);
      } else if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
        setIntentLetter(data.items[0]);
      } else {
        setIntentLetter(null);
      }
    } catch (e) {
      console.error('Error cargando carta de intención:', e);
    }
  };

  useEffect(() => {
    if (requestId && requestType) {
      loadIntentLetter();
      const suggestedTitle = `Carta de Intención - ${String(requestType).toUpperCase()} #${requestId}`;
      const suggestedContent = `Estimado cliente,\n\nPor medio de la presente dejamos constancia de la intención de proceder con el estudio de su solicitud ${String(requestType).toUpperCase()} #${requestId}. Esta carta no constituye un compromiso final de financiamiento y está sujeta a verificación de documentos, evaluación de riesgos y aprobación final.\n\nAtentamente,\nReInvestar`;
      setTitle((prev) => prev || suggestedTitle);
      setContent((prev) => prev || suggestedContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, requestType]);

  const handleGenerateLetter = async () => {
    if (!window.confirm("¿Estás seguro de generar la carta de intención?")) {
      return;
    }

    setLoading(true);
    setError("");
    setFeedback("");

    try {
      if (!title?.trim() || !content?.trim()) {
        setError('Título y contenido son obligatorios');
        setLoading(false);
        return;
      }
      const payload = buildCreatePayload();
      const created = await createIntentLetter(payload);
      setIntentLetter(created);
      setFeedback("Carta de intención generada exitosamente");
    } catch (error) {
      console.error('Error generando carta de intención:', error);
      // Reintentar con forma alternativa si el backend espera request_type/request_id
      if (error?.response?.status === 422) {
        try {
          const altPayload = { request_type: requestType, request_id: Number(requestId) };
          const createdAlt = await createIntentLetter(altPayload);
          setIntentLetter(createdAlt);
          setFeedback("Carta de intención generada exitosamente");
          return;
        } catch (inner) {
          console.error('Reintento createIntentLetter con request_type/request_id falló:', inner);
          const detail2 = inner?.response?.data?.detail;
          const message2 = Array.isArray(detail2)
            ? detail2.map(d => d?.msg || JSON.stringify(d)).join(' | ')
            : (typeof detail2 === 'string' ? detail2 : (inner.message || 'Error al generar la carta de intención'));
          setError(message2);
          return;
        }
      }
      const detail = error?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map(d => d?.msg || JSON.stringify(d)).join(' | ')
        : (typeof detail === 'string' ? detail : (error.message || 'Error al generar la carta de intención'));
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLetter = async () => {
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      if (intentLetter?.file_url) {
        window.open(intentLetter.file_url, '_blank');
        setFeedback("Abriendo carta de intención...");
      } else {
        setFeedback("No hay archivo de carta de intención cargado aún.");
      }
    } catch (error) {
      console.error('Error descargando carta de intención:', error);
      const detail = error?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map(d => d?.msg || JSON.stringify(d)).join(' | ')
        : (typeof detail === 'string' ? detail : (error.message || 'Error al descargar la carta de intención'));
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async () => {
    if (!intentLetter?.id || !file) return;
    setLoading(true);
    setError("");
    setFeedback("");
    try {
      const updated = await uploadIntentLetterFile(intentLetter.id, file);
      setIntentLetter(updated);
      setFeedback("Archivo de carta de intención subido correctamente");
      setFile(null);
    } catch (e) {
      console.error('Error subiendo archivo de carta de intención:', e);
      const detail = e?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map(d => d?.msg || JSON.stringify(d)).join(' | ')
        : (typeof detail === 'string' ? detail : (e.message || 'Error al subir el archivo'));
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproved = async () => {
    if (!intentLetter?.id) return;
    setUpdatingStatus(true);
    setError("");
    setFeedback("");
    try {
      const next = await updateIntentLetterStatus(intentLetter.id, !intentLetter?.is_approved);
      setIntentLetter(next);
      setFeedback("Estado de aprobación actualizado");
    } catch (e) {
      console.error('Error actualizando estado de carta de intención:', e);
      const detail = e?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map(d => d?.msg || JSON.stringify(d)).join(' | ')
        : (typeof detail === 'string' ? detail : (e.message || 'Error al actualizar el estado'));
      setError(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <h4 className="my_title_color fw-bold mb-4">Carta de Intención</h4>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Generar Carta de Intención</h5>

              <div className="alert alert-info mb-4">
                <i className="fas fa-info-circle me-2"></i>
                La carta de intención es un documento que establece los términos y condiciones preliminares del préstamo.
              </div>

              {/* Campos de Título y Contenido */}
              <div className="mb-3">
                <label className="form-label small text-muted">Título</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la carta"
                />
              </div>
              <div className="mb-3">
                <label className="form-label small text-muted">Contenido</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Contenido de la carta"
                />
              </div>

              <div className="d-flex gap-3 flex-wrap align-items-center">
                <button
                  className="btn btn-primary"
                  onClick={handleGenerateLetter}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-alt me-2"></i>
                      Generar Carta
                    </>
                  )}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadLetter}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Descargando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download me-2"></i>
                      Descargar Carta
                    </>
                  )}
                </button>

                <div className="d-flex align-items-center gap-2">
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    disabled={loading || !intentLetter}
                    style={{ maxWidth: 260 }}
                  />
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleUploadFile}
                    disabled={loading || !intentLetter || !file}
                    title={!intentLetter ? 'Genere primero la carta' : ''}
                  >
                    <i className="fas fa-upload me-1"></i>
                    Subir archivo
                  </button>
                </div>

                {intentLetter && (
                  <button
                    className={`btn btn-sm ${intentLetter?.is_approved ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={handleToggleApproved}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? 'Actualizando...' : intentLetter?.is_approved ? 'Aprobada' : 'Marcar Aprobada'}
                  </button>
                )}
              </div>

              {error && (
                <div className="alert alert-danger mt-3">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              {feedback && (
                <div className="alert alert-success mt-3">
                  <i className="fas fa-check-circle me-2"></i>
                  {feedback}
                </div>
              )}

              {intentLetter && (
                <div className="mt-3 small text-muted">
                  <div><strong>ID Carta:</strong> {intentLetter.id}</div>
                  {intentLetter.file_url && (
                    <div><strong>Archivo:</strong> <a href={intentLetter.file_url} target="_blank" rel="noreferrer">Ver archivo</a></div>
                  )}
                  {typeof intentLetter.is_approved === 'boolean' && (
                    <div><strong>Aprobación:</strong> {intentLetter.is_approved ? 'Aprobada' : 'Pendiente'}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="alert alert-warning">
            <h5 className="alert-heading">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Importante
            </h5>
            <p className="mb-0">
              La carta de intención solo estará disponible cuando la solicitud esté en estado "Aprobada". 
              Este documento es un paso preliminar y no constituye un compromiso final de financiamiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntentionLetter;