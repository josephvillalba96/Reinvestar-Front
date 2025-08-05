import React, { useState } from "react";
import Back from "../../../../assets/back.svg";
import styles from "./style.module.css";
import { useNavigate } from "react-router-dom";
import FormRequest from "./FormRequest";
import DocumentsRequest from "./DocumentsRequest";
import PipelineRequest from "./PipelineRequest";

const CreateRequest = () => {
  const navegate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [createdRequestId, setCreatedRequestId] = useState(null);
  const [createdRequestType, setCreatedRequestType] = useState(null);

  const handleback = () => {
    navegate("/requests");
  };

  // Callback para cambiar a la pestaña de documentos y guardar el id de la solicitud
  const goToDocumentsTab = (requestId, requestType) => {
    setCreatedRequestId(requestId);
    setCreatedRequestType(requestType);
    setActiveTab("profile");
  };

  return (
    <>
      <div className="internal_layout">
        <div className="d-flex align-items-center p-5">
          <button className="btn border-none" onClick={handleback}>
            <img src={Back} alt="back" width={35} />
          </button>
          <h2 className={`${styles.title} fw-bolder my_title_color`}>
            Crear solicitud
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
            {/* <li className="nav-item" role="presentation">
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
            </li> */}
          </ul>
          <div className="tab-content" id="myTabContent">
            <div
              className={`tab-pane fade${activeTab === "home" ? " show active" : ""}`}
              id="home"
              role="tabpanel"
              aria-labelledby="home-tab"
            >
             <div className={`${"d-flex justify-content-center aling-items-center"} ${styles.container_section_request}`}>
                <FormRequest goToDocumentsTab={goToDocumentsTab} /> 
             </div>
            </div>
            <div
              className={`tab-pane fade${activeTab === "profile" ? " show active" : ""}`}
              id="profile"
              role="tabpanel"
              aria-labelledby="profile-tab"
            >
              <DocumentsRequest requestId={createdRequestId} requestType={createdRequestType}/>
            </div>
            {/* <div
              className={`tab-pane fade${activeTab === "contact" ? " show active" : ""}`}
              id="contact"
              role="tabpanel"
              aria-labelledby="contact-tab"
            >
              <PipelineRequest />
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRequest;
