import api from "./instance";

// Crear un nuevo enlace de solicitud
export const createRequestLink = async (data) => {
  const response = await api.post("/api/v1/request-links/", data);
  return response.data;
};

// Obtener todos los enlaces de solicitud (con filtros opcionales)
export const getRequestLinks = async (params = {}) => {
  const response = await api.get("/api/v1/request-links/", { params });
  return response.data;
};

// Validar un enlace de solicitud por token
export const validateRequestLink = async (token) => {
  const response = await api.get(`/api/v1/request-links/${token}/validate`);
  return response.data;
};

// Desactivar un enlace de solicitud por ID
export const deactivateRequestLink = async (link_id) => {
  const response = await api.put(`/api/v1/request-links/${link_id}/deactivate`);
  return response.data;
}; 