import React from "react";
import Back from "../../../../assets/back.svg";
import styles from "./createRequest.module.css";
import { useNavigate } from "react-router-dom";
import FormRequest from "./FormRequest";
import DocumentsRequest from "./DocumentsRequest";

const CreateRequest = () => {
  const navegate = useNavigate();

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
            Crear solicitud
          </h2>
        </div>
        <div className="d-flex flex-column justify-content-center mx-5">
          <ul className="nav nav-tabs mb-2" id="myTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active"
                id="home-tab"
                data-bs-toggle="tab"
                data-bs-target="#home"
                type="button"
                role="tab"
                aria-controls="home"
                aria-selected="true"
              >
                Solicitud
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="profile-tab"
                data-bs-toggle="tab"
                data-bs-target="#profile"
                type="button"
                role="tab"
                aria-controls="profile"
                aria-selected="false"
              >
                Documentos
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="contact-tab"
                data-bs-toggle="tab"
                data-bs-target="#contact"
                type="button"
                role="tab"
                aria-controls="contact"
                aria-selected="false"
              >
                Pipeline
              </button>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            <div
              className="tab-pane fade show active"
              id="home"
              role="tabpanel"
              aria-labelledby="home-tab"
            >
             <div className={`${"d-flex justify-content-center aling-items-center"} ${styles.container_section_request}`}>
                <FormRequest /> 
             </div>
            </div>
            <div
              className="tab-pane fade"
              id="profile"
              role="tabpanel"
              aria-labelledby="profile-tab"
            >
              <DocumentsRequest/>
            </div>
            <div
              className="tab-pane fade"
              id="contact"
              role="tabpanel"
              aria-labelledby="contact-tab"
            >
              ...
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRequest;
