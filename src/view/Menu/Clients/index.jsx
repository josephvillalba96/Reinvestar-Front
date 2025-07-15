import style from "./style.module.css";
import FilterIcon from "../../../assets/filter.svg";
import LoupeIcon from "../../../assets/Loupe.svg";
import Eye from "../../../assets/eye.svg"; 
import BookCheck from "../../../assets/book-check.svg"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/Pagination";
import { getClients } from "../../../Api/client";
import { getCompanies } from "../../../Api/admin";

const Clients = () => {
  // Estado para la paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [clientsData, setClientsData] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState([]);
  const navegate = useNavigate(); 

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line
  }, [currentPage, search, companyId]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies({ skip: 0, limit: 100 });
        setCompanies(data);
      } catch (e) {
        setCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };
      if (search) params.search = search;
      if (companyId) params.company_id = companyId;
      const data = await getClients(params);
      setClientsData(data);
      setTotalClients(data.length < itemsPerPage && currentPage === 1 ? data.length : currentPage * itemsPerPage + (data.length === itemsPerPage ? itemsPerPage : 0));
    } catch (error) {
      setClientsData([]);
    }
    setLoading(false);
  };

  const handlerRedirectCreate = () => {
    navegate('/clients/new-client')
  }

  const handleViewDetails = (id) => {
    navegate(`/clients/${id}/details`)
  } 

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCompanyChange = (e) => {
    setCompanyId(e.target.value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div
      className={`${"d-flex flex-column align-items-center text-center"} internal_layout`}
      style={{ backgroundColor: "#fff" }}
    >
      <div className="d-flex flex-column align-items-start w-100 mb-4 px-4 mt-5">
        <p className="mb-4 fs-2 fw-bolder my_title_color">Listado de clientes</p>
      </div>
      <div className="d-flex justify-content-between w-100 mb-4 px-4">
        <div>
          <button className="btn btn-primary d-flex align-items-center" onClick={handlerRedirectCreate}>
            <i className={`bi bi-plus-lg ${style.icon}`}></i>
            <span className={`${style.text} my_title_color`}>Crear cliente</span>
          </button>
        </div>
        <div className="d-flex gap-3">
          <button className="btn d-flex align-items-center">
            <img src={FilterIcon} alt="filter" width={18}/>
          </button>
          <select className="form-select my_title_color" name="company" value={companyId} onChange={handleCompanyChange}>
            <option value="">Empresa</option>
            {companies && companies.map(({ id, name }) => (
              <option value={id} key={id}>{name}</option>
            ))}
          </select>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar"
              value={search}
              onChange={handleSearchChange}
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={fetchClients}
            >
              <img src={LoupeIcon} alt="" width={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className={`${"w-100 px-4 mb-3"} table_height`}>
        <table className="table table-bordered table-hover">
          <thead className="sticky-top">
            <tr>
              <th style={{color:"#1B2559"}}>ID</th>
              <th style={{color:"#1B2559"}}>Nombre Completo</th>
              <th style={{color:"#1B2559"}}>Email</th>
              <th style={{color:"#1B2559"}}>Celular</th>
              <th style={{color:"#1B2559"}}>Dirección</th>
              <th style={{color:"#1B2559"}}>Cant. propiedades</th>
              <th style={{color:"#1B2559"}}>Tot. Solicitudes</th>
              <th style={{color:"#1B2559"}}>Solicitudes activas</th>
              <th style={{color:"#1B2559"}}>Estado</th>
              <th style={{color:"#1B2559"}}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9}>Cargando...</td></tr>
            ) : clientsData.length === 0 ? (
              <tr><td colSpan={9}>No hay clientes</td></tr>
            ) : (
              clientsData.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.full_name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>{client.address}</td>
                  <td>{client.producto || '-'}</td>
                  <td>{client.monto_alquiler || '-'}</td>
                  <td>{client.valor_tasa || '-'}</td>
                  <td>
                    <span>
                      {client.estado || '-'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm me-1" style={{backgroundColor:"#1B2559"}}>
                      <img src={BookCheck} alt="check-data" width={15}/>
                    </button>
                    <button className="btn btn-sm" style={{backgroundColor:"#1B2559"}} onClick={() => handleViewDetails(client.id)}>
                      <img src={Eye} alt="detail-client" width={18}/>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={Math.ceil(totalClients / itemsPerPage)} handlePaginate={paginate}/>
    </div>
  );
};

export default Clients;