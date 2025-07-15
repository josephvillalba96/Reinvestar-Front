import instance from './instance';


export const createConstruction = async (data) => {
  const response = await instance.post('/api/v1/construction-request/', data);
  return response.data;
}

export const getConstructions = async (params = {}) => {
  const response = await instance.get('/api/v1/construction-request/', { params });
  return response.data;
}

export const getConstructionById = async (construction_id) => {
  const response = await instance.get(`/api/v1/construction-request/${construction_id}`);
  return response.data;
}   

export const updateConstruction = async (construction_id, data) => {
  const response = await instance.put(`/api/v1/construction-request/${construction_id}`, data);
  return response.data;
}   

export const deleteConstruction = async (construction_id) => {
  const response = await instance.delete(`/api/v1/construction-request/${construction_id}`);
  return response.data;
}

export const getConstructionStatus = async (construction_id) => {
  const response = await instance.get(`/api/v1/construction-requests/${construction_id}/status`);
  return response.data;
}

export const getConstructionByRegisterCode = async (construction_code) => {
  const response = await instance.get(`/api/v1/construction-requests/by-uuid/${construction_code}`);
  return response.data;
}