import React, { useState } from 'react';
import styles from './style.module.css';
import { changeRequestStatus, StatusEnum, StatusLabels, StatusColors } from '../../../../../Api/requestStatus';

const StatusManagement = ({ requestId, requestType, currentStatus, onDataNeedsRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const statusOptions = Object.entries(StatusEnum).map(([key, value]) => ({
    value,
    label: StatusLabels[value],
    color: StatusColors[value]
  }));

  const handleSaveStatus = async () => {
    if (!window.confirm(`¿Estás seguro de cambiar el estado a ${statusOptions.find(s => s.value === selectedStatus)?.label}?`)) {
      return;
    }

    setLoading(true);
    setError("");
    setFeedback("");

    try {
      // Llamar al nuevo servicio de cambio de estado
      await changeRequestStatus({
        request_type: requestType,
        request_id: requestId,
        new_status: selectedStatus
      });
      
      // Llamar a la función de refresco del padre
      if (onDataNeedsRefresh) {
        onDataNeedsRefresh();
      }
      
      setFeedback("Estado actualizado exitosamente");
      
      // Limpiar el error si existía
      setError("");
      
    } catch (error) {
      console.error('Error actualizando estado:', error);
      setError(error.message || "Error al actualizar el estado");
      setFeedback("");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-secondary';
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <h4 className="my_title_color fw-bold mb-4">Gestión de Estado</h4>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Estado Actual</h5>
              <div className="d-flex align-items-center mb-4">
                <span className={`badge ${getStatusColor(currentStatus)} fs-6 me-3`}>
                  {statusOptions.find(s => s.value === currentStatus)?.label || 'Desconocido'}
                </span>
              </div>

              <h5 className="card-title mb-4">Cambiar Estado</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="statusSelect" className="form-label fw-bold">
                      Seleccionar Nuevo Estado
                    </label>
                    <select
                      id="statusSelect"
                      className="form-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={loading}
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveStatus}
                    disabled={loading || selectedStatus === currentStatus}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Guardar Estado
                      </>
                    )}
                  </button>
                </div>
              </div>

              {loading && (
                <div className="alert alert-info mt-3">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  Actualizando estado...
                </div>
              )}

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
          <div className="alert alert-info">
            <h5 className="alert-heading">
              <i className="fas fa-info-circle me-2"></i>
              Información sobre los Estados
            </h5>
            <ul className="mb-0">
              <li><strong>Pendiente:</strong> La solicitud está en espera de revisión inicial.</li>
              <li><strong>En Revisión:</strong> La solicitud está siendo evaluada por el equipo.</li>
              <li><strong>En Pricing:</strong> Se está determinando la tasa y condiciones.</li>
              <li><strong>Aprobada:</strong> Cliente recibe carta de intención y aprueba con su firma.</li>
              <li><strong>Rechazada:</strong> La solicitud no cumple con los requisitos.</li>
              <li><strong>Cancelada:</strong> El cliente ha cancelado la solicitud.</li>
              <li><strong>Cerrada:</strong> El proceso ha finalizado.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusManagement;