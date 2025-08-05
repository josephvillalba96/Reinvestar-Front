import api from "./instance";

// Obtener lista de tipos de documentos
export const getTypesDocument = async (params = {}) => {
  const response = await api.get("/api/v1/types-document/", { params });
  return response.data;
};

// Crear nuevo tipo de documento
export const createTypeDocument = async (data) => {
  const response = await api.post("/api/v1/types-document/", data);
  return response.data;
};

// Obtener un tipo de documento específico por ID
export const getTypeDocumentById = async (type_id) => {
  const response = await api.get(`/api/v1/types-document/${type_id}`);
  return response.data;
};

// Actualizar un tipo de documento
export const updateTypeDocument = async (type_id, data) => {
  const response = await api.put(`/api/v1/types-document/${type_id}`, data);
  return response.data;
};

// Eliminar un tipo de documento
export const deleteTypeDocument = async (type_id) => {
  const response = await api.delete(`/api/v1/types-document/${type_id}`);
  return response.data;
}; 