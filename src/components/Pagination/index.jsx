import styles from "./style.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const Pagination = ({ currentPage, totalPages, handlePaginate }) => {
  return (
    <nav className="w-100 px-4">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link d-flex align-items-center justify-content-center"
            onClick={() => handlePaginate(currentPage - 1)}
            aria-label="Anterior"
            title="Anterior"
          >
            <FaChevronLeft size={14} />
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, i) => (
          <li
            key={i + 1}
            className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
          >
            <button className="page-link" onClick={() => handlePaginate(i + 1)}>
              {i + 1}
            </button>
          </li>
        ))}

        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link d-flex align-items-center justify-content-center"
            onClick={() => handlePaginate(currentPage + 1)}
            aria-label="Siguiente"
            title="Siguiente"
          >
            <FaChevronRight size={14} />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
