import React, { useState, useEffect } from "react";
import Back from "../../assets/back.svg";
import styles from "./DetalleSolicitud.module.css";
import { useNavigate, useParams } from "react-router-dom";
import DocumentsRequest from "../Menu/RequestLoan/DetailRequest/DocumentsRequest";
import PipelineRequest from "../Menu/RequestLoan/DetailRequest/PipelineRequest";
import { getDscrById } from "../../Api/dscr";
import { getClientById } from "../../Api/client";
import DscrForm from "../Menu/RequestLoan/DetailRequest/FormRequest/Dscr";
import FixflipForm from "../Menu/RequestLoan/DetailRequest/FormRequest/Fixflip";
import ConstructionForm from "../Menu/RequestLoan/DetailRequest/FormRequest/Construction";
import { getFixflipById } from "../../Api/fixflip";
import { getConstructionById } from "../../Api/construction";

const DetalleSolicitud = () => {
  const navegate = useNavigate();
  const { id, type } = useParams();
  const [activeTab, setActiveTab] = useState("home");
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data = null;
        if (type === "dscr") {
          data = await getDscrById(id);
        } else if (type === "fixflip") {
          data = await getFixflipById(id);
        } else if (type === "construction") {
          data = await getConstructionById(id);
        }
        setSolicitud(data);
      } catch (e) {
        setSolicitud(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, type]);

  const handleback = () => {
    navegate("/requests");
  };

  return (
    <>
      <div className="internal_layout">
        <div className="d-flex align-items-center p-5">
          <button className="btn border-none" onClick={handleback}>
            <img src={Back} alt="back" width={35} />
          </button>
          <h2 className={`${styles.title} fw-bolder my_title_color`}>
            Detalle de solicitud
          </h2>
        </div>
        <div className="d-flex flex-column justify-content-center mx-5">
          <ul className="nav nav-tabs mb-2" id="myTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link${activeTab === "home" ? " active" : ""}`}
                id="home-tab"
                data-bs-toggle="tab"
                data-bs-target="#home"
                type="button"
                role="tab"
                aria-controls="home"
                aria-selected={activeTab === "home"}
                onClick={() => setActiveTab("home")}
              >
                Solicitud
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link${activeTab === "profile" ? " active" : ""}`}
                id="profile-tab"
                data-bs-toggle="tab"
                data-bs-target="#profile"
                type="button"
                role="tab"
                aria-controls="profile"
                aria-selected={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
              >
                Documentos
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link${activeTab === "contact" ? " active" : ""}`}
                id="contact-tab"
                data-bs-toggle="tab"
                data-bs-target="#contact"
                type="button"
                role="tab"
                aria-controls="contact"
                aria-selected={activeTab === "contact"}
                onClick={() => setActiveTab("contact")}
              >
                Pipeline
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link${activeTab === "gestion" ? " active" : ""}`}
                id="gestion-tab"
                data-bs-toggle="tab"
                data-bs-target="#gestion"
                type="button"
                role="tab"
                aria-controls="gestion"
                aria-selected={activeTab === "gestion"}
                onClick={() => setActiveTab("gestion")}
              >
                Gestión Solicitud
              </button>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            <div
              className={`tab-pane fade${activeTab === "home" ? " show active" : ""}`}
              id="home"
              role="tabpanel"
              aria-labelledby="home-tab"
            >
              <div className={`d-flex justify-content-center aling-items-center ${styles.container_section_request}`}>
                {loading ? (
                  <div>Cargando...</div>
                ) : solicitud && type === "dscr" ? (
                  <DscrForm solicitud={solicitud} cliente={solicitud.client} editable={true} />
                ) : solicitud && type === "fixflip" ? (
                  <FixflipForm solicitud={solicitud} cliente={solicitud.client} editable={true} />
                ) : solicitud && type === "construction" ? (
                  <ConstructionForm solicitud={solicitud} cliente={solicitud.client} editable={true} />
                ) : (
                  <div>No se encontró la solicitud</div>
                )}
              </div>
            </div>
            <div
              className={`tab-pane fade${activeTab === "profile" ? " show active" : ""}`}
              id="profile"
              role="tabpanel"
              aria-labelledby="profile-tab"
            >
              <DocumentsRequest requestId={id} requestType={type} />
            </div>
            <div
              className={`tab-pane fade${activeTab === "contact" ? " show active" : ""}`}
              id="contact"
              role="tabpanel"
              aria-labelledby="contact-tab"
            >
              <PipelineRequest />
            </div>
            <div
              className={`tab-pane fade${activeTab === "gestion" ? " show active" : ""}`}
              id="gestion"
              role="tabpanel"
              aria-labelledby="gestion-tab"
            >
              <div>Gestión de la solicitud aquí</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetalleSolicitud;