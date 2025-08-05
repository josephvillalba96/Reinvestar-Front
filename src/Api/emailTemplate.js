import api from "./instance";

// Obtener lista de plantillas de correo con filtros opcionales
export const getEmailTemplates = async (params = {}) => {
  const response = await api.get("/api/v1/email-templates/", { params });
  return response.data;
};

// Crear nueva plantilla de correo
export const createEmailTemplate = async (data) => {
  const response = await api.post("/api/v1/email-templates/", data);
  return response.data;
};

// Obtener plantilla de correo por ID
export const getEmailTemplateById = async (template_id) => {
  const response = await api.get(`/api/v1/email-templates/${template_id}`);
  return response.data;
};

// Actualizar plantilla de correo
export const updateEmailTemplate = async (template_id, data) => {
  const response = await api.put(`/api/v1/email-templates/${template_id}`, data);
  return response.data;
};

// Eliminar plantilla de correo
export const deleteEmailTemplate = async (template_id) => {
  const response = await api.delete(`/api/v1/email-templates/${template_id}`);
  return response.data;
};

// Enviar correo usando una plantilla específica
export const sendTemplateEmail = async (data) => {
  const response = await api.post("/api/v1/email-templates/send", data);
  return response.data;
};

// Generar preview de plantilla con variables aplicadas
export const previewTemplateEmail = async (data) => {
  const response = await api.post("/api/v1/email-templates/preview", data);
  return response.data;
};

// Obtener lista de tipos de plantillas disponibles
export const getAvailableTemplateTypes = async () => {
  const response = await api.get("/api/v1/email-templates/types/available");
  return response.data;
};

// Obtener plantilla por defecto de un tipo específico
export const getDefaultTemplateByType = async (template_type) => {
  const response = await api.get(`/api/v1/email-templates/default/${template_type}`);
  return response.data;
}; 