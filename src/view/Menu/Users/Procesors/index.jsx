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
  const navegate = useNavigate();

  const handleRedirect = (id) => {
    navegate(`/process/${id}/details`)
  }

  const fetchProcessors = async (page = 1, searchValue = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        skip: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
      };
      if (searchValue) params.search = searchValue;
      const data = await getProcessors(params);
      setProcessors(data.items || data.results || data || []);
      setTotal(data.total || (data.items ? data.items.length : (data.results ? data.results.length : (Array.isArray(data) ? data.length : 0))));
    } catch (err) {
      setError("Error al cargar los procesadores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessors(currentPage, search);
    // eslint-disable-next-line
  }, [currentPage]);

  const handleRedired = () => {
    navegate("/process/new-process");
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProcessors(1, search);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div
      className={`${"d-flex flex-column justify-content-center align-items-center text-center"} internal_layout`}
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
          <select className="form-select my_title_color" name="Estado" id="">
            <option value="Estado">Estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <div className="input-group">
            <input type="text" className="form-control" placeholder="Buscar" value={search} onChange={e => setSearch(e.target.value)} />
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
              {Array.isArray(processors) && processors.length > 0 ? (
                processors.map((proc) => (
                  <tr key={proc.id || proc._id}>
                    <td>{proc.id || proc._id}</td>
                    <td>{proc.full_name || proc.nombreCompleto || proc.nombre || "-"}</td>
                    <td>{proc.email}</td>
                    <td>{proc.phone || proc.celular || "-"}</td>
                    <td>{proc.identification || "-"}</td>
                    <td>{proc.is_active !== undefined ? (proc.is_active ? "Activo" : "Inactivo") : "-"}</td>
                    <td>
                      <button
                        className="btn btn-sm me-1"
                        style={{ backgroundColor: "#1B2559" }}
                      >
                        <img src={BookCheck} alt="check-data" width={15} />
                      </button>
                      <button
                        onClick={() => handleRedirect(proc.id)}
                        className="btn btn-sm"
                        style={{ backgroundColor: "#1B2559" }}
                      >
                        <img src={Eye} alt="detail-client" width={18}/>
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
      <Pagination currentPage={currentPage} totalPages={Math.ceil(total / itemsPerPage) || 1} handlePaginate={paginate}/>
    </div>
  );
};

export default Procesors;
