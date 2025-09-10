import api from "./instance";

// Registro de usuario
export const register = async (data) => {
  const response = await api.post("/api/v1/auth/register", data);
  return response.data;
};

// Login de usuario
export const login = async (data) => {
  const response = await api.post("/api/v1/auth/login", data);
  return response.data;
};

// Solicitar recuperación de contraseña
export const forgotPassword = async (data) => {
  const response = await api.post("/api/v1/auth/forgot-password", data);
  return response.data;
};

// Resetear contraseña
export const resetPassword = async (data) => {
  const response = await api.post("/api/v1/auth/reset-password", data);
  return response.data;
}; 