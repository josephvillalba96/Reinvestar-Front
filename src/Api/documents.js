import api from "./instance";

// Crear un nuevo documento (ahora usa multipart/form-data)
export const createDocument = async (formData) => {
  const response = await api.post("/api/v1/documents/", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Obtener documentos (con paginación)
export const getDocuments = async (params = {}) => {
  const response = await api.get("/api/v1/documents/", { params });
  return response.data;
};

// Obtener documentos por solicitud específica
export const getDocumentsByRequest = async (request_type, request_id) => {
  const response = await api.get(`/api/v1/documents/request/${request_type}/${request_id}`);
  return response.data;
};

// Obtener un documento por ID
export const getDocumentById = async (document_id) => {
  const response = await api.get(`/api/v1/documents/${document_id}`);
  return response.data;
};

// Actualizar un documento por ID (ahora usa multipart/form-data)
export const updateDocument = async (document_id, formData) => {
  const response = await api.put(`/api/v1/documents/${document_id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Eliminar un documento por ID
export const deleteDocument = async (document_id) => {
  const response = await api.delete(`/api/v1/documents/${document_id}`);
  return response.data;
};

// Descargar un documento por ID (para usuarios autenticados)
export const downloadDocument = async (document_id) => {
  const response = await api.get(`/api/v1/documents/${document_id}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

// Descargar un documento por ID (para clientes)
export const downloadDocumentClient = async (document_id, access_token) => {
  try {
    const response = await api.get(`/api/v1/documents/${document_id}/download/client`, {
      params: { access_token },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error descargando documento cliente ${document_id}:`, error);
    throw error;
  }
};

// Obtener URL de descarga temporal para un documento (para usuarios autenticados)
export const getDocumentDownloadUrl = async (document_id) => {
  try {
    console.log(`Intentando obtener URL de descarga para documento ID: ${document_id}`);
    const response = await api.get(`/api/v1/documents/${document_id}/download-url`);
    console.log('URL de descarga obtenida:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo URL de descarga para documento ${document_id}:`, error);
    console.error('Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

// Obtener URL de descarga temporal para un documento (para clientes)
export const getDocumentDownloadUrlClient = async (document_id, access_token) => {
  const response = await api.get(`/api/v1/documents/${document_id}/download-url/client`, {
    params: { access_token }
  });
  return response.data;
};

// Obtener todos los documentos de un cliente autenticado
export const getClientDocuments = async (access_token) => {
  const response = await api.get("/api/v1/documents/client/my-documents", {
    params: { access_token }
  });
  return response.data;
};

// Obtener documentos de una solicitud específica del cliente
export const getClientRequestDocuments = async (request_type, request_id, access_token) => {
  const response = await api.get(`/api/v1/documents/client/request/${request_type}/${request_id}`, {
    params: { access_token }
  });
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

// ===== SERVICIOS DE OBSERVACIONES DE DOCUMENTOS =====

// Crear observación de documento
export const createDocumentObservation = async (data) => {
  const response = await api.post("/api/v1/document-observations/", data);
  return response.data;
};

// Listar todas las observaciones de documentos (con filtros y paginación)
export const getDocumentObservations = async (params = {}) => {
  const response = await api.get("/api/v1/document-observations/", { params });
  return response.data;
};

// Obtener observaciones de un documento específico
export const getDocumentObservationsByDocument = async (document_id) => {
  const response = await api.get(`/api/v1/document-observations/document/${document_id}`);
  return response.data;
};

// Obtener una observación específica por ID
export const getDocumentObservationById = async (observation_id) => {
  const response = await api.get(`/api/v1/document-observations/${observation_id}`);
  return response.data;
};

// Actualizar observación de documento
export const updateDocumentObservation = async (observation_id, data) => {
  const response = await api.put(`/api/v1/document-observations/${observation_id}`, data);
  return response.data;
};

// Eliminar observación de documento
export const deleteDocumentObservation = async (observation_id) => {
  const response = await api.delete(`/api/v1/document-observations/${observation_id}`);
  return response.data;
};

// Obtener estadísticas de observaciones de documentos
export const getDocumentObservationStats = async (params = {}) => {
  const response = await api.get("/api/v1/document-observations/stats/summary", { params });
  return response.data;
};