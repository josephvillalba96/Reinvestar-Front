import api from "./instance";

// Crear una nueva carta de intención
export const createIntentLetter = async (data) => {
  // data debe cumplir el esquema IntentLetterCreate en backend
  const response = await api.post("/api/v1/intent-letters/", data);
  return response.data;
};

// Obtener cartas de intención con filtros (por tipo/solicitud y paginación)
export const getIntentLetters = async (params = {}) => {
  // Soporte de compatibilidad: mapear filtros antiguos a la nueva API { tipo, request_id }
  const remapped = { ...params };
  if (params?.dscr_request_id != null && Number(params.dscr_request_id) > 0) {
    remapped.tipo = "dscr";
    remapped.request_id = Number(params.dscr_request_id);
    delete remapped.dscr_request_id;
    delete remapped.fixflip_request_id;
    delete remapped.construction_request_id;
  } else if (params?.fixflip_request_id != null && Number(params.fixflip_request_id) > 0) {
    remapped.tipo = "fixflip";
    remapped.request_id = Number(params.fixflip_request_id);
    delete remapped.dscr_request_id;
    delete remapped.fixflip_request_id;
    delete remapped.construction_request_id;
  } else if (params?.construction_request_id != null && Number(params.construction_request_id) > 0) {
    remapped.tipo = "construction";
    remapped.request_id = Number(params.construction_request_id);
    delete remapped.dscr_request_id;
    delete remapped.fixflip_request_id;
    delete remapped.construction_request_id;
  }

  const response = await api.get("/api/v1/intent-letters/", { params: remapped });
  return response.data;
};

// Subir archivo asociado a una carta de intención (multipart/form-data)
// Puedes pasar directamente un File o un FormData ya preparado
export const uploadIntentLetterFile = async (intent_letter_id, fileOrFormData) => {
  let formData;
  if (fileOrFormData instanceof FormData) {
    formData = fileOrFormData;
  } else {
    formData = new FormData();
    formData.append("file", fileOrFormData);
  }
  const response = await api.post(
    `/api/v1/intent-letters/${intent_letter_id}/upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

// Obtener carta de intención por ID
export const getIntentLetterById = async (intent_letter_id) => {
  const response = await api.get(`/api/v1/intent-letters/${intent_letter_id}`);
  return response.data;
};

// Actualizar carta de intención (PUT /api/v1/intent-letters/{intent_letter_id})
export const updateIntentLetter = async (intent_letter_id, data) => {
  const response = await api.put(`/api/v1/intent-letters/${intent_letter_id}`, data);
  return response.data;
};

// Eliminar carta de intención
export const deleteIntentLetter = async (intent_letter_id) => {
  const response = await api.delete(`/api/v1/intent-letters/${intent_letter_id}`);
  return response.data;
};

// Actualizar estado (aprobación) de una carta de intención
export const updateIntentLetterStatus = async (intent_letter_id, status) => {
  const response = await api.put(
    `/api/v1/intent-letters/${intent_letter_id}/status`,
    null,
    { params: { status } }
  );
  return response.data;
};

// Obtener cartas de intención por solicitud específica (GET /api/v1/intent-letters/by-request/{tipo}/{request_id})
export const getIntentLettersByRequest = async (tipo, request_id) => {
  const response = await api.get(`/api/v1/intent-letters/by-request/${tipo}/${Number(request_id)}`);
  return response.data;
};


