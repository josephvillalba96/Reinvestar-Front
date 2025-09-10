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
export const deactivateProcessorAssignment = async (params) => {
  const { processor_id, request_type, request_id, ...otherParams } = params;
  
  // Validaciones básicas
  if (!processor_id || isNaN(Number(processor_id))) {
    throw new Error('processor_id debe ser un número válido');
  }
  
  if (!request_type) {
    throw new Error('request_type es obligatorio');
  }
  
  if (!request_id || isNaN(Number(request_id))) {
    throw new Error('request_id debe ser un número válido');
  }
  
  // Crear el objeto de parámetros limpio para la query string
  const queryParams = {
    processor_id: Number(processor_id),
    request_type: request_type,
    request_id: Number(request_id)
  };
  
  // Agregar otros parámetros válidos si existen
  if (otherParams && Object.keys(otherParams).length > 0) {
    Object.assign(queryParams, otherParams);
  }
  
  // Usar el endpoint correcto para desactivar asignaciones
  const response = await api.put("/api/v1/processors/assignments/deactivate", null, { 
    params: queryParams 
  });
  return response.data;
};

// Obtener procesadores asignados a una solicitud específica
export const getProcessorsByRequest = async (params = {}) => {
  const response = await api.get("/api/v1/processors/assignments", { params });
  return response.data;
};

// Obtener detalles completos de un procesador (workload y asignaciones activas)
export const getProcessorDetails = async (processor_id) => {
  const response = await api.get(`/api/v1/processors/${processor_id}/details`);
  return response.data;
}; 