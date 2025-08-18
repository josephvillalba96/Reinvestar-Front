import api from "./instance";

// Genera y descarga el documento (PDF) para una solicitud dada
export const generateDocument = async (tipo, request_id) => {
	const response = await api.get(`/api/v1/document-generation/generate/${tipo}/${Number(request_id)}` , {
		responseType: 'blob'
	});
	return response.data; // Blob del PDF
};

// Obtiene la vista previa (HTML) del documento para una solicitud dada
export const previewDocument = async (tipo, request_id) => {
	const response = await api.get(`/api/v1/document-generation/preview/${tipo}/${Number(request_id)}` , {
		headers: { Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8' },
		responseType: 'text'
	});
	return response.data; // HTML como string
};


