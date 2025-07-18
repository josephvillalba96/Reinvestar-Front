import api from "./instance";

// Obtener todos los procesadores (con paginación y búsqueda)
export const getProcessors = async (params = {}) => {
  const response = await api.get("/api/v1/processors/", { params });
  return response.data;
};

// Crear un nuevo procesador
export const createProcessor = async (data) => {
  const response = await api.post("/api/v1/processors/", data);
  return response.data;
};

// Obtener estadísticas de carga de trabajo de los procesadores
export const getProcessorWorkload = async () => {
  const response = await api.get("/api/v1/processors/workload");
  return response.data;
};

// Obtener un procesador por ID
export const getProcessorById = async (processor_id) => {
  const response = await api.get(`/api/v1/processors/${processor_id}`);
  return response.data;
};

// Actualizar un procesador por ID
export const updateProcessor = async (processor_id, data) => {
  const response = await api.put(`/api/v1/processors/${processor_id}`, data);
  return response.data;
};

// Eliminar un procesador por ID
export const deleteProcessor = async (processor_id) => {
  const response = await api.delete(`/api/v1/processors/${processor_id}`);
  return response.data;
};

// Asignar un procesador a una solicitud
export const assignProcessor = async (data) => {
  const response = await api.post("/api/v1/processors/assign", data);
  return response.data;
};

// Obtener asignaciones de procesadores según filtros
export const getProcessorAssignments = async (params = {}) => {
  const response = await api.get("/api/v1/processors/assignments", { params });
  return response.data;
};

// Obtener una asignación específica por ID
export const getProcessorAssignmentById = async (assignment_id) => {
  const response = await api.get(`/api/v1/processors/assignments/${assignment_id}`);
  return response.data;
};

// Desactivar una asignación existente
export const deactivateProcessorAssignment = async (assignment_id) => {
  const response = await api.put(`/api/v1/processors/assignments/${assignment_id}/deactivate`);
  return response.data;
}; 