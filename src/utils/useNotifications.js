import { useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

// Hook personalizado para manejar notificaciones
export const useNotifications = () => {
  const activeToasts = useRef(new Set());

  // Función para limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    activeToasts.current.forEach(toastId => {
      toast.dismiss(toastId);
    });
    activeToasts.current.clear();
  }, []);

  // Función para limpiar notificaciones específicas
  const clearToast = useCallback((toastId) => {
    if (activeToasts.current.has(toastId)) {
      toast.dismiss(toastId);
      activeToasts.current.delete(toastId);
    }
  }, []);

  // Función para mostrar notificación de éxito
  const showSuccess = useCallback((message, title = null) => {
    // Limpiar notificaciones existentes
    clearAll();
    
    const content = title ? (
      <div>
        <div className="fw-bold">{title}</div>
        <div className="small">{message}</div>
      </div>
    ) : message;

    const toastId = toast.success(content, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      newestOnTop: true,
      limit: 1,
      icon: "✅",
      className: "custom-success-toast",
    });

    activeToasts.current.add(toastId);
    
    // Limpiar automáticamente después de 2 segundos
    setTimeout(() => {
      clearToast(toastId);
    }, 2000);

    return toastId;
  }, [clearAll, clearToast]);

  // Función para mostrar notificación de error
  const showError = useCallback((message, title = null) => {
    // Limpiar notificaciones existentes
    clearAll();
    
    const content = title ? (
      <div>
        <div className="fw-bold">{title}</div>
        <div className="small">{message}</div>
      </div>
    ) : message;

    const toastId = toast.error(content, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      newestOnTop: true,
      limit: 1,
      icon: "❌",
      className: "custom-error-toast",
    });

    activeToasts.current.add(toastId);
    
    // Limpiar automáticamente después de 2 segundos
    setTimeout(() => {
      clearToast(toastId);
    }, 2000);

    return toastId;
  }, [clearAll, clearToast]);

  // Función para mostrar notificación de información
  const showInfo = useCallback((message, title = null) => {
    // Limpiar notificaciones existentes
    clearAll();
    
    const content = title ? (
      <div>
        <div className="fw-bold">{title}</div>
        <div className="small">{message}</div>
      </div>
    ) : message;

    const toastId = toast.info(content, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      newestOnTop: true,
      limit: 1,
      icon: "ℹ️",
      className: "custom-info-toast",
    });

    activeToasts.current.add(toastId);
    
    // Limpiar automáticamente después de 2 segundos
    setTimeout(() => {
      clearToast(toastId);
    }, 2000);

    return toastId;
  }, [clearAll, clearToast]);

  // Función para mostrar notificación de carga
  const showLoading = useCallback((message = "Procesando...") => {
    // Limpiar notificaciones existentes
    clearAll();
    
    const toastId = toast.loading(message, {
      position: "top-right",
      autoClose: 2000,
      closeOnClick: true,
      draggable: true,
      newestOnTop: true,
      limit: 1,
    });

    activeToasts.current.add(toastId);
    
    // Limpiar automáticamente después de 2 segundos
    setTimeout(() => {
      clearToast(toastId);
    }, 2000);

    return toastId;
  }, [clearAll, clearToast]);

  // Función para actualizar notificación de carga a éxito
  const updateLoadingToSuccess = useCallback((toastId, message, title = null) => {
    if (activeToasts.current.has(toastId)) {
      const content = title ? (
        <div>
          <div className="fw-bold">{title}</div>
          <div className="small">{message}</div>
        </div>
      ) : message;

      toast.update(toastId, {
        render: content,
        type: "success",
        isLoading: false,
        autoClose: 2000,
        icon: "✅",
        className: "custom-success-toast",
      });

      // Limpiar automáticamente después de 2 segundos
      setTimeout(() => {
        clearToast(toastId);
      }, 2000);
    }
  }, [clearToast]);

  // Función para actualizar notificación de carga a error
  const updateLoadingToError = useCallback((toastId, message, title = null) => {
    if (activeToasts.current.has(toastId)) {
      const content = title ? (
        <div>
          <div className="fw-bold">{title}</div>
          <div className="small">{message}</div>
        </div>
      ) : message;

      toast.update(toastId, {
        render: content,
        type: "error",
        isLoading: false,
        autoClose: 2000,
        icon: "❌",
        className: "custom-error-toast",
      });

      // Limpiar automáticamente después de 2 segundos
      setTimeout(() => {
        clearToast(toastId);
      }, 2000);
    }
  }, [clearToast]);

  return {
    showSuccess,
    showError,
    showInfo,
    showLoading,
    updateLoadingToSuccess,
    updateLoadingToError,
    clearAll,
    clearToast,
  };
};
