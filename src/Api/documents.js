import api from "./instance";

// Crear un nuevo documento
export const createDocument = async (data) => {
  const response = await api.post("/api/v1/documents/", data);
  return response.data;
};

// Obtener documentos (con filtros opcionales)
export const getDocuments = async (params = {}) => {
  const response = await api.get("/api/v1/documents/", { params });
  return response.data;
};

// Subir archivo a un documento
export const uploadDocumentFile = async (document_id, formData) => {
  const response = await api.post(`/api/v1/documents/${document_id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Obtener un documento por ID
export const getDocumentById = async (document_id) => {
  const response = await api.get(`/api/v1/documents/${document_id}`);
  return response.data;
};

// Actualizar un documento por ID
export const updateDocument = async (document_id, data) => {
  const response = await api.put(`/api/v1/documents/${document_id}`, data);
  return response.data;
};

// Eliminar un documento por ID
export const deleteDocument = async (document_id) => {
  const response = await api.delete(`/api/v1/documents/${document_id}`);
  return response.data;
};

// Obtener progreso de carga de documentos para una solicitud
export const getDocumentProgress = async (request_type, request_id) => {
  const response = await api.get(`/api/v1/documents/request-progress/${request_type}/${request_id}`);
  return response.data;
};

// Listar tipos de documentos
export const getTypeDocuments = async () => {
  const response = await api.get("/api/v1/documents/types");
  return response.data;
};

// Crear tipo de documento
export const createTypeDocument = async (data) => {
  const response = await api.post("/api/v1/documents/types", data);
  return response.data;
};

// Actualizar tipo de documento
export const updateTypeDocument = async (type_id, data) => {
  const response = await api.put(`/api/v1/documents/types/${type_id}`, data);
  return response.data;
};

// Eliminar tipo de documento
export const deleteTypeDocument = async (type_id) => {
  const response = await api.delete(`/api/v1/documents/types/${type_id}`);
  return response.data;
}; 