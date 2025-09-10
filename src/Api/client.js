import api from "./instance";

// Crear un nuevo cliente
export const createClient = async (data) => {
  const response = await api.post("/api/v1/clients/", data);
  return response.data;
};

// Obtener todos los clientes (con filtros opcionales)
export const getClients = async (params = {}) => {
  const response = await api.get("/api/v1/clients/", { params });
  return response.data;
};

// Obtener un cliente por ID
export const getClientById = async (client_id) => {
  const response = await api.get(`/api/v1/clients/${client_id}`);
  return response.data;
};

// Actualizar un cliente por ID
export const updateClient = async (client_id, data) => {
  const response = await api.put(`/api/v1/clients/${client_id}`, data);
  return response.data;
};

// Eliminar un cliente por ID
export const deleteClient = async (client_id) => {
  const response = await api.delete(`/api/v1/clients/${client_id}`);
  return response.data;
};
