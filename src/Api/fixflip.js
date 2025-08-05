import instance from './instance';
import axios from 'axios';

const getBaseURL = () => import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthParams = () => {
  const token = localStorage.getItem("token");
  return token ? { access_token: token } : {};
};

export const createFixflip = async (data) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    const params = { access_token: token };
    const response = await axios.post(`${getBaseURL()}/api/v1/fixflip-requests/`, data, { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en createFixflip:', error);
    throw error;
  }
}

export const getFixflips = async (params = {}) => {
  try {
    const authParams = getAuthParams();
    const allParams = { ...params, ...authParams };
    const response = await axios.get(`${getBaseURL()}/api/v1/fixflip-requests/`, { params: allParams });
    return response.data;
  } catch (error) {
    console.error('Error en getFixflips:', error);
    throw error;
  }
}

export const getFixflipById = async (fixflip_id) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.get(`${getBaseURL()}/api/v1/fixflip-requests/${fixflip_id}`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en getFixflipById:', error);
    throw error;
  }
}

export const updateFixflip = async (fixflip_id, data) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    const params = { access_token: token };
    const response = await axios.put(`${getBaseURL()}/api/v1/fixflip-requests/${fixflip_id}`, data, { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en updateFixflip:', error);
    throw error;
  }
}

export const deleteFixflip = async (fixflip_id) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.delete(`${getBaseURL()}/api/v1/fixflip-requests/${fixflip_id}`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en deleteFixflip:', error);
    throw error;
  }
}

export const getFixflipStatus = async (fixflip_id) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.get(`${getBaseURL()}/api/v1/fixflip-requests/${fixflip_id}/status`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en getFixflipStatus:', error);
    throw error;
  }
}

export const getFixflipByRegisterCode = async (fixflip_code) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.get(`${getBaseURL()}/api/v1/fixflip-requests/by-uuid/${fixflip_code}`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en getFixflipByRegisterCode:', error);
    throw error;
  }
}

