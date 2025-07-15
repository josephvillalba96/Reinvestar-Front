import FilterIcon from "../../../assets/filter.svg";
import LoupeIcon from "../../../assets/Loupe.svg";
import Eye from "../../../assets/eye.svg";
import BookCheck from "../../../assets/book-check.svg";
import styles from "./style.module.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../../../components/Pagination";

import * as apiFixflip from "../../../api/fixflip";
import * as apiDscr from "../../../Api/dscr";
import * as apiConstruction from "../../../Api/construction";

const RequestLoan = () => {
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [requestType, setRequestType] = useState("");
  const [requestsData, setRequestsData] = useState(null);
  const navegate = useNavigate();

  const handleRedired = () => {
    navegate("/requests/new-request");
  };

  const handleRequestTypeChange = (e) => {
    setRequestType(e.target.value);
    console.log("Tipo de solicitud:", e.target.value);
  };

  const handleRequests = async (requestType) => {
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

  useEffect(() => {
    handleRequests("dscr");
  }, []);

  // Datos de ejemplo para la tabla (reemplaza con tus datos reales)

  // // Lógica de paginación
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = clientsData.slice(indexOfFirstItem, indexOfLastItem);
  // const totalPages = Math.ceil(clientsData.length / itemsPerPage);

  // const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          <select name="" id="" onChange={handleRequestTypeChange}>
            <option value="">-Tipos de solicitud-</option>
            <option value="fixflip">Fix & Flip</option>
            <option value="dscr">DSCR</option>
            <option value="construction">Construcción</option>
          </select>
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
          <select className="form-select my_title_color" name="Vendedor" id="">
            <option value="Vendedor">Vendedor</option>
            <option value="Vendedor1">Vendedor 1</option>
            <option value="Vendedor2">Vendedor 2</option>
            <option value="Vendedor3">Vendedor 3</option>
          </select>
          <select className="form-select my_title_color" name="Estado" id="">
            <option value="Estado">Estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
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
        <table className="table table-bordered table-hover">
          <thead className="sticky-top">
            <tr>
              <th style={{ color: "#1B2559" }}>ID</th>
              <th style={{ color: "#1B2559" }}>Nombre Completo</th>
              <th style={{ color: "#1B2559" }}>Email</th>
              <th style={{ color: "#1B2559" }}>Celular</th>
              <th style={{ color: "#1B2559" }}>Producto</th>
              <th style={{ color: "#1B2559" }}>Monto Alquiler</th>
              <th style={{ color: "#1B2559" }}>Valor de tasa</th>
              <th style={{ color: "#1B2559" }}>LTV Solicitado</th>
              <th style={{ color: "#1B2559" }}>Estado</th>
              <th style={{ color: "#1B2559" }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Aquí deberías mapear tus datos reales */}
            {requestsData && requestsData.length > 0 ? (
              requestsData.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  {/* <td>{request.nombre_completo}</td>
                  <td>{request.email}</td>
                  <td>{request.celular}</td>
                  <td>{request.producto}</td>
                  <td>{request.monto_alquiler}</td>
                  <td>{request.valor_tasa}</td>
                  <td>{request.ltv_solicitado}</td> */}
                  <td colSpan={9}>
                    <span className={`text-black`}>{request.estado}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm me-1"
                      style={{ backgroundColor: "#1B2559" }}
                    >
                      <img src={BookCheck} alt="check-data" width={15} />
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: "#1B2559" }}
                    >
                      <img src={Eye} alt="detail-client" width={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>{`No hay solicitudes ${
                  requestType === null ? "" : requestType
                }`}</td>
              </tr>
            )}
            {/* {currentItems.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.nombre}</td>
                <td>{client.email}</td>
                <td>{client.telefono}</td>
                <td>{client.producto}</td>
                <td>{client.monto_alquiler}</td>
                <td>{client.valor_tasa}</td>
                <td>{client.ltv}</td>
                <td>
                  <span
                    className={`text-black`}
                  >
                    {client.estado}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm me-1"
                    style={{ backgroundColor: "#1B2559" }}
                  >
                    <img src={BookCheck} alt="check-data" width={15} />
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: "#1B2559" }}
                  >
                    <img src={Eye} alt="detail-client" width={18}/>
                  </button>
                </td>
              </tr>
            ))} */}
          </tbody>
        </table>
      </div>
      {/* <Pagination currentPage={currentPage} totalPages={totalPages} handlePaginate={paginate}/> */}
    </div>
  );
};

export default RequestLoan;
