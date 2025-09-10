import api from "./instance";

// Obtener el pipeline de solicitudes para un vendedor
export const getVendorPipeline = async () => {
  const response = await api.get("/api/v1/pipeline/vendor-pipeline");
  return response.data;
};

// Obtener el dashboard para coordinadores
export const getCoordinatorDashboard = async (params = {}) => {
  const response = await api.get("/api/v1/pipeline/coordinator-dashboard", { params });
  return response.data;
};

// Obtener la línea de tiempo de eventos para una solicitud específica
export const getRequestTimeline = async (request_type, request_id) => {
  const response = await api.get(`/api/v1/pipeline/request-timeline/${request_type}/${request_id}`);
  return response.data;
}; 