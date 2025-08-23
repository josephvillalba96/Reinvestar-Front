import React from 'react';

// Sistema de notificaciones simple con Bootstrap 5
class NotificationManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Crear contenedor de notificaciones si no existe
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'bootstrap-notifications';
      this.container.className = 'position-fixed top-0 end-0 p-3';
      this.container.style.cssText = 'z-index: 9999; max-width: 400px;';
      document.body.appendChild(this.container);
    }
  }

  // Crear notificación
  createNotification(message, title, type, duration = 3000) {
    const notificationId = `notification-${Date.now()}-${Math.random()}`;
    
    // Clases de Bootstrap según el tipo
    const alertClass = this.getAlertClass(type);
    const icon = this.getIcon(type);

    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = `alert ${alertClass} alert-dismissible fade show`;
    notification.style.cssText = 'margin-bottom: 10px;';
    
    notification.innerHTML = `
      <div class="d-flex align-items-start">
        <div class="me-2" style="font-size: 1.2rem;">${icon}</div>
        <div class="flex-grow-1">
          ${title ? `<h6 class="alert-heading mb-1 fw-bold">${title}</h6>` : ''}
          <div class="mb-0">${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;

    // Agregar al contenedor
    this.container.appendChild(notification);
    
    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, duration);

    return notificationId;
  }

  // Obtener clase de alerta según el tipo
  getAlertClass(type) {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-primary';
    }
  }

  // Obtener icono según el tipo
  getIcon(type) {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '💬';
    }
  }

  // Remover notificación específica
  removeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
      notification.remove();
    }
  }

  // Limpiar todas las notificaciones
  clearAll() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  // Mostrar notificación de éxito
  showSuccess(message, title = null, duration = 3000) {
    return this.createNotification(message, title, 'success', duration);
  }

  // Mostrar notificación de error
  showError(message, title = null, duration = 4000) {
    return this.createNotification(message, title, 'error', duration);
  }

  // Mostrar notificación de información
  showInfo(message, title = null, duration = 3000) {
    return this.createNotification(message, title, 'info', duration);
  }

  // Mostrar notificación de advertencia
  showWarning(message, title = null, duration = 3500) {
    return this.createNotification(message, title, 'warning', duration);
  }

  // Mostrar notificación de carga
  showLoading(message = "Procesando...", title = null) {
    const notificationId = `loading-${Date.now()}`;
    
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = 'alert alert-secondary alert-dismissible fade show';
    notification.style.cssText = 'margin-bottom: 10px;';
    
    notification.innerHTML = `
      <div class="d-flex align-items-start">
        <div class="me-2">
          <div class="spinner-border spinner-border-sm text-secondary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        <div class="flex-grow-1">
          ${title ? `<h6 class="alert-heading mb-1 fw-bold">${title}</h6>` : ''}
          <div class="mb-0">${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;

    this.container.appendChild(notification);
    
    return notificationId;
  }

  // Actualizar notificación de carga a éxito
  updateLoadingToSuccess(loadingId, message, title = null, duration = 3000) {
    this.removeNotification(loadingId);
    return this.showSuccess(message, title, duration);
  }

  // Actualizar notificación de carga a error
  updateLoadingToError(loadingId, message, title = null, duration = 4000) {
    this.removeNotification(loadingId);
    return this.showError(message, title, duration);
  }
}

// Instancia global del gestor de notificaciones
const notificationManager = new NotificationManager();

// Exportar funciones para uso en componentes
export const showSuccess = (message, title = null, duration = 3000) => {
  return notificationManager.showSuccess(message, title, duration);
};

export const showError = (message, title = null, duration = 4000) => {
  return notificationManager.showError(message, title, duration);
};

export const showInfo = (message, title = null, duration = 3000) => {
  return notificationManager.showInfo(message, title, duration);
};

export const showWarning = (message, title = null, duration = 3500) => {
  return notificationManager.showWarning(message, title, duration);
};

export const showLoading = (message = "Procesando...", title = null) => {
  return notificationManager.showLoading(message, title);
};

export const updateLoadingToSuccess = (loadingId, message, title = null, duration = 3000) => {
  return notificationManager.updateLoadingToSuccess(loadingId, message, title, duration);
};

export const updateLoadingToError = (loadingId, message, title = null, duration = 4000) => {
  return notificationManager.updateLoadingToError(loadingId, message, title, duration);
};

export const clearNotifications = () => {
  notificationManager.clearAll();
};

// Notificaciones específicas para casos de uso comunes
export const showRequestCreated = (requestType, requestId) => {
  return showSuccess(
    `Solicitud ${requestType} creada exitosamente con ID: ${requestId}`,
    "¡Solicitud Creada!"
  );
};

export const showClientCreated = (clientName) => {
  return showSuccess(
    `Cliente "${clientName}" registrado exitosamente`,
    "¡Cliente Creado!"
  );
};

export const showUpdated = (itemType, itemName) => {
  return showSuccess(
    `${itemType} "${itemName}" actualizado exitosamente`,
    "¡Actualización Exitosa!"
  );
};

export const showDeleted = (itemType, itemName) => {
  return showInfo(
    `${itemType} "${itemName}" eliminado exitosamente`,
    "¡Eliminación Completada!"
  );
};

export default notificationManager;
