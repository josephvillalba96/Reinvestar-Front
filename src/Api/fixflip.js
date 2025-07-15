import instance from './instance';


export const createFixflip = async (data) => {
  const response = await instance.post('/api/v1/fixflip-request/', data);
}

export const getFixflips = async (params = {}) => {
  const response = await instance.get('/api/v1/fixflip-request/', { params });
  return response.data;
}

export const getFixflipById = async (fixflip_id) => {
  const response = await instance.get(`/api/v1/fixflip-request/${fixflip_id}`);
  return response.data;
}

export const updateFixflip = async (fixflip_id, data) => {
  const response = await instance.put(`/api/v1/fixflip-request/${fixflip_id}`, data);
  return response.data;
}

export const deleteFixflip = async (fixflip_id) => {
  const response = await instance.delete(`/api/v1/fixflip-request/${fixflip_id}`);
  return response.data;
}

export const getFixflipStatus = async (fixflip_id) => {
  const response = await instance.get(`/api/v1/fixflip-requests/${fixflip_id}/status`);
  return response.data;
}

export const getFixflipByRegisterCode = async (fixflip_code) => {
  const response = await instance.get(`/api/v1/fixflip-requests/by-uuid/${fixflip_code}`);
  return response.data;
}

