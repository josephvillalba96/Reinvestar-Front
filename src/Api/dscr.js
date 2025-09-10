import instance from './instance';
import axios from 'axios';

const getBaseURL = () => import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthParams = () => {
  const token = localStorage.getItem("token");
  return token ? { access_token: token } : {};
};

export const createDscr = async (data) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    const params = { access_token: token };
    const response = await axios.post(`${getBaseURL()}/api/v1/dscr-requests/`, data, { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en createDscr:', error);
    throw error;
  }
}

export const getDscrs = async (params = {}) => {
  try {
    const authParams = getAuthParams();
    const allParams = { ...params, ...authParams };
    const response = await axios.get(`${getBaseURL()}/api/v1/dscr-requests/`, { params: allParams });
    return response.data;
  } catch (error) {
    console.error('Error en getDscrs:', error);
    throw error;
  }
}

export const getDscrById = async (dscr_id) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.get(`${getBaseURL()}/api/v1/dscr-requests/${dscr_id}`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en getDscrById:', error);
    throw error;
  }
}

export const updateDscr = async (dscr_id, data) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    const params = { access_token: token };
    const response = await axios.put(`${getBaseURL()}/api/v1/dscr-requests/${dscr_id}`, data, { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en updateDscr:', error);
    throw error;
  }
}

export const deleteDscr = async (dscr_id) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.delete(`${getBaseURL()}/api/v1/dscr-requests/${dscr_id}`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en deleteDscr:', error);
    throw error;
  }
}

export const getDscrStatus = async (dscr_id) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.get(`${getBaseURL()}/api/v1/dscr-requests/${dscr_id}/status`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en getDscrStatus:', error);
    throw error;
  }
}

export const getDscrByRegisterCode = async (dscr_code) => {
  try {
    const authParams = getAuthParams();
    const response = await axios.get(`${getBaseURL()}/api/v1/dscr-requests/by-uuid/${dscr_code}`, { params: authParams });
    return response.data;
  } catch (error) {
    console.error('Error en getDscrByRegisterCode:', error);
    throw error;
  }
}


