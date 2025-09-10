import api from "./instance";

// Obtener enlaces de solicitud
export const getRequestLinks = async (params = {}) => {
  const response = await api.get("/api/v1/request-links/", { params });
  return response.data;
};

// Crear enlace de solicitud
export const createRequestLink = async (data) => {
  const response = await api.post("/api/v1/request-links/", data);
  return response.data;
};

// Obtener enlace por token
export const getRequestLinkByToken = async (token) => {
  const response = await api.get(`/api/v1/request-links/token/${token}`);
  return response.data;
};

// Enviar enlace por email
export const sendRequestLink = async (data) => {
  const response = await api.post("/api/v1/request-links/send", data);
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