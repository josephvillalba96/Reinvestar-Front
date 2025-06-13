import styles from "./Clients.module.css";
import FilterIcon from "../../../assets/filter.svg"; // Adjust the path as necessary
import LoupeIcon from "../../../assets/Loupe.svg"; // Adjust the path as necessary

const Clients = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center h-100"
      style={{ backgroundColor: "#fff" }}
    >
      <div className="d-flex flex-column align-items-start w-100 mb-4 px-4 mt-5">
        <p className="text-black mb-4 fs-2 fw-bolder">Listado de clientes</p>
      </div>
      <div className="d-flex justify-content-between w-100 mb-4 px-4">
        <div>
          <button className="btn btn-primary d-flex align-items-center">
            <i className={`bi bi-plus-lg ${styles.icon}`}></i>
            <span className={styles.text}>Crear Cliente</span>
          </button>
        </div>
        <div className="d-flex gap-3">
          <button className="btn d-flex align-items-center">
            <img src={FilterIcon} alt="filter" width={18}/>
          </button>
          <select className="form-select" name="Vendedor" id="">
            <option value="Vendedor">Vendedor</option>
            <option value="Vendedor1">Vendedor 1</option>
            <option value="Vendedor2">Vendedor 2</option>
            <option value="Vendedor3">Vendedor 3</option>
          </select>
          <select className="form-select" name="Estado" id="">
            <option value="Estado">Estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Pendiente">Pendiente</option>
          </select>

          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar"
            />
            <button
              className="btn btn-primary"
              type="button"
            >
              <img src={LoupeIcon} alt="" width={18}/>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Clients;
