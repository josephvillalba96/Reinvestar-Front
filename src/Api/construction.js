import instance from './instance';
import axios from 'axios';

const getBaseURL = () => import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthParams = () => {
  const token = localStorage.getItem("token");
  return token ? { access_token: token } : {};
};

export const createConstruction = async (data) => {
  try {
    const token = localStorage.getItem("token");
    console.log('Token disponible:', !!token);
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    const params = { access_token: token };
    console.log('Enviando request con params:', params);
    
    const response = await axios.post(`${getBaseURL()}/api/v1/construction-requests/`, data, { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en createConstruction:', error);
    throw error;
  }
}

export const getConstructions = async (params = {}) => {
  try {
    const authParams = getAuthParams();
    const allParams = { ...params, ...authParams };
    const response = await axios.get(`${getBaseURL()}/api/v1/construction-requests/`, { params: allParams });
    return response.data;
  } catch (error) {
    console.error('Error en getConstructions:', error);
    throw error;
  }
}

export const getConstructionById = async (construction_id) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.get(`${getBaseURL()}/api/v1/construction-requests/${construction_id}`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en getConstructionById:', error);
    throw error;
  }
}   

export const updateConstruction = async (construction_id, data) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    const params = { access_token: token };
    const response = await axios.put(`${getBaseURL()}/api/v1/construction-requests/${construction_id}`, data, { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en updateConstruction:', error);
    throw error;
  }
}   

export const deleteConstruction = async (construction_id) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.delete(`${getBaseURL()}/api/v1/construction-requests/${construction_id}`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en deleteConstruction:', error);
    throw error;
  }
}

export const getConstructionStatus = async (construction_id) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.get(`${getBaseURL()}/api/v1/construction-requests/${construction_id}/status`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en getConstructionStatus:', error);
    throw error;
  }
}

export const getConstructionByRegisterCode = async (construction_code) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.get(`${getBaseURL()}/api/v1/construction-requests/by-uuid/${construction_code}`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en getConstructionByRegisterCode:', error);
    throw error;
  }
}