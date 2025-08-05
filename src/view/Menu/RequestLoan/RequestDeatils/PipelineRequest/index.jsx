import React, { useState, useEffect } from "react";
import styles from "./style.module.css";
import VerifyIcon from "../../../../../assets/verify-icon.png";
import { getRequestTracking, createTracking } from "../../../../../Api/processTracking";

// Tipos de proceso disponibles
const PROCESS_STAGES = {
  revision_inicial: "Revisión Inicial",
  documentacion: "Documentación",
  aprobacion: "Aprobación",
  financiamiento: "Financiamiento",
  completado: "Completado",
  rechazado: "Rechazado"
};

const PipelineRequest = ({ requestId, requestType }) => {
  const [trackingList, setTrackingList] = useState([]);
  const [loading, setLoading] = useState(false);
    const [tipo, setTipo] = useState("");
    const [comentario, setComentario] = useState("");
  const [notas, setNotas] = useState("");
  const [completado, setCompletado] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Cargar historial de tracking
  const loadTracking = async () => {
    if (!requestId || !requestType) {
      console.error('PipelineRequest: Faltan parámetros', { requestId, requestType });
      return;
    }

    setLoading(true);
    try {
      console.log('Llamando a getRequestTracking con:', requestType, requestId);
      const response = await getRequestTracking(requestType, requestId);
      console.log('Respuesta de getRequestTracking:', response);

      if (response && Array.isArray(response)) {
        setTrackingList(response);
      } else if (response && Array.isArray(response.items)) {
        setTrackingList(response.items);
      } else if (response && Array.isArray(response.results)) {
        setTrackingList(response.results);
      } else {
        console.error('Formato de respuesta no reconocido:', response);
        setTrackingList([]);
      }
    } catch (error) {
      console.error('Error al cargar tracking:', error);
      setFeedback("Error al cargar el historial");
      setTrackingList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('PipelineRequest montado con:', { requestId, requestType });
    loadTracking();
  }, [requestId, requestType]);

  const handleSubmit = async (e) => {
        e.preventDefault();
    if (!tipo || !comentario) {
      setFeedback("Tipo y comentario son obligatorios");
      return;
    }

    setLoading(true);
    try {
      // Crear el objeto base
      const trackingData = {
        request_type: requestType,
        stage: tipo,
        description: comentario,
        notes: notas || "",
        completed: completado
      };

      // Agregar solo el ID correspondiente según el tipo
      switch (requestType) {
        case "dscr":
          trackingData.dscr_request_id = parseInt(requestId);
          break;
        case "fixflip":
          trackingData.fixflip_request_id = parseInt(requestId);
          break;
        case "construction":
          trackingData.construction_request_id = parseInt(requestId);
          break;
        default:
          throw new Error("Tipo de solicitud no válido");
      }

      console.log('Enviando tracking:', trackingData);
      const response = await createTracking(trackingData);
      console.log('Respuesta de createTracking:', response);

      // Limpiar el formulario
      setTipo("");
      setComentario("");
      setNotas("");
      setCompletado(false);
      setFeedback("Observación registrada exitosamente");
      
      // Recargar la lista
      loadTracking();
    } catch (error) {
      console.error('Error al crear tracking:', error);
      setFeedback(error.message || "Error al registrar la observación");
    } finally {
      setLoading(false);
    }
    };

    return (
        <div className="row">
            <div className="col-7">
                <div className={styles.pipeline_container}>
                    <div className={styles.steps_list}>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando historial...</p>
              </div>
            ) : trackingList.length === 0 ? (
              <div className="text-center py-4">
                <p>No hay actividades registradas</p>
                <small className="text-muted d-block">
                  Solicitud #{requestId} - {requestType?.toUpperCase()}
                </small>
              </div>
            ) : (
              trackingList.map((item, index) => (
                <div key={item.id || index} className={styles.step_item}>
                                <div className={styles.step_header}>
                    <span className={styles.step_type}>
                      {PROCESS_STAGES[item.stage] || item.stage || 'Estado no definido'}
                    </span>
                    <span className={styles.step_date}>
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.step_desc}>
                    {item.description}
                                </div>
                  {item.notes && (
                    <div className="mt-1 text-muted small">
                      <strong>Notas:</strong> {item.notes}
                            </div>
                  )}
                  {item.completed && (
                    <div className="mt-1">
                      <small className="badge bg-success">Completado</small>
                    </div>
                  )}
                </div>
              ))
            )}
                    </div>
                </div>
            </div>
            <div className="col-5">
                <form className={styles.comment_box_container} onSubmit={handleSubmit}>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
            style={{ width: "80px", height: "80px", marginBottom: "1rem" }}
                    >
                      <img src={VerifyIcon} alt="verify-icon" />
                    </div>
                    <h4 className={styles.comment_title}>Crear comentario</h4>
                    <select
                        className={styles.comment_select}
                        value={tipo}
            onChange={(e) => setTipo(e.target.value)}
                        required
                    >
            <option value="">Seleccione el estado del proceso</option>
            {Object.entries(PROCESS_STAGES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
                    </select>
                    <textarea
                        className={styles.comment_textarea}
            placeholder="Descripción del proceso..."
            rows={3}
                        value={comentario}
            onChange={(e) => setComentario(e.target.value)}
                        required
                    />
          <textarea
            className={styles.comment_textarea}
            placeholder="Notas adicionales (opcional)..."
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
                    <div className={styles.comment_checkbox_row}>
                        <label className={styles.comment_checkbox_label}>
              MARCAR COMO COMPLETADO
                            <input
                                type="checkbox"
                                className={styles.comment_checkbox}
                checked={completado}
                onChange={(e) => setCompletado(e.target.checked)}
                            />
                        </label>
                    </div>
          <button 
            className={styles.comment_button} 
            type="submit" 
            disabled={loading || !requestId || !requestType}
          >
            {loading ? "ENVIANDO..." : "ENVIAR"}
          </button>
          {feedback && (
            <div className={`mt-2 text-center ${feedback.includes("Error") ? "text-danger" : "text-success"}`}>
              {feedback}
            </div>
          )}
                </form>
            </div>
        </div>
    );
};

export default PipelineRequest; 