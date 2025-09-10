import FilterIcon from "../../../assets/filter.svg";
import LoupeIcon from "../../../assets/Loupe.svg";
import Eye from "../../../assets/eye.svg";
import BookCheck from "../../../assets/book-check.svg";
import styles from "./style.module.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../../../components/Pagination";

import * as apiFixflip from "../../../Api/fixflip";
import * as apiDscr from "../../../Api/dscr";
import * as apiConstruction from "../../../Api/construction";
import * as apiSeller from "../../../Api/seller";
import { getProcessors, assignProcessor, getProcessorsByRequest } from "../../../Api/procesor";

const RequestLoan = () => {
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [requestType, setRequestType] = useState("dscr");
  const [requestsData, setRequestsData] = useState(null);
  const navegate = useNavigate();
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [processors, setProcessors] = useState([]);
  const [selectedProcessor, setSelectedProcessor] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assignRequest, setAssignRequest] = useState({ id: null, type: null });
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [existingAssignments, setExistingAssignments] = useState([]);

  // Nuevos estados para filtros
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el usuario actual
  const [currentUser, setCurrentUser] = useState(null);

  // Cargar usuario actual al inicio
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Cargar vendedores solo si el usuario es admin, coordinador o procesador
  useEffect(() => {
    if (currentUser && (currentUser.roles?.[0] === "Admin" || currentUser.roles?.[0] === "Coordinador" || currentUser.roles?.[0] === "Procesador")) {
      loadSellers();
    }
  }, [currentUser]);

  // Cargar solicitudes cuando cambien los filtros
  useEffect(() => {
    if (!requestType) return;
    
    const timeoutId = setTimeout(() => {
      handleRequests(requestType);
    }, 300); // Debounce de 300ms
    
    return () => clearTimeout(timeoutId);
  }, [requestType, currentPage, selectedSeller, selectedStatus, searchTerm]);

  const loadSellers = async () => {
    try {
      const response = await apiSeller.getSellers();
      setSellers(response?.items || []);
    } catch (error) {
      console.error('Error cargando vendedores:', error);
      setSellers([]);
    }
  };

  const loadExistingAssignments = async (requestId, requestType) => {
    try {
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
          return [];
      }
      
      const data = await getProcessorsByRequest(params);
      
      // Asegurar que data sea un array
      let assignmentsData = [];
      if (Array.isArray(data)) {
        assignmentsData = data;
      } else if (data && Array.isArray(data.items)) {
        assignmentsData = data.items;
      } else if (data && Array.isArray(data.results)) {
        assignmentsData = data.results;
      }
      
      // Filtrar solo asignaciones activas
      const activeAssignments = assignmentsData.filter(assignment => 
        assignment.status === "ASSIGNED" && assignment.is_active
      );
      
      setExistingAssignments(activeAssignments);
      return activeAssignments;
    } catch (error) {
      console.error('Error cargando asignaciones existentes:', error);
      setExistingAssignments([]);
      return [];
    }
  };

  const handleRedired = () => {
    navegate("/requests/new-request");
  };

  const handleRequestTypeChange = (e) => {
    setRequestType(e.target.value);
    setCurrentPage(1); // Resetear página al cambiar tipo
  };

  const handleRequests = async (requestType) => {
    if (!requestType) return;
    
    try {
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        seller_id: selectedSeller || undefined,
        status: selectedStatus || undefined,
        search: searchTerm || undefined
      };

      let data;
      switch (requestType) {
        case "fixflip":
          data = await apiFixflip.getFixflips(params);
          break;
        case "dscr":
          data = await apiDscr.getDscrs(params);
          break;
        case "construction":
          data = await apiConstruction.getConstructions(params);
          break;
        default:
          data = [];
      }
      
      setRequestsData(data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      setRequestsData([]);
    }
  };

  const openAssignPopup = async (requestId, requestType) => {
    setAssignRequest({ id: requestId, type: requestType });
    setShowAssignPopup(true);
    setAssignSuccess("");
    setAssignError("");
    setSelectedProcessor(null);
    setExistingAssignments([]);
    
    try {
      // Cargar procesadores y asignaciones existentes en paralelo
      const [processorsData, assignmentsData] = await Promise.all([
        getProcessors(),
        loadExistingAssignments(requestId, requestType)
      ]);
      
      setProcessors(
        Array.isArray(processorsData)
          ? processorsData
          : processorsData.items
            ? processorsData.items
            : processorsData.results
              ? processorsData.results
              : []
      );
    } catch (error) {
      console.error('Error cargando datos:', error);
      setProcessors([]);
      setExistingAssignments([]);
    }
  };

  const closeModalAndCleanup = () => {
    setShowAssignPopup(false);
    setSelectedProcessor(null);
    setAssignSuccess("");
    setAssignError("");
    setExistingAssignments([]);
    
    // Elimina manualmente el backdrop de Bootstrap si existe
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(b => b.parentNode && b.parentNode.removeChild(b));
    document.body.classList.remove('modal-open');
    
    // Si hubo éxito, muestra notificación global
    if (assignSuccess) {
      setGlobalSuccess(assignSuccess);
      setTimeout(() => setGlobalSuccess(""), 3000);
    }
  };

  const handleAssign = async () => {
    if (!selectedProcessor) return;
    
    // Validar si ya hay un procesador asignado
    if (existingAssignments.length > 0) {
      setAssignError("Ya hay un procesador asignado a esta solicitud. Debe desasignar el procesador actual antes de asignar otro.");
      return;
    }
    
    setAssigning(true);
    setAssignSuccess("");
    setAssignError("");
    try {
      await assignProcessor({
        processor_id: parseInt(selectedProcessor, 10),
        dscr_request_id: assignRequest.type === "dscr" ? parseInt(assignRequest.id, 10) : undefined,
        fixflip_request_id: assignRequest.type === "fixflip" ? parseInt(assignRequest.id, 10) : undefined,
        construction_request_id: assignRequest.type === "construction" ? parseInt(assignRequest.id, 10) : undefined
      });
      setAssignSuccess("¡Procesador asignado exitosamente!");
      
      // Recargar las asignaciones después de asignar
      await loadExistingAssignments(assignRequest.id, assignRequest.type);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        closeModalAndCleanup();
      }, 2000);
    } catch (error) {
      console.error('Error asignando procesador:', error);
      setAssignError("Error al asignar procesador. Verifica que el procesador esté disponible.");
    } finally {
      setAssigning(false);
    }
  };

  // Lógica de paginación
  const totalItems = requestsData && requestsData.total ? requestsData.total : (Array.isArray(requestsData) ? requestsData.length : 0);
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    handleRequests(requestType || "dscr");
  };

  // Formateador de estados
  const formatStatus = (status) => {
    if (!status) return <span className="text-muted">No definido</span>;
    
    const statusMap = {
      'PENDING': { label: 'Pendiente', color: 'bg-warning text-dark' },
      'IN_REVIEW': { label: 'En Revisión', color: 'bg-info text-white' },
      'PRICING': { label: 'En Pricing', color: 'bg-primary text-white' },
      'ACCEPTED': { label: 'Aprobada', color: 'bg-success text-white' },
      'REJECTED': { label: 'Rechazada', color: 'bg-danger text-white' },
      'CANCELLED': { label: 'Cancelada', color: 'bg-secondary text-white' },
      'CLOSED': { label: 'Cerrada', color: 'bg-dark text-white' }
    };

    const statusInfo = statusMap[status] || { label: status, color: 'bg-secondary text-white' };
    
    return (
      <span className={`badge ${statusInfo.color} px-3 py-2`} style={{ fontSize: '0.85rem' }}>
        {statusInfo.label}
      </span>
    );
  };

  // Formateador de valores monetarios
  const formatMonetaryValue = (value) => {
    if (!value || isNaN(Number(value)) || Number(value) === 0) {
      return <span className="text-muted">Pendiente</span>;
    }
    const amount = Number(value);
    let label, color;
    
    if (amount < 100000) {
      label = "Bajo";
      color = "text-success";
    } else if (amount < 500000) {
      label = "Medio";
      color = "text-primary";
    } else {
      label = "Alto";
      color = "text-danger";
    }
    
    return <span className={color}>{label}</span>;
  };

  // Formateador de porcentajes
  const formatPercent = (value) => {
    if (!value || isNaN(Number(value)) || Number(value) === 0) {
      return <span className="text-muted">Pendiente</span>;
    }
    const percent = Number(value);
    let label, color;
    
    if (percent < 50) {
      label = "Conservador";
      color = "text-success";
    } else if (percent < 75) {
      label = "Moderado";
      color = "text-primary";
    } else {
      label = "Agresivo";
      color = "text-danger";
    }
    
    return <span className={color}>{label}</span>;
  };

  // Renderiza la tabla según el tipo de solicitud
  const renderTable = () => {
    // Usar los datos de DSCR para todas las tablas temporalmente
    const data = requestsData;
    if (requestType === "fixflip") {
      return (
        <table className="table table-bordered table-hover">
          <thead className="sticky-top">
            <tr>
              <th style={{ color: "#000" }}>ID</th>
              <th style={{ color: "#000" }}>Radicado</th>
              <th style={{ color: "#000" }}>Nombre Completo</th>
              <th style={{ color: "#000" }}>Email</th>
              <th style={{ color: "#000" }}>Celular</th>
              <th style={{ color: "#000" }}>Monto del préstamo</th>
              <th style={{ color: "#000" }}>Precio de compra</th>
              <th style={{ color: "#000" }}>ARV</th>
              <th style={{ color: "#000" }}>Estado</th>
              <th style={{ color: "#000" }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.id}</strong></td>
                  <td>{request.radicado}</td>
                  <td>{request?.client?.full_name}</td>
                  <td>{request?.client?.email}</td>
                  <td>{request?.client?.phone}</td>
                  <td>{formatMonetaryValue(request.loan_amount)}</td>
                  <td>{formatMonetaryValue(request.purchase_price)}</td>
                  <td>{formatMonetaryValue(request.arv)}</td>
                  <td>{formatStatus(request.status)}</td>
                  <td>
                    <button className="btn btn-sm me-1" style={{ backgroundColor: "#000" }} onClick={() => openAssignPopup(request.id, requestType || 'dscr')}>
                      <img src={BookCheck} alt="check-data" width={10} />
                    </button>
                    <button className="btn btn-sm" style={{ backgroundColor: "#000" }} onClick={() => navegate(`/requests/${requestType || 'dscr'}/${request.id}/details`)}>
                      <img src={Eye} alt="detail-client" width={10} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>No hay solicitudes fixflip</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    } else if (requestType === "construction") {
      return (
        <table className="table table-bordered table-hover">
          <thead className="sticky-top">
            <tr>
              <th style={{ color: "#000" }}>ID</th>
              <th style={{ color: "#000" }}>Radicado</th>
              <th style={{ color: "#000" }}>Nombre Completo</th>
              <th style={{ color: "#000" }}>Email</th>
              <th style={{ color: "#000" }}>Celular</th>
              <th style={{ color: "#000" }}>Monto del préstamo</th>
              <th style={{ color: "#000" }}>Valor de la propiedad</th>
              <th style={{ color: "#000" }}>Costo de construcción</th>
              <th style={{ color: "#000" }}>Estado</th>
              <th style={{ color: "#000" }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.id}</strong></td>
                  <td>{request.radicado}</td>
                  <td>{request?.client?.full_name}</td>
                  <td>{request?.client?.email}</td>
                  <td>{request?.client?.phone}</td>
                  <td>{formatMonetaryValue(request.loan_amount)}</td>
                  <td>{formatMonetaryValue(request.property_value)}</td>
                  <td>{formatMonetaryValue(request.construction_cost)}</td>
                  <td>{formatStatus(request.status)}</td>
                  <td>
                    <button className="btn btn-sm me-1" style={{ backgroundColor: "#000" }} onClick={() => openAssignPopup(request.id, requestType || 'dscr')}>
                      <img src={BookCheck} alt="check-data" width={10} />
                    </button>
                    <button className="btn btn-sm" style={{ backgroundColor: "#000" }} onClick={() => navegate(`/requests/${requestType || 'dscr'}/${request.id}/details`)}>
                      <img src={Eye} alt="detail-client" width={10} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>No hay solicitudes construction</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    } else {
      // Por defecto DSCR
      return (
        <table className="table table-bordered table-hover">
          <thead className="sticky-top">
            <tr>
              <th style={{ color: "#000" }}>ID</th>
              <th style={{ color: "#000" }}>Radicado</th>
              <th style={{ color: "#000" }}>Nombre Completo</th>
              <th style={{ color: "#000" }}>Email</th>
              <th style={{ color: "#000" }}>Celular</th>
              <th style={{ color: "#000" }}>Monto Alquiler</th>
              <th style={{ color: "#000" }}>Valor de tasación</th>
              <th style={{ color: "#000" }}>LTV Solicitado</th>
              <th style={{ color: "#000" }}>Estado</th>
              <th style={{ color: "#000" }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.id}</strong></td>
                  <td>{request.radicado}</td>
                  <td>{request?.client.full_name}</td>
                  <td>{request?.client.email}</td>
                  <td>{request?.client.phone}</td>
                  <td>{formatMonetaryValue(request.rent_amount)}</td>
                  <td>{formatMonetaryValue(request.appraisal_value)}</td>
                  <td>{formatPercent(request.ltv_request)}</td>
                  <td>{formatStatus(request.status)}</td>
                  <td>
                    <button className="btn btn-sm me-1" style={{ backgroundColor: "#000" }} onClick={() => openAssignPopup(request.id, requestType || 'dscr')}>
                      <img src={BookCheck} alt="check-data" width={10} />
                    </button>
                    <button className="btn btn-sm" style={{ backgroundColor: "#000" }} onClick={() => navegate(`/requests/${requestType || 'dscr'}/${request.id}/details`)}>
                      <img src={Eye} alt="detail-client" width={10} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>No hay solicitudes dscr</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    }
  };

  // Función para verificar si el usuario puede ver el filtro de vendedores
  const canViewSellerFilter = () => {
    return currentUser && (currentUser.roles?.[0] === "Admin" || currentUser.roles?.[0] === "Coordinador" || currentUser.roles?.[0] === "Procesador");
  };

  return (
    <div
      className={`${"d-flex flex-column"} internal_layout`}
      style={{ backgroundColor: "#fff" }}
    >
      <div className="d-flex flex-column align-items-start w-100 mb-4 px-4 mt-5">
        <p className="mb-4 fs-2 fw-bolder my_title_color">
          Solicitudes de crédito
        </p>
      </div>
      <div className="d-flex justify-content-between w-100 mb-4 px-4">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleRedired}
          >
            <i className={`bi bi-plus-lg ${styles.icon}`}></i>
            <span className={`${styles.text} my_title_color`}>
              Crear solicitud
            </span>
          </button>
        </div>
        <div className={`${"d-flex gap-3"}`}>
          {/* <button className="btn d-flex align-items-center">
            <img src={FilterIcon} alt="filter" width={18} />
          </button> */}
          <select 
            className="form-select my_title_color" 
            onChange={handleRequestTypeChange} 
            value={requestType}
          >
            <option value="dscr">DSCR</option>
            <option value="fixflip">Fix & Flip</option>
            <option value="construction">Construcción</option>
          </select>
          {canViewSellerFilter() && (
            <select 
              className="form-select my_title_color" 
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
            >
              <option value="">Vendedores</option>
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.full_name}
                </option>
              ))}
            </select>
          )}
          <select 
            className="form-select my_title_color" 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="IN_REVIEW">En Revisión</option>
            <option value="PRICING">En Pricing</option>
            <option value="ACCEPTED">Aprobada</option>
            <option value="REJECTED">Rechazada</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="CLOSED">Cerrada</option>
          </select>

          <div className={`input-group ${styles.searchGroup}`}>
            <input 
              type="text" 
              className={`form-control ${styles.searchInput}`} 
              placeholder="Buscar" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" type="button">
              <img src={LoupeIcon} alt="" width={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className={`${"w-100 px-4 mb-3"} table_height`}>
        {renderTable()}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} handlePaginate={paginate} />
      
      {/* Modal de asignación de procesadores */}
      {showAssignPopup && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ zIndex: 1051 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2"></i>
                  {existingAssignments.length > 0 ? "Procesador Asignado" : "Asignar Procesador"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModalAndCleanup}
                  disabled={assigning}
                />
              </div>
              <div className="modal-body">
                {/* Notificaciones */}
                {assignSuccess && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {assignSuccess}
                    <button type="button" className="btn-close" onClick={() => setAssignSuccess("")}></button>
                  </div>
                )}
                {assignError && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {assignError}
                    <button type="button" className="btn-close" onClick={() => setAssignError("")}></button>
                  </div>
                )}

                {/* Selector de procesador */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Seleccionar Procesador
                    {existingAssignments.length > 0 && (
                      <span className="text-muted ms-2">(Deshabilitado - Ya hay un procesador asignado)</span>
                    )}
                  </label>
                  <select 
                    className="form-select" 
                    value={selectedProcessor || ""} 
                    onChange={e => setSelectedProcessor(e.target.value)}
                    disabled={assigning || existingAssignments.length > 0}
                  >
                    <option value="">Selecciona un procesador</option>
                    {(Array.isArray(processors) ? processors : []).map(proc => (
                      <option key={proc.id} value={proc.id}>
                        {proc.full_name || proc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Información del procesador seleccionado */}
                {selectedProcessor && (() => {
                  const proc = (Array.isArray(processors) ? processors : []).find(p => String(p.id) === String(selectedProcessor));
                  if (!proc) return null;
                  return (
                    <div className="mb-3 p-3 border rounded bg-light">
                      <h6 className="fw-bold text-primary mb-2">
                        <i className="bi bi-person me-2"></i>
                        Procesador Seleccionado
                      </h6>
                      <div className="row">
                        <div className="col-md-6">
                          <p className="mb-1"><strong>Nombre:</strong> {proc.full_name || proc.name}</p>
                          <p className="mb-1"><strong>Email:</strong> {proc.email || '-'}</p>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-1"><strong>Teléfono:</strong> {proc.phone || '-'}</p>
                          <p className="mb-1">
                            <strong>Estado:</strong> 
                            <span className={`badge ${proc.is_active ? 'bg-success' : 'bg-secondary'} ms-2`}>
                              {proc.is_active ? "Activo" : "Inactivo"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Información del procesador asignado */}
                {existingAssignments.length > 0 && (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Procesador ya asignado:</strong>
                    {existingAssignments.map((assignment, index) => (
                      <div key={index} className="mt-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{assignment.processor?.full_name || assignment.processor?.name}</strong>
                            <br />
                            <small className="text-muted">
                              Email: {assignment.processor?.email || 'No disponible'}
                            </small>
                          </div>
                          <span className="badge bg-success">Asignado</span>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Para asignar otro procesador, primero debe desasignar el actual.
                      </small>
                    </div>
                  </div>
                )}

                {/* Información de la solicitud */}
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Solicitud:</strong> #{assignRequest.id} - {assignRequest.type?.toUpperCase()}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeModalAndCleanup} 
                  disabled={assigning}
                >
                  <i className="bi bi-x me-2"></i>
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleAssign} 
                  disabled={!selectedProcessor || assigning || existingAssignments.length > 0}
                >
                  {assigning ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Asignando...
                    </>
                  ) : existingAssignments.length > 0 ? (
                    <>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Ya hay procesador asignado
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Asignar Procesador
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notificación global */}
      {globalSuccess && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1060 }}>
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            {globalSuccess}
            <button type="button" className="btn-close" onClick={() => setGlobalSuccess("")}></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestLoan;
