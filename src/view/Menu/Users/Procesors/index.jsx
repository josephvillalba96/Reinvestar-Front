import FilterIcon from "../../../../assets/filter.svg";
import LoupeIcon from "../../../../assets/Loupe.svg";
import Eye from "../../../../assets/eye.svg"; 
import BookCheck from "../../../../assets/book-check.svg"; 
import styles from "./style.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../../components/Pagination";
import { getProcessors } from "../../../../Api/procesor";

const Procesors = () => {
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [processors, setProcessors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [selectedWorkload, setSelectedWorkload] = useState(null);
  const navegate = useNavigate();

  const handleRedirect = (id) => {
    navegate(`/process/${id}/details`)
  }

  const fetchProcessors = async (page = 1, searchValue = "", estadoValue = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        skip: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
      };
      if (searchValue) params.search = searchValue;
      // Habilitar filtro de estado
      if (estadoValue && estadoValue !== "") {
        params.is_active = estadoValue === "Activo" ? true : false;
      }
      const data = await getProcessors(params);
      
      // Manejar la nueva estructura de datos
      if (Array.isArray(data)) {
        // Si data es directamente un array de procesadores
        setProcessors(data);
        setTotal(data.length);
      } else if (data && Array.isArray(data.items)) {
        // Si data tiene la estructura { items: [], total: number }
        setProcessors(data.items);
        setTotal(data.total || data.items.length);
      } else {
        setProcessors([]);
        setTotal(0);
      }
    } catch (err) {
      setError("Error al cargar los procesadores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessors(currentPage, search, estado);
    // eslint-disable-next-line
  }, [currentPage, search, estado]);

  const handleRedired = () => {
    navegate("/process/new-process");
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProcessors(1, search, estado);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleEstadoChange = (e) => {
    setEstado(e.target.value);
    setCurrentPage(1);
  };

  const handleShowWorkload = (processor) => {
    // Por ahora, mostrar información básica del procesador
    // En el futuro, se podría hacer una llamada API para obtener el workload específico
    setSelectedWorkload({
      ...processor,
      active_assignments_count: 0, // Placeholder - se debería obtener de la API
      pending_requests: 0,
      in_progress_requests: 0,
      completed_requests: 0,
      active_assignments: []
    });
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div
      className={`${"d-flex flex-column"} internal_layout`}
      style={{ backgroundColor: "#fff" }}
    >
      <div className="d-flex flex-column align-items-start w-100 mb-4 px-4 mt-5">
        <p className="mb-4 fs-2 fw-bolder my_title_color">
          Procesadores
        </p>
      </div>
      <div className="d-flex justify-content-between w-100 mb-4 px-4">
        <div>
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleRedired}
          >
            <i className={`bi bi-plus-lg ${styles.icon}`}></i>
            <span className={`${styles.text} my_title_color`}>
              Crear Procesador
            </span>
          </button>
        </div>
        <div className={`${"d-flex gap-3"}`}>
          <button className="btn d-flex align-items-center">
            <img src={FilterIcon} alt="filter" width={18} />
          </button>
          <select className="form-select my_title_color" name="Estado" value={estado} onChange={handleEstadoChange}>
            <option value="">Estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <div className="input-group">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar" 
              value={search} 
              onChange={handleSearchChange} 
            />
            <button className="btn btn-primary" type="button" onClick={handleSearch}>
              <img src={LoupeIcon} alt="" width={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de procesadores */}
      <div
        className={`${"w-100 px-4 mb-3"} table_height`}
      >
        {loading ? (
          <div className="text-center py-5">Cargando procesadores...</div>
        ) : error ? (
          <div className="text-danger text-center py-5">{error}</div>
        ) : (
        <table className="table table-bordered table-hover">
          <thead className="sticky-top">
            <tr>
              <th style={{ color: "#1B2559" }}>ID</th>
              <th style={{ color: "#1B2559" }}>Nombre Completo</th>
              <th style={{ color: "#1B2559" }}>Email</th>
              <th style={{ color: "#1B2559" }}>Celular</th>
              <th style={{ color: "#1B2559" }}>Identificación</th>
              <th style={{ color: "#1B2559" }}>Estado</th>
              <th style={{ color: "#1B2559" }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
              {processors.length > 0 ? (
                processors.map((processor) => (
                  <tr key={processor.id}>
                    <td>{processor.id}</td>
                    <td>{processor.full_name}</td>
                    <td>{processor.email}</td>
                    <td>{processor.phone || '-'}</td>
                    <td>{processor.identification || '-'}</td>
                    <td>
                      <span className={`badge ${processor.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {processor.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                <td>
                  <button
                    className="btn btn-sm me-1"
                    style={{ backgroundColor: "#1B2559" }}
                        onClick={() => handleShowWorkload(processor)}
                        data-bs-toggle="modal"
                        data-bs-target="#workloadModal"
                  >
                    <img src={BookCheck} alt="check-data" width={15} />
                  </button>
                  <button
                        onClick={() => handleRedirect(processor.id)}
                    className="btn btn-sm"
                    style={{ backgroundColor: "#1B2559" }}
                  >
                    <img src={Eye} alt="detail-client" width={10}/>
                  </button>
                </td>
              </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center">No hay procesadores para mostrar</td>
                </tr>
              )}
          </tbody>
        </table>
        )}
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={Math.ceil(total / itemsPerPage) || 1} 
        handlePaginate={paginate}
      />

      {/* Modal de Workload */}
      <div className="modal fade" id="workloadModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Estadísticas de Carga de Trabajo</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedWorkload && (
                <div>
                  <div className="mb-4">
                    <h6 className="text-muted mb-3">Información del Procesador</h6>
                    <p className="mb-1"><strong>Nombre:</strong> {selectedWorkload.full_name}</p>
                    <p className="mb-1"><strong>Email:</strong> {selectedWorkload.email}</p>
                    <p className="mb-1"><strong>Estado:</strong> 
                      <span className={`badge ${selectedWorkload.is_active ? 'bg-success' : 'bg-secondary'} ms-2`}>
                        {selectedWorkload.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </p>
                    {selectedWorkload.phone && (
                      <p className="mb-1"><strong>Teléfono:</strong> {selectedWorkload.phone}</p>
                    )}
                    {selectedWorkload.identification && (
                      <p className="mb-1"><strong>Identificación:</strong> {selectedWorkload.identification}</p>
                    )}
                    {selectedWorkload.address && (
                      <p className="mb-1"><strong>Dirección:</strong> {selectedWorkload.address}</p>
                    )}
                  </div>
                  
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Nota:</strong> Los datos de carga de trabajo se cargarán próximamente desde el backend.
                  </div>
                  
                  <h6 className="text-muted mb-3">Métricas de Trabajo</h6>
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="p-3 border rounded bg-light">
                        <div className="small text-muted">Asignaciones Activas</div>
                        <div className="h3 mb-0 text-primary">{selectedWorkload.active_assignments_count || 0}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded bg-light">
                        <div className="small text-muted">Solicitudes Pendientes</div>
                        <div className="h3 mb-0 text-warning">{selectedWorkload.pending_requests || 0}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded bg-light">
                        <div className="small text-muted">En Progreso</div>
                        <div className="h3 mb-0 text-info">{selectedWorkload.in_progress_requests || 0}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded bg-light">
                        <div className="small text-muted">Completadas</div>
                        <div className="h3 mb-0 text-success">{selectedWorkload.completed_requests || 0}</div>
                      </div>
                    </div>
                  </div>

                  {selectedWorkload.active_assignments && selectedWorkload.active_assignments.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-muted mb-3">Asignaciones Activas</h6>
                      <div className="list-group">
                        {selectedWorkload.active_assignments.map((assignment) => (
                          <div key={assignment.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="badge bg-primary">{assignment.request_type}</span>
                              <small className="text-muted">
                                {new Date(assignment.assigned_at).toLocaleDateString()}
                              </small>
                            </div>
                            <p className="mb-1"><strong>Cliente:</strong> {assignment.client_name}</p>
                            <p className="mb-0">
                              <span className={`badge ${assignment.request_status === 'PENDING' ? 'bg-warning' : 'bg-info'}`}>
                                {assignment.request_status}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Procesors;
