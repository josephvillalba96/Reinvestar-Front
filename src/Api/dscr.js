import instance from './instance';


export const createDscr = async (data) => {
  const response = await instance.post('/api/v1/dscr-requests/', data);
  return response.data;
}

export const getDscrs = async (params = {}) => {
  const response = await instance.get('/api/v1/dscr-requests/', { params });
  return response.data;
}

export const getDscrById = async (dscr_id) => {
  const response = await instance.get(`/api/v1/dscr-requests/${dscr_id}`);
  return response.data;
}

export const updateDscr = async (dscr_id, data) => {
  const response = await instance.put(`/api/v1/dscr-requests/${dscr_id}`, data);
  return response.data;
}

export const deleteDscr = async (dscr_id) => {
  const response = await instance.delete(`/api/v1/dscr-requests/${dscr_id}`);
  return response.data;
}

export const getDscrStatus = async (dscr_id) => {
  const response = await instance.get(`/api/v1/dscr-requests/${dscr_id}/status`);
  return response.data;
}

export const getDscrByRegisterCode = async (dscr_code) => {
  const response = await instance.get(`/api/v1/dscr-requests/by-uuid/${dscr_code}`);
  return response.data;
}


