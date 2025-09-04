import React, { useState, useEffect } from "react";
import styles from "../FormRequest/style.module.css";
import { 
  getProcessors, 
  getProcessorsByRequest,
  assignProcessor, 
  deactivateProcessorAssignment,
  getProcessorWorkload 
} from "../../../../../Api/procesor";

const ProcessorForm = ({ requestId, requestType, onDataNeedsRefresh }) => {
  const [processors, setProcessors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedProcessor, setSelectedProcessor] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [workloadData, setWorkloadData] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);

  useEffect(() => {
    console.log('useEffect ejecutado con:', { requestId, requestType });
    
    // Limpiar el estado antes de cargar nuevos datos
    setAssignments([]);
    setProcessors([]);
    setSelectedProcessor("");
    setFeedback("");
    setWorkloadData(null);
    setShowAssignForm(false);
    
    // Solo cargar datos si tenemos requestId y requestType válidos
    if (requestId && requestType) {
      console.log('Cargando datos para solicitud:', { requestId, requestType });
      
      // Cargar datos inmediatamente
      const loadData = async () => {
        try {
          await Promise.all([loadProcessors(), loadAssignments()]);
        } catch (error) {
          console.error('Error cargando datos:', error);
          setAssignments([]);
          setProcessors([]);
        }
      };
      
      loadData();
    } else {
      console.log('Faltan parámetros para cargar datos:', { requestId, requestType });
    }
  }, [requestId, requestType]);

  const loadProcessors = async () => {
    try {
      const data = await getProcessors({ skip: 0, limit: 100 });
      
      // Manejar la estructura de datos de procesadores
      let processors = [];
      if (Array.isArray(data)) {
        processors = data;
      } else if (data && Array.isArray(data.items)) {
        processors = data.items;
      } else if (data && Array.isArray(data.results)) {
        processors = data.results;
      }
      
      setProcessors(processors);
    } catch (error) {
      console.error('Error cargando procesadores:', error);
      setProcessors([]);
    }
  };

  const loadAssignments = async () => {
    try {
      if (!requestId || !requestType) {
        console.log('Faltan parámetros para cargar asignaciones:', { requestId, requestType });
        setAssignments([]);
        return;
      }

      const params = {};
      
      // Agregar el ID de solicitud correspondiente según el tipo
      switch (requestType) {
        case "dscr":
          params.dscr_request_id = parseInt(requestId);
          break;
        case "fixflip":
          params.fixflip_request_id = parseInt(requestId);
          break;
        case "construction":
          params.construction_request_id = parseInt(requestId);
          break;
        default:
          console.error('Tipo de solicitud no válido:', requestType);
          setAssignments([]);
          return;
      }
      
      console.log('Cargando asignaciones para:', { requestId, requestType, params });
      const data = await getProcessorsByRequest(params);
      console.log('Datos de asignaciones recibidos:', data);
      
      // Asegurar que data sea un array
      let assignmentsData = [];
      if (Array.isArray(data)) {
        assignmentsData = data;
      } else if (data && Array.isArray(data.items)) {
        assignmentsData = data.items;
      } else if (data && Array.isArray(data.results)) {
        assignmentsData = data.results;
      } else {
        assignmentsData = [];
      }

      // Filtrar asignaciones para asegurar que solo se muestren las que corresponden a esta solicitud
      // y que estén activas
      assignmentsData = assignmentsData.filter(assignment => {
        // Verificar que la asignación tenga los datos necesarios
        if (!assignment) {
          return false;
        }

        // Verificar que el ID de la solicitud coincida según el tipo
        let matchesRequest = false;
        switch (requestType) {
          case "dscr":
            matchesRequest = parseInt(assignment.dscr_request_id) === parseInt(requestId);
            break;
          case "fixflip":
            matchesRequest = parseInt(assignment.fixflip_request_id) === parseInt(requestId);
            break;
          case "construction":
            matchesRequest = parseInt(assignment.construction_request_id) === parseInt(requestId);
            break;
        }

        // Solo mostrar asignaciones que coincidan con la solicitud actual y estén activas
        return matchesRequest && assignment.is_active;
      });
      
      console.log('Asignaciones filtradas:', assignmentsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
      setAssignments([]);
    }
  };

  const handleAssignProcessor = async () => {
    if (!selectedProcessor) {
      setFeedback("Debes seleccionar un procesador");
      return;
    }

    setLoading(true);
    setFeedback("");
    try {
      const assignmentData = {
        processor_id: Number(selectedProcessor),
        active: true
      };

      switch (requestType) {
        case "dscr":
          assignmentData.dscr_request_id = parseInt(requestId);
          break;
        case "fixflip":
          assignmentData.fixflip_request_id = parseInt(requestId);
          break;
        case "construction":
          assignmentData.construction_request_id = parseInt(requestId);
          break;
        default:
          throw new Error("Tipo de solicitud no válido");
      }

      await assignProcessor(assignmentData);
      setFeedback("Procesador asignado exitosamente");
      setSelectedProcessor("");
      setShowAssignForm(false);
      loadAssignments();
      
      // Llamar a la función de refresco del padre
      if (onDataNeedsRefresh) {
        onDataNeedsRefresh();
      }
      
      // Cargar información de carga de trabajo del procesador seleccionado
      try {
        const workload = await getProcessorWorkload();
        const processorData = workload?.items?.find(item => item.processor.id === Number(selectedProcessor));
        if (processorData) {
          setWorkloadData({
            processor_id: processorData.processor.id,
            ...processorData.workload,
            active_assignments: processorData.active_assignments
          });
        }
      } catch (workloadError) {
        console.error('Error cargando carga de trabajo:', workloadError);
        // No mostrar error al usuario ya que la asignación fue exitosa
      }
    } catch (error) {
      console.error('Error asignando procesador:', error);
      setFeedback(error.response?.data?.detail || "Error al asignar el procesador");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAssignment = async (assignment) => {
    if (!window.confirm("¿Estás seguro de que quieres desasignar este procesador?")) {
      return;
    }

    setLoading(true);
    try {
      // Usar processor_id del assignment o del objeto processor anidado
      const processorId = assignment.processor_id || assignment.processor?.id;
      
      if (!processorId) {
        throw new Error('No se pudo obtener el ID del procesador');
      }
      
      // Solo enviar los parámetros necesarios sin duplicación
      const params = {
        processor_id: Number(processorId),
        request_type: requestType,
        request_id: parseInt(requestId)
      };

      await deactivateProcessorAssignment(params);
      setFeedback("Procesador desasignado exitosamente");
      loadAssignments();
      setWorkloadData(null);

      // Llamar a la función de refresco del padre
      if (onDataNeedsRefresh) {
        onDataNeedsRefresh();
      }
    } catch (error) {
      console.error('Error desasignando procesador:', error);
      setFeedback(error.response?.data?.detail || error.message || "Error al desasignar el procesador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <h4 className="my_title_color fw-bold mb-4">Procesadores de la Solicitud</h4>
        </div>
      </div>

      {/* Tabla de procesadores asignados */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Procesador</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Fecha de Asignación</th>
                  <th>Estado</th>
                  <th>Cliente</th>
                  <th>Asignado Por</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length > 0 ? (
                  assignments.map(assignment => (
                    <tr key={assignment.id}>
                      <td>{assignment.processor?.full_name || assignment.processor_name || 'N/A'}</td>
                      <td>{assignment.processor?.email || assignment.processor_email || 'N/A'}</td>
                      <td>{assignment.processor?.phone || assignment.processor_phone || '-'}</td>
                      <td>{new Date(assignment.assigned_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${assignment.status === "ASSIGNED" ? 'bg-success' : 'bg-secondary'}`}>
                          {assignment.status}
                        </span>
                        {assignment.is_active && (
                          <span className="badge bg-primary ms-1">Activo</span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {assignment.request?.client_name || assignment.client_name || 'N/A'}
                          <br />
                          <span className="badge bg-light text-dark">
                            ID: {assignment.request?.client_id || assignment.client_id || 'N/A'}
                          </span>
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">
                          {assignment.assigner_name || 'N/A'}
                        </small>
                      </td>
                      <td className="text-end">
                        {assignment.status === "ASSIGNED" && assignment.is_active && (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm px-3 me-2"
                              onClick={() => setShowAssignForm(true)}
                              disabled={loading}
                              style={{ borderRadius: '20px' }}
                            >
                              <i className="fas fa-exchange-alt me-1"></i>
                              Cambiar
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm px-3"
                              onClick={() => handleDeactivateAssignment(assignment)}
                              disabled={loading}
                              style={{ borderRadius: '20px' }}
                            >
                              <i className="fas fa-user-minus me-1"></i>
                              Desasignar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <p className="text-muted mb-2">No hay procesadores asignados a esta solicitud</p>
                      <button
                        type="button"
                        className={`btn ${styles.button} px-4`}
                        onClick={() => setShowAssignForm(true)}
                        disabled={loading}
                        style={{ borderRadius: '30px' }}
                      >
                        <i className="fas fa-user-plus me-2"></i>
                        Asignar Procesador
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botón de asignación cuando no hay procesadores activos */}
      {!assignments.some(a => a.status === "ASSIGNED" && a.is_active) && assignments.length > 0 && (
        <div className="row mb-4">
          <div className="col-12 text-center">
            <div className="alert alert-warning">
              <p className="mb-2">No hay procesadores activos asignados a esta solicitud</p>
              <button
                type="button"
                className={`btn ${styles.button} px-4`}
                onClick={() => setShowAssignForm(true)}
                disabled={loading}
                style={{ borderRadius: '30px' }}
              >
                <i className="fas fa-user-plus me-2"></i>
                Asignar Procesador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de asignación */}
      {showAssignForm && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">
                    {assignments.some(a => a.status === "ASSIGNED" && a.is_active) ? "Cambiar Procesador" : "Asignar Procesador"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setSelectedProcessor("");
                      setShowAssignForm(false);
                    }}
                    disabled={loading}
                  />
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex flex-column">
                      <label className="form-label text-muted small mb-2">Seleccionar Procesador</label>
                      <select
                        className={styles.input}
                        value={selectedProcessor}
                        onChange={(e) => setSelectedProcessor(e.target.value)}
                      >
                        <option value="">Seleccione un procesador</option>
                        {processors.map((processor) => (
                          <option key={processor.id} value={processor.id}>
                            {processor.full_name} - {processor.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-12 d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() => {
                        setSelectedProcessor("");
                        setShowAssignForm(false);
                      }}
                      disabled={loading}
                      style={{ minWidth: '120px', borderRadius: '30px' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={`btn ${styles.button} px-4`}
                      onClick={handleAssignProcessor}
                      disabled={loading || !selectedProcessor}
                      style={{ minWidth: '120px' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Asignando...
                        </>
                      ) : (
                        "Asignar"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de carga de trabajo */}
      {workloadData && (
        <div className="row">
          <div className="col-12">
            <h5 className="mb-3">Carga de Trabajo del Procesador</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Información General</h6>
                    <p className="mb-1"><strong>Asignaciones Activas:</strong> {workloadData.active_assignments_count || 0}</p>
                    <p className="mb-0"><strong>Total de Solicitudes:</strong> {workloadData.total_requests || 0}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Estado de Solicitudes</h6>
                    <p className="mb-1"><strong>Pendientes:</strong> {workloadData.pending_requests || 0}</p>
                    <p className="mb-1"><strong>En Progreso:</strong> {workloadData.in_progress_requests || 0}</p>
                    <p className="mb-0"><strong>Completadas:</strong> {workloadData.completed_requests || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de feedback */}
      {feedback && (
        <div className={`alert ${feedback.includes("exitosamente") ? "alert-success" : "alert-danger"} mt-3`}>
          {feedback}
        </div>
      )}
    </div>
  );
};

export default ProcessorForm; 