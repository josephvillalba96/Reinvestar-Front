import FilterIcon from "../../../../assets/filter.svg";
import LoupeIcon from "../../../../assets/Loupe.svg";
import Eye from "../../../../assets/eye.svg"; 
import BookCheck from "../../../../assets/book-check.svg"; 
import styles from "./style.module.css";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../../../../components/Pagination";

const Coordinators = () => {
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const navegate = useNavigate();

  const handleRedired = () => {
    navegate("/coordinators/new-coordinator");
  };

  // Datos de ejemplo para la tabla (reemplaza con tus datos reales)
  const clientsData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    nombre: `Coordinador ${i + 1}`,
    email: `Coordinador${i + 1}@reinvestar.com`,
    celular: `300123456${i.toString().padStart(2, "0")}`,
    iniciales: `jv-${i}`,
    identificacion: `${"18338000" + (i + 1)}`,
    estado: i % 5 === 0 ? "Inactivo" : "Activo",
  }));

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = clientsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(clientsData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div
      className={`${"d-flex flex-column justify-content-center align-items-center text-center"} internal_layout`}
      style={{ backgroundColor: "#fff" }}
    >
      <div className="d-flex flex-column align-items-start w-100 mb-4 px-4 mt-5">
        <p className="mb-4 fs-2 fw-bolder my_title_color">
          Coodinadores
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
              Crear Coordinador
            </span>
          </button>
        </div>
        <div className={`${"d-flex gap-3"}`}>
          <button className="btn d-flex align-items-center">
            <img src={FilterIcon} alt="filter" width={18} />
          </button>
          {/* <select className="form-select my_title_color" name="Vendedor" id="">
            <option value="Vendedor">Vendedor</option>
            <option value="Vendedor1">Vendedor 1</option>
            <option value="Vendedor2">Vendedor 2</option>
            <option value="Vendedor3">Vendedor 3</option>
          </select> */}
          <select className="form-select my_title_color" name="Estado" id="">
            <option value="Estado">Estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            {/* <option value="Pendiente">Pendiente</option> */}
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
      <div
        className={`${"w-100 px-4 mb-3"} table_height`}
      >
        <table className="table table-bordered table-hover">
          <thead className="sticky-top">
            <tr>
              <th style={{ color: "#1B2559" }}>ID</th>
              <th style={{ color: "#1B2559" }}>Nombre Completo</th>
              <th style={{ color: "#1B2559" }}>Email</th>
              <th style={{ color: "#1B2559" }}>Celular</th>
              <th style={{ color: "#1B2559" }}>Iniciales</th>
              <th style={{ color: "#1B2559" }}>Identificación</th>
              <th style={{ color: "#1B2559" }}>Estado</th>
              <th style={{ color: "#1B2559" }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.nombre}</td>
                <td>{client.email}</td>
                <td>{client.celular}</td>
                <td>{client.iniciales}</td>
                <td>{client.identificacion}</td>
                <td>{client.estado}</td>
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
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} handlePaginate={paginate}/>
    </div>
  );
};

export default Coordinators;
