import React, { useState, useEffect } from "react";
import Back from "../../../../../assets/back.svg"; 
import { useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import { createSeller } from "../../../../../Api/seller";
import { getCompanies } from "../../../../../Api/admin";

const CreateSeller = () => {
  const navegate = useNavigate(); 
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    celular: "",
    identificacion: "",
    direccion: "",
    contrasena: "",
    confirmarContrasena: "",
    company_id: ""
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [roleError, setRoleError] = useState("");

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

  const handleback = () => {
    navegate('/sellers')
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
    setCompanyError("");
    setRoleError("");
    
    // Validación básica
    if (!formData.nombreCompleto || !formData.email || !formData.celular || !formData.identificacion || !formData.direccion || !formData.contrasena || !formData.company_id) {
      if (!formData.company_id) setCompanyError("Debes seleccionar una compañía");
      setFeedback("Todos los campos son obligatorios, incluyendo la compañía");
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
      company_id: Number(formData.company_id),
      role: "Vendedor"
    };
    
    if (!payload.role) {
      setRoleError("El campo rol es obligatorio");
      setLoading(false);
      return;
    }
    
    try {
      await createSeller(payload);
      setFeedback("¡Vendedor creado exitosamente!");
      setTimeout(() => {
        navegate('/sellers');
      }, 1500);
    } catch (error) {
      console.error('Error al crear vendedor:', error);
      if (error.response?.data?.detail) {
        // Manejar errores específicos del backend
        const errorDetails = error.response.data.detail;
        if (Array.isArray(errorDetails)) {
          const passwordError = errorDetails.find(err => err.loc?.includes('password'));
          if (passwordError) {
            setFeedback(`Error en contraseña: ${passwordError.msg}`);
          } else {
            setFeedback(`Error: ${errorDetails[0]?.msg || 'Error al crear el vendedor'}`);
          }
        } else {
          setFeedback(`Error: ${errorDetails}`);
        }
      } else {
        setFeedback("Error al crear el vendedor. Inténtalo de nuevo.");
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
              Crear vendedor
            </h2>
          </div>
        </div>

      {/* Main Content */}
      <div className="container-fluid p-4">
        <div className="row">
          {/* Form Column */}
          <div className="col-md-7 col-lg-6">
            <form onSubmit={handleSubmit}>
              <div className="row mb-2">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold mb-2" style={{color: "#000"}}>Nombre completo</label>
                  <input
                    type="text"
                    className={`form-control  ${styles.input}`}
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold mb-2" style={{color: "#000"}}>Email</label>
                  <input
                    type="email"
                    className={`form-control  ${styles.input}`}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold mb-2" style={{color: "#000"}}>Celular</label>
                  <input
                    type="tel"
                    className={`form-control  ${styles.input}`}
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold mb-2" style={{color: "#000"}}>Identificación</label>
                  <input
                    type="text"
                    className={`form-control  ${styles.input}`}
                    name="identificacion"
                    value={formData.identificacion}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-12 mb-2">
                  <label className="form-label fw-semibold mb-2" style={{color: "#000"}}>Dirección</label>
                  <input
                    type="text"
                    className={`form-control  ${styles.input}`}
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-12 mb-2">
                  <label className="form-label fw-semibold mb-2" style={{color: "#000"}}>Compañía</label>
                  <select
                    className={`form-select ${styles.input} ${companyError ? 'is-invalid' : ''}`}
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione una compañía</option>
                    {companies && companies.map(({ id, name }) => (
                      <option value={id} key={id}>{name}</option>
                    ))}
                  </select>
                  {companyError && <div className="invalid-feedback d-block">{companyError}</div>}
                </div>
              </div>
              {roleError && (
                <div className="alert alert-danger py-2 mb-3">{roleError}</div>
              )}

              <div className="row mb-5">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold mb-2" style={{color: "#000"}}>Contraseña *</label>
                  <input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className={`form-control  ${styles.input}`}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    minLength={8}
                  />
                  {formData.contrasena && formData.contrasena.length < 8 && (
                    <small className="text-warning">
                      La contraseña debe tener al menos 8 caracteres
                    </small>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold mb-2" style={{color: "#000"}}>Confirmar contraseña *</label>
                  <input
                    type="password"
                    placeholder="Confirma tu contraseña"
                    className={`form-control  ${styles.input}`}
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleInputChange}
                  />
                  {formData.confirmarContrasena && formData.contrasena !== formData.confirmarContrasena && (
                    <small className="text-danger">
                      Las contraseñas no coinciden
                    </small>
                  )}
                </div>
              </div>

              {feedback && (
                <div className={`alert ${feedback.includes("exitosamente") ? "alert-success" : "alert-danger"} py-2 mb-3`}>{feedback}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn text-white fw-semibold px-3 py-2 rounded-pill "
                style={{
                  backgroundColor: "#2c3e50",
                  border: "none",
                  fontSize: "16px",
                  minWidth: "180px",
                }}
              >
                {loading ? "Creando..." : "CREAR"}
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

export default CreateSeller;
