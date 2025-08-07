import React, { useState } from 'react';
import styles from './style.module.css';
import { updateDscr } from '../../../../../Api/dscr';
import { updateFixflip } from '../../../../../Api/fixflip';
import { updateConstruction } from '../../../../../Api/construction';

const StatusManagement = ({ requestId, requestType, currentStatus, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const statusOptions = [
    { value: "PENDING", label: "Pendiente", color: "bg-warning" },
    { value: "IN_REVIEW", label: "En Revisión", color: "bg-info" },
    { value: "PRICING", label: "En Pricing", color: "bg-primary" },
    { value: "ACCEPTED", label: "Aprobada", color: "bg-success" },
    { value: "REJECTED", label: "Rechazada", color: "bg-danger" },
    { value: "CANCELLED", label: "Cancelada", color: "bg-secondary" },
    { value: "CLOSED", label: "Cerrada", color: "bg-dark" }
  ];

  const handleSaveStatus = async () => {
    if (!window.confirm(`¿Estás seguro de cambiar el estado a ${statusOptions.find(s => s.value === selectedStatus)?.label}?`)) {
      return;
    }

    setLoading(true);
    setError("");
    setFeedback("");

    try {
      // Preparar los datos para actualizar
      const updateData = { status: selectedStatus };
      
      console.log('Actualizando estado:', {
        requestId,
        requestType,
        currentStatus,
        selectedStatus,
        updateData
      });
      
      let response;
      
      // Llamar a la API correspondiente según el tipo de solicitud
      switch (requestType) {
        case "dscr":
          response = await updateDscr(requestId, updateData);
          break;
        case "fixflip":
          response = await updateFixflip(requestId, updateData);
          break;
        case "construction":
          response = await updateConstruction(requestId, updateData);
          break;
        default:
          throw new Error("Tipo de solicitud no válido");
      }
      
      console.log('Respuesta de la API:', response);
      
      // Actualizar el estado local
      onStatusChange(selectedStatus);
      setFeedback("Estado actualizado exitosamente");
      
      // Limpiar el error si existía
      setError("");
      
    } catch (error) {
      console.error('Error actualizando estado:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.detail || error.message || "Error al actualizar el estado");
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
              <li><strong>Aprobada:</strong> La solicitud ha sido aprobada y está lista para generar la carta de intención.</li>
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