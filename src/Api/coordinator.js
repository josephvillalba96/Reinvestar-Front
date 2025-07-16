import api from "./instance";

// Listar coordinadores
export const getCoordinators = async (params = {}) => {
  const response = await api.get("/api/v1/coordinators", { params });
  return response.data;
};

// Crear coordinador
export const createCoordinator = async (data) => {
  const response = await api.post("/api/v1/coordinators", data);
  return response.data;
};

// Obtener coordinador por ID
export const getCoordinatorById = async (coordinator_id) => {
  const response = await api.get(`/api/v1/coordinators/${coordinator_id}`);
  return response.data;
};

// Actualizar coordinador
export const updateCoordinator = async (coordinator_id, data) => {
  const response = await api.put(`/api/v1/coordinators/${coordinator_id}`, data);
  return response.data;
};

// Eliminar coordinador
export const deleteCoordinator = async (coordinator_id) => {
  const response = await api.delete(`/api/v1/users/coordinators/${coordinator_id}`);
  return response.data;
}; 