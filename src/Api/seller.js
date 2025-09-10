import api from "./instance";

// Listar vendedores
export const getSellers = async (params = {}) => {
  const response = await api.get("/api/v1/sellers/", { params });
  return response.data;
};

// Crear vendedor
export const createSeller = async (data) => {
  const response = await api.post("/api/v1/sellers/", data);
  return response.data;
};

// Obtener vendedor por ID
export const getSellerById = async (seller_id) => {
  const response = await api.get(`/api/v1/sellers/${seller_id}`);
  return response.data;
};

// Actualizar vendedor
export const updateSeller = async (seller_id, data) => {
  const response = await api.put(`/api/v1/sellers/${seller_id}`, data);
  return response.data;
};

// Eliminar vendedor
export const deleteSeller = async (seller_id) => {
  const response = await api.delete(`/api/v1/sellers/${seller_id}`);
  return response.data;
}; 