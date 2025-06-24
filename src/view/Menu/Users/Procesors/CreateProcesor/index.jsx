import React, { useState } from "react";
import Back from "../../../../../assets/back.svg"; 
import { useNavigate } from "react-router-dom";
import styles from "./style.module.css";

const CreateProcesor = () => {
  const navegate = useNavigate(); 
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    celular: "",
    identificacion: "",
    direccion: "",
    contrasena: "",
    confirmarContrasena: "",
  });


  const handleback = () => {
    navegate('/process')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del formulario:", formData);
    alert("Formulario enviado (datos en consola)");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Imagen seleccionada:", file.name);
      alert(`Imagen "${file.name}" seleccionada`);
    }
  };

  return (
    <div className="internal_layout">
       <div className="container-fluid mb-4">
          <div className="d-flex align-items-start">
            <button className="btn border-none" onClick={handleback}>
              <img src={Back} alt="back" width={35} />
            </button>
            <h2 className={`${styles.title} fw-bolder my_title_color`}>
              Crear Procesador
            </h2>
          </div>
        </div>

      {/* Main Content */}
      <div className="container-fluid p-4">
        <div className="row">
          {/* Form Column */}
          <div className="col-md-7 col-lg-6">
            <form>
              <div className="row mb-2">
                <div className="col-md-6 mb-3">
                  {/* <label className="form-label text-muted small">
                    Nombre completo
                  </label> */}
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className={`form-control  ${styles.input}`}
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleInputChange}
                   
                  />
                </div>
                <div className="col-md-6 mb-3">
                  {/* <label className="form-label text-muted small">Email</label> */}

                  <input
                    type="email"
                    placeholder="Email"
                    className={`form-control  ${styles.input}`}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                   
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  {/* <label className="form-label text-muted small">Celular</label> */}
                  <input
                    type="tel"
                    placeholder="Celular"
                    className={`form-control  ${styles.input}`}
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                   
                  />
                </div>
                <div className="col-md-6 mb-2">
                  {/* <label className="form-label text-muted small">
                    Identificación
                  </label> */}
                  <input
                    type="text"
                    placeholder="Identificación"
                    className={`form-control  ${styles.input}`}
                    name="identificacion"
                    value={formData.identificacion}
                    onChange={handleInputChange}
                   
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-12 mb-2">
                  {/* <label className="form-label text-muted small">
                    Dirección
                  </label> */}
                  <input
                    type="text"
                    placeholder=" Dirección"
                    className={`form-control  ${styles.input}`}
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                   
                  />
                </div>
              </div>

              <div className="row mb-5">
                <div className="col-md-6 mb-3">
                  {/* <label className="form-label text-muted small">
                    Contraseña
                  </label> */}
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className={`form-control  ${styles.input}`}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                   
                  />
                </div>
                <div className="col-md-6 mb-3">
                  {/* <label className="form-label text-muted small">
                    Confirmar contraseña
                  </label> */}
                  <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    className={`form-control  ${styles.input}`}
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleInputChange}
                   
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="btn text-white fw-semibold px-3 py-2 rounded-pill "
                style={{
                  backgroundColor: "#2c3e50",
                  border: "none",
                  fontSize: "16px",
                  minWidth: "180px",
                }}
              >
                CREAR
              </button>
            </form>
          </div>

          {/* Image Upload Column */}
          <div className="col-md-5 col-lg-6 d-flex justify-content-center align-items-start">
            <div className="text-center">
              <div
                className="d-flex align-items-center justify-content-center mb-3 border border-2 border-light rounded"
                style={{
                  width: "300px",
                  height: "300px",
                  backgroundColor: "#e9ecef",
                  borderStyle: "dashed !important",
                }}
              >
                <div className="text-center text-muted">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                  </svg>
                </div>
              </div>
              <div className="small text-muted mb-3">300 x 300</div>
              <input
                type="file"
                id="imageUpload"
                className="d-none"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="imageUpload"
                className="btn text-white fw-semibold px-4 py-2 rounded-pill "
                style={{
                  backgroundColor: "#2c3e50",
                  border: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                SUBIR IMAGEN
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProcesor;
