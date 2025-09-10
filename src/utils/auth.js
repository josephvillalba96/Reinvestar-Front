// Utilidades para manejar la autenticación y obtener información del usuario

// Función para decodificar el token JWT y obtener el payload
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    // El token JWT tiene 3 partes separadas por puntos
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // La segunda parte es el payload (datos del usuario)
    const payload = parts[1];
    
    // Decodificar de base64
    const decodedPayload = atob(payload);
    
    // Parsear el JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

// Función para obtener el ID del usuario del token almacenado
export const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decoded = decodeToken(token);
    return decoded?.user_id || decoded?.sub || null;
  } catch (error) {
    console.error('Error obteniendo ID del usuario:', error);
    return null;
  }
};

// Función para obtener información completa del usuario del token
export const getUserFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    return decodeToken(token);
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    return null;
  }
};

// Función para verificar si el token está expirado
export const isTokenExpired = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;
    
    // exp está en segundos, Date.now() está en milisegundos
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error verificando expiración del token:', error);
    return true;
  }
};

// Función para limpiar el token si está expirado
export const cleanExpiredToken = () => {
  if (isTokenExpired()) {
    localStorage.removeItem('token');
    return true;
  }
  return false;
};
