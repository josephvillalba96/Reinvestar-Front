import api from "./instance";

// Empresas
export const createCompany = async (data) => {
  const response = await api.post("/api/v1/admin/companies/", data);
  return response.data;
};

export const getCompanies = async (params = {}) => {
  const response = await api.get("/api/v1/admin/companies/", { params });
  return response.data;
};

export const getCompanyById = async (company_id) => {
  const response = await api.get(`/api/v1/admin/companies/${company_id}`);
  return response.data;
};

export const updateCompany = async (company_id, data) => {
  const response = await api.put(`/api/v1/admin/companies/${company_id}`, data);
  return response.data;
};

export const deleteCompany = async (company_id) => {
  const response = await api.delete(`/api/v1/admin/companies/${company_id}`);
  return response.data;
};

// Asignar usuario a empresa
export const assignUserToCompany = async (user_id, company_id) => {
  const response = await api.put(`/api/v1/admin/users/${user_id}/company`, null, { params: { company_id } });
  return response.data;
};

// Actualizar roles de usuario
export const updateUserRoles = async (user_id, roles) => {
  const response = await api.put(`/api/v1/admin/users/${user_id}/roles`, roles);
  return response.data;
};

// Obtener todos los roles
export const getAllRoles = async () => {
  const response = await api.get("/api/v1/admin/roles/");
  return response.data;
};

// CRUD de Admins
export const getAdmins = async (params = {}) => {
  const response = await api.get("/api/v1/admin/admins", { params });
  return response.data;
};

export const createAdmin = async (data) => {
  const response = await api.post("/api/v1/admin/admins", data);
  return response.data;
};

export const getAdminById = async (admin_id) => {
  const response = await api.get(`/api/v1/admin/admins/${admin_id}`);
  return response.data;
};

export const updateAdmin = async (admin_id, data) => {
  const response = await api.put(`/api/v1/admin/admins/${admin_id}`, data);
  return response.data;
};

export const deleteAdmin = async (admin_id) => {
  const response = await api.delete(`/api/v1/admin/admins/${admin_id}`);
  return response.data;
}; 