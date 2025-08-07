/**
 * Formatea el tamaño de un archivo en bytes a una cadena legible (B, KB, MB)
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado con unidad
 */
export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};