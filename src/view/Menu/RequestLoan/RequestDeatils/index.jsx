import React, { useState, useEffect } from "react";
import Back from "../../../../assets/back.svg";
import styles from "./DetalleSolicitud.module.css";
import { useNavigate, useParams } from "react-router-dom";
import DocumentsRequest from "./DocumentsRequest";
import PipelineRequest from "./PipelineRequest";
import ProcessorForm from "./Processor";
import StatusManagement from "./StatusManagement";
import IntentionLetter from "./IntentionLetter";
import { getDscrById } from "../../../../Api/dscr";
import { getClientById } from "../../../../Api/client";
import DscrForm from "./FormRequest/Dscr";
import FixflipForm from "./FormRequest/Fixflip";
import ConstructionForm from "./FormRequest/Construction";
import { getFixflipById } from "../../../../Api/fixflip";
import { getConstructionById } from "../../../../Api/construction";

const DetalleSolicitud = () => {
  const navegate = useNavigate();
  const { id, type } = useParams();
  const [activeTab, setActiveTab] = useState("home");
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

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
        console.error('Error fetching data:', e);
        setSolicitud(null);
      }
      setLoading(false);
    };
    
    if (id && type) {
      fetchData();
    }
  }, [id, type]);

  // Cargar usuario actual al inicio
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const handleback = () => {
    navegate("/requests");
  };

  // Función para verificar si el usuario puede ver el tab de procesadores
  const canViewProcessorTab = () => {
    return currentUser && currentUser.roles?.[0] !== "Procesador";
  };

  // Función para verificar si el usuario puede ver el tab de estado
  const canViewStatusTab = () => {
    return currentUser && currentUser.roles?.[0] !== "Vendedor";
  };

  // Redirigir al tab home si el usuario es procesador y está en el tab de procesadores
  // o si es vendedor y está en el tab de estado
  useEffect(() => {
    if (currentUser) {
      const userRole = currentUser.roles?.[0];
      if ((userRole === "Procesador" && activeTab === "processor") ||
          (userRole === "Vendedor" && activeTab === "status")) {
        setActiveTab("home");
      }
    }
  }, [currentUser, activeTab]);

  return (
    <>
      <div className={`${styles.scroll_section} internal_layout`}>
        <div className="d-flex align-items-center p-5">
          <button className="btn border-none" onClick={handleback}>
            <img src={Back} alt="back" width={35} />
          </button>
          <div className="d-flex flex-column">
            <h2 className={`${styles.title} fw-bolder my_title_color`}>
              Detalle de solicitud
            </h2>
            {solicitud && (
              <div className="d-flex align-items-center gap-3 mt-2">
                <span className="badge bg-primary fs-6">
                  <strong>ID: {solicitud.id}</strong>
                </span>
                <span className="badge bg-secondary fs-6">
                  <strong>Tipo: {type?.toUpperCase()}</strong>
                </span>
              </div>
            )}
          </div>
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
            {canViewProcessorTab() && (
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link${activeTab === "processor" ? " active" : ""}`}
                  id="processor-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#processor"
                  type="button"
                  role="tab"
                  aria-controls="processor"
                  aria-selected={activeTab === "processor"}
                  onClick={() => setActiveTab("processor")}
                >
                  Procesador
                </button>
              </li>
            )}
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
            {solicitud?.status === "ACCEPTED" && (
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link${activeTab === "intention" ? " active" : ""}`}
                  id="intention-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#intention"
                  type="button"
                  role="tab"
                  aria-controls="intention"
                  aria-selected={activeTab === "intention"}
                  onClick={() => setActiveTab("intention")}
                >
                  Carta de Intención
                </button>
              </li>
            )}
            {canViewStatusTab() && (
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link${activeTab === "status" ? " active" : ""}`}
                  id="status-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#status"
                  type="button"
                  role="tab"
                  aria-controls="status"
                  aria-selected={activeTab === "status"}
                  onClick={() => setActiveTab("status")}
                >
                  Estado
                </button>
              </li>
            )}
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
            {canViewProcessorTab() && (
              <div
                className={`tab-pane fade${activeTab === "processor" ? " show active" : ""}`}
                id="processor"
                role="tabpanel"
                aria-labelledby="processor-tab"
              >
                <ProcessorForm key={`${type}-${id}`} requestId={id} requestType={type} />
              </div>
            )}
            <div
              className={`tab-pane fade${activeTab === "contact" ? " show active" : ""}`}
              id="contact"
              role="tabpanel"
              aria-labelledby="contact-tab"
            >
              <PipelineRequest requestId={id} requestType={type} />
            </div>
            {solicitud?.status === "ACCEPTED" && (
              <div
                className={`tab-pane fade${activeTab === "intention" ? " show active" : ""}`}
                id="intention"
                role="tabpanel"
                aria-labelledby="intention-tab"
              >
                <IntentionLetter 
                  requestId={id} 
                  requestType={type} 
                  solicitud={solicitud} 
                />
              </div>
            )}
            {canViewStatusTab() && (
              <div
                className={`tab-pane fade${activeTab === "status" ? " show active" : ""}`}
                id="status"
                role="tabpanel"
                aria-labelledby="status-tab"
              >
                <StatusManagement 
                  requestId={id} 
                  requestType={type} 
                  currentStatus={solicitud?.status || "PENDING"}
                  onStatusChange={(newStatus) => {
                    setSolicitud(prev => ({
                      ...prev,
                      status: newStatus
                    }));
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DetalleSolicitud;