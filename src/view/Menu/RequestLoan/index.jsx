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
import Notification from "../../../components/Notification";
import MyModal from "../../../components/Popup";
import { getProcessors, assignProcessor } from "../../../Api/procesor";

const RequestLoan = () => {
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [requestType, setRequestType] = useState("");
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

  const handleRedired = () => {
    navegate("/requests/new-request");
  };

  const handleRequestTypeChange = (e) => {
    setRequestType(e.target.value);
    console.log("Tipo de solicitud:", e.target.value);
  };

  const handleRequests = async (requestType) => {

    setRequestsData([]);

    if ("fixflip" === requestType) {

      const data = await apiFixflip.getFixflips({
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      });
      setRequestsData(data);
      // Aquí puedes manejar los datos obtenidos de fixflip
    } else if ("dscr" === requestType) {
      const data = await apiDscr.getDscrs({
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      });
      setRequestsData(data);
      // Aquí puedes manejar los datos obtenidos de dscr
    } else if ("construction" === requestType) {
      const data = await apiConstruction.getConstructions({
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      });
      setRequestsData(data);
      // Aquí puedes manejar los datos obtenidos de construction
    } else {
      setRequestsData([]); // Si no hay tipo de solicitud seleccionado, resetea los datos
    }
  };

  const openAssignPopup = async (requestId, requestType) => {
    setAssignRequest({ id: requestId, type: requestType });
    setShowAssignPopup(true);
    setAssignSuccess("");
    setAssignError("");
    setSelectedProcessor(null);
    try {
      const data = await getProcessors();
      setProcessors(
        Array.isArray(data)
          ? data
          : data.items
            ? data.items
            : data.results
              ? data.results
              : []
      );
    } catch {
      setProcessors([]);
    }
  };

  const closeModalAndCleanup = () => {
    setShowAssignPopup(false);
    // Elimina manualmente el backdrop de Bootstrap si existe
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(b => b.parentNode && b.parentNode.removeChild(b));
    document.body.classList.remove('modal-open');
    // Si hubo éxito, muestra notificación global
    if (assignSuccess) {
      setGlobalSuccess(assignSuccess);
      setTimeout(() => setGlobalSuccess(""), 2000);
    }
  };

  const handleAssign = async () => {
    if (!selectedProcessor) return;
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
      setAssignSuccess("Procesador asignado exitosamente");
      setTimeout(() => {
        setAssignSuccess("");
        closeModalAndCleanup();
      }, 1500);
    } catch {
      setAssignError("Error al asignar procesador");
    }
    setAssigning(false);
  };

  // Lógica de paginación
  const totalItems = requestsData && requestsData.total ? requestsData.total : (Array.isArray(requestsData) ? requestsData.length : 0);
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    handleRequests(requestType || "dscr");
  };

  useEffect(() => {
    handleRequests(requestType || "dscr");
    // eslint-disable-next-line
  }, [currentPage, requestType]);

  // Datos de ejemplo para la tabla (reemplaza con tus datos reales)

  // // Lógica de paginación
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = clientsData.slice(indexOfFirstItem, indexOfLastItem);
  // const totalPages = Math.ceil(clientsData.length / itemsPerPage);

  // const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Formateador de moneda USD
  const formatUSD = (value) => {
    if (!value || isNaN(Number(value))) return "$0.00";
    return Number(value).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  };
  // Formateador de porcentaje
  const formatPercent = (value) => {
    if (!value || isNaN(Number(value))) return "0%";
    return `${Number(value).toFixed(2)}%`;
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
              <th style={{ color: "#1B2559" }}>Radicado</th>
              <th style={{ color: "#1B2559" }}>Nombre Completo</th>
              <th style={{ color: "#1B2559" }}>Email</th>
              <th style={{ color: "#1B2559" }}>Celular</th>
              <th style={{ color: "#1B2559" }}>Monto del préstamo</th>
              <th style={{ color: "#1B2559" }}>Precio de compra</th>
              <th style={{ color: "#1B2559" }}>ARV</th>
              <th style={{ color: "#1B2559" }}>Estado</th>
              <th style={{ color: "#1B2559" }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((request) => (
                <tr key={request.id}>
                  <td>{request.radicado}</td>
                  <td>{request?.client?.full_name}</td>
                  <td>{request?.client?.email}</td>
                  <td>{request?.client?.phone}</td>
                  <td>{request.loan_amount === 0 ? "Pending" : request.loan_amount}</td>
                  <td>{request.purchase_price === 0 ? "Pending" : request.purchase_price}</td>
                  <td>{request.arv === 0 ? "Pending" : request.arv}</td>
                  <td>{request.status}</td>
                  <td>
                    <button className="btn btn-sm me-1" style={{ backgroundColor: "#1B2559" }} onClick={() => openAssignPopup(request.id, requestType || 'dscr')}>
                      <img src={BookCheck} alt="check-data" width={15} />
                    </button>
                    <button className="btn btn-sm" style={{ backgroundColor: "#1B2559" }} onClick={() => navegate(`/requests/${requestType || 'dscr'}/${request.id}/details`)}>
                      <img src={Eye} alt="detail-client" width={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>No hay solicitudes fixflip</td>
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
              <th style={{ color: "#1B2559" }}>Radicado</th>
              <th style={{ color: "#1B2559" }}>Nombre Completo</th>
              <th style={{ color: "#1B2559" }}>Email</th>
              <th style={{ color: "#1B2559" }}>Celular</th>
              <th style={{ color: "#1B2559" }}>Monto del préstamo</th>
              <th style={{ color: "#1B2559" }}>Valor de la propiedad</th>
              <th style={{ color: "#1B2559" }}>Costo de construcción</th>
              <th style={{ color: "#1B2559" }}>Estado</th>
              <th style={{ color: "#1B2559" }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((request) => (
                <tr key={request.id}>
                  <td>{request.radicado}</td>
                  <td>{request?.client?.full_name}</td>
                  <td>{request?.client?.email}</td>
                  <td>{request?.client?.phone}</td>
                  <td>{request.loan_amount === 0 ? "Pending" : request.loan_amount}</td>
                  <td>{request.property_value === 0 ? "Pending" : request.property_value}</td>
                  <td>{request.construction_cost === 0 ? "Pending" : request.construction_cost}</td>
                  <td>{request.status}</td>
                  <td>
                    <button className="btn btn-sm me-1" style={{ backgroundColor: "#1B2559" }} onClick={() => openAssignPopup(request.id, requestType || 'dscr')}>
                      <img src={BookCheck} alt="check-data" width={15} />
                    </button>
                    <button className="btn btn-sm" style={{ backgroundColor: "#1B2559" }} onClick={() => navegate(`/requests/${requestType || 'dscr'}/${request.id}/details`)}>
                      <img src={Eye} alt="detail-client" width={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>No hay solicitudes construction</td>
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
              <th style={{ color: "#1B2559" }}>Radicado</th>
              <th style={{ color: "#1B2559" }}>Nombre Completo</th>
              <th style={{ color: "#1B2559" }}>Email</th>
              <th style={{ color: "#1B2559" }}>Celular</th>
              <th style={{ color: "#1B2559" }}>Monto Alquiler</th>
              <th style={{ color: "#1B2559" }}>Valor de tasación</th>
              <th style={{ color: "#1B2559" }}>LTV Solicitado</th>
              <th style={{ color: "#1B2559" }}>Estado</th>
              <th style={{ color: "#1B2559" }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((request) => (
                <tr key={request.id}>
                  <td>{request.radicado}</td>
                  <td>{request?.client.full_name}</td>
                  <td>{request?.client.email}</td>
                  <td>{request?.client.phone}</td>
                  <td>{formatUSD(request.rent_amount)}</td>
                  <td>{formatUSD(request.appraisal_value)}</td>
                  <td>{formatPercent(request.ltv_request)}</td>
                  <td>{request.status}</td>
                  <td>
                    <button className="btn btn-sm me-1" style={{ backgroundColor: "#1B2559" }} onClick={() => openAssignPopup(request.id, requestType || 'dscr')}>
                      <img src={BookCheck} alt="check-data" width={15} />
                    </button>
                    <button className="btn btn-sm" style={{ backgroundColor: "#1B2559" }} onClick={() => navegate(`/requests/${requestType || 'dscr'}/${request.id}/details`)}>
                      <img src={Eye} alt="detail-client" width={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>No hay solicitudes dscr</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div
      className={`${"d-flex flex-column justify-content-center align-items-center text-center"} internal_layout`}
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
          <button className="btn d-flex align-items-center">
            <img src={FilterIcon} alt="filter" width={18} />
          </button>
          <select name="" id="" onChange={handleRequestTypeChange} value={requestType || "dscr"}>
            <option value="dscr">DSCR</option>
            <option value="fixflip">Fix & Flip</option>
            <option value="construction">Construcción</option>
          </select>
          <select className="form-select my_title_color" name="Vendedor" id="">
            <option value="Vendedor">Vendedor</option>
            <option value="Vendedor1">Vendedor 1</option>
            <option value="Vendedor2">Vendedor 2</option>
            <option value="Vendedor3">Vendedor 3</option>
          </select>
          <select className="form-select my_title_color" name="Estado" id="">
            <option value="Estado">Estado</option>
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
            <option value="Pendiente">Pendiente</option>
          </select>

          <div className="input-group">
            <input type="text" className="form-control" placeholder="Buscar" />
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
      {showAssignPopup && (
        <MyModal show={showAssignPopup} setShow={val => { setShowAssignPopup(val); if (!val) closeModalAndCleanup(); }} title="Asignar procesador">
          {assignSuccess && <Notification type="success" message={assignSuccess} />}
          {assignError && <Notification type="error" message={assignError} />}
          <select className="form-select my-3" value={selectedProcessor || ""} onChange={e => setSelectedProcessor(e.target.value)}>
            <option value="">Selecciona un procesador</option>
            {(Array.isArray(processors) ? processors : []).map(proc => (
              <option key={proc.id} value={proc.id}>{proc.full_name || proc.name}</option>
            ))}
          </select>
          {/* Mostrar resumen del procesador seleccionado */}
          {selectedProcessor && (() => {
            const proc = (Array.isArray(processors) ? processors : []).find(p => String(p.id) === String(selectedProcessor));
            if (!proc) return null;
            return (
              <div className="mb-3 p-2 border rounded bg-light">
                <div><b>Procesador seleccionado:</b></div>
                <div><b>Nombre:</b> {proc.full_name || proc.name}</div>
                <div><b>Email:</b> {proc.email || '-'}</div>
                <div><b>Teléfono:</b> {proc.phone || '-'}</div>
              </div>
            );
          })()}
          <button className="btn btn-primary" onClick={handleAssign} disabled={!selectedProcessor || assigning}>
            {assigning ? "Asignando..." : "Asignar"}
          </button>
          <button className="btn btn-secondary ms-2" onClick={closeModalAndCleanup} disabled={assigning}>Cancelar</button>
        </MyModal>
      )}
      {globalSuccess && <Notification type="success" message={globalSuccess} />}
    </div>
  );
};

export default RequestLoan;
