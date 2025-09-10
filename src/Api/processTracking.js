import api from "./instance";

// Crear un nuevo registro de seguimiento
export const createTracking = async (data) => {
  const response = await api.post("/api/v1/process-tracking/", data);
  return response.data;
};

// Obtener el historial de seguimiento de una solicitud
export const getRequestTracking = async (request_type, request_id, params = {}) => {
  const response = await api.get(`/api/v1/process-tracking/request/${request_type}/${request_id}`, { params });
  return response.data;
};

// Obtener un registro de seguimiento específico
export const getTracking = async (tracking_id) => {
  const response = await api.get(`/api/v1/process-tracking/${tracking_id}`);
  return response.data;
};

// Actualizar un registro de seguimiento
export const updateTracking = async (tracking_id, data) => {
  const response = await api.put(`/api/v1/process-tracking/${tracking_id}`, data);
  return response.data;
};

// Eliminar un registro de seguimiento
export const deleteTracking = async (tracking_id) => {
  const response = await api.delete(`/api/v1/process-tracking/${tracking_id}`);
  return response.data;
}; 