import React, { useState } from 'react';
import styles from './style.module.css';

const IntentionLetter = ({ requestId, requestType, solicitud }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleGenerateLetter = async () => {
    if (!window.confirm("¿Estás seguro de generar la carta de intención?")) {
      return;
    }

    setLoading(true);
    setError("");
    setFeedback("");

    try {
      // TODO: Implementar llamada a la API para generar la carta de intención
      // await generateIntentionLetter(requestId, requestType);
      
      setFeedback("Carta de intención generada exitosamente");
    } catch (error) {
      console.error('Error generando carta de intención:', error);
      setError(error.response?.data?.detail || "Error al generar la carta de intención");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLetter = async () => {
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      // TODO: Implementar llamada a la API para descargar la carta de intención
      // const blob = await downloadIntentionLetter(requestId, requestType);
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = `carta_intencion_${requestType}_${requestId}.pdf`;
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      // window.URL.revokeObjectURL(url);
      
      setFeedback("Carta de intención descargada exitosamente");
    } catch (error) {
      console.error('Error descargando carta de intención:', error);
      setError(error.response?.data?.detail || "Error al descargar la carta de intención");
    } finally {
      setLoading(false);
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

              <div className="d-flex gap-3">
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