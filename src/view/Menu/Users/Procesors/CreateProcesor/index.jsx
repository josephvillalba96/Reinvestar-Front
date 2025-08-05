import React, { useState } from "react";
import Back from "../../../../../assets/back.svg"; 
import { useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import { createProcessor } from "../../../../../Api/procesor";

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
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    
    // Validación básica
    if (!formData.nombreCompleto || !formData.email || !formData.celular || !formData.identificacion || !formData.direccion || !formData.contrasena) {
      setFeedback("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }
    
    // Validación de contraseña
    if (formData.contrasena.length < 8) {
      setFeedback("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }
    
    if (formData.contrasena !== formData.confirmarContrasena) {
      setFeedback("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    
    // Mapeo de campos al formato esperado por la API
    const payload = {
      full_name: formData.nombreCompleto,
      email: formData.email,
      phone: formData.celular,
      identification: formData.identificacion,
      address: formData.direccion,
      password: formData.contrasena,
      role: "Procesador"
    };
    
    try {
      await createProcessor(payload);
      setFeedback("¡Procesador creado exitosamente!");
      setTimeout(() => {
        navegate('/process');
      }, 1500);
    } catch (error) {
      console.error('Error al crear procesador:', error);
      if (error.response?.data?.detail) {
        // Manejar errores específicos del backend
        const errorDetails = error.response.data.detail;
        if (Array.isArray(errorDetails)) {
          const passwordError = errorDetails.find(err => err.loc?.includes('password'));
          if (passwordError) {
            setFeedback(`Error en contraseña: ${passwordError.msg}`);
          } else {
            setFeedback(`Error: ${errorDetails[0]?.msg || 'Error al crear el procesador'}`);
          }
        } else {
          setFeedback(`Error: ${errorDetails}`);
        }
      } else {
        setFeedback("Error al crear el procesador. Inténtalo de nuevo.");
      }
    }
    setLoading(false);
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
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className={`form-control  ${styles.input}`}
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <input
                    type="email"
                    placeholder="Email"
                    className={`form-control  ${styles.input}`}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  <input
                    type="tel"
                    placeholder="Celular"
                    className={`form-control  ${styles.input}`}
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <input
                    type="text"
                    placeholder="Identificación"
                    className={`form-control  ${styles.input}`}
                    name="identificacion"
                    value={formData.identificacion}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-12 mb-2">
                  <input
                    type="text"
                    placeholder=" Dirección"
                    className={`form-control  ${styles.input}`}
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="row mb-5">
                <div className="col-md-6 mb-3">
                  <input
                    type="password"
                    placeholder="Contraseña (mínimo 8 caracteres)"
                    className={`form-control  ${styles.input}`}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    disabled={loading}
                    minLength={8}
                  />
                  {formData.contrasena && formData.contrasena.length < 8 && (
                    <small className="text-warning">
                      La contraseña debe tener al menos 8 caracteres
                    </small>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    className={`form-control  ${styles.input}`}
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  {formData.confirmarContrasena && formData.contrasena !== formData.confirmarContrasena && (
                    <small className="text-danger">
                      Las contraseñas no coinciden
                    </small>
                  )}
                </div>
              </div>

              {feedback && (
                <div className={`alert ${feedback.includes('exitosamente') ? 'alert-success' : 'alert-danger'} py-2 mb-3`}>{feedback}</div>
              )}

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
                disabled={loading}
              >
                {loading ? "CREANDO..." : "CREAR"}
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
