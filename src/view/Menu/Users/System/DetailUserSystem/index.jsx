import React, { useState, useEffect } from "react";
import Back from "../../../../../assets/back.svg";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./style.module.css";
import { getAdminById, updateAdmin } from "../../../../../Api/admin";
import { getCompanies } from "../../../../../Api/admin";

const DetailUserSystem = () => {
  const navegate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    identification: "",
    address: "",
    company_id: "",
    url_profile_photo: "",
    password: "",
    confirmarContrasena: "",
    role: "Admin",
    is_active: true
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

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

  useEffect(() => {
    if (id) {
      setLoading(true);
      getAdminById(id)
        .then((data) => {
          setFormData({
            full_name: data.full_name || "",
            email: data.email || "",
            phone: data.phone || "",
            identification: data.identification || "",
            address: data.address || "",
            company_id: data.company_id ? String(data.company_id) : "",
            url_profile_photo: data.url_profile_photo || "",
            password: "",
            confirmarContrasena: "",
            role: data.role || "Admin",
            is_active: data.is_active !== undefined ? data.is_active : true
          });
        })
        .catch(() => setFeedback("Error al cargar el usuario"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleback = () => {
    navegate('/users');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUpdate = () => {
    setEditMode(true);
    setFeedback("");
    setChangePassword(false);
  };

  const handleChangePasswordToggle = () => {
    setChangePassword(!changePassword);
    if (!changePassword) {
      // Si se activa el cambio de contraseña, limpiar los campos
      setFormData(prev => ({
        ...prev,
        password: "",
        confirmarContrasena: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    setCompanyError("");
    setRoleError("");
    if (!formData.full_name || !formData.phone || !formData.identification || !formData.address || !formData.company_id) {
      if (!formData.company_id) setCompanyError("Debes seleccionar una compañía");
      setFeedback("Todos los campos son obligatorios, incluyendo la compañía");
      setLoading(false);
      return;
    }
    // Validar contraseña solo si se quiere cambiar
    if (changePassword) {
      if (!formData.password || !formData.confirmarContrasena) {
        setFeedback("Si quieres cambiar la contraseña, ambos campos son obligatorios");
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmarContrasena) {
        setFeedback("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }
    }
    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      identification: formData.identification,
      address: formData.address,
      company_id: Number(formData.company_id),
      url_profile_photo: formData.url_profile_photo,
      role: formData.role,
      is_active: formData.is_active
    };
    // Solo incluir contraseña en el payload si se quiere cambiar
    if (changePassword && formData.password) {
      payload.password = formData.password;
    }
    if (!payload.role) {
      setRoleError("El campo rol es obligatorio");
      setLoading(false);
      return;
    }
    try {
      await updateAdmin(id, payload);
      setFeedback("¡Usuario actualizado exitosamente!");
      setEditMode(false);
      setTimeout(() => {
        navegate('/users');
      }, 1500);
    } catch (error) {
      setFeedback("Error al actualizar el usuario. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, url_profile_photo: file.name }));
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
            {id ? "Detalle del usuario" : "Crear usuario"}
          </h2>
        </div>
      </div>
      <div className="container-fluid p-4">
        <div className="row">
          <div className="col-md-7 col-lg-6">
         
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="row mb-2">
                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className={`form-control  ${styles.input}`}
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <input
                    type="email"
                    placeholder="Email"
                    className={`form-control  ${styles.input}`}
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  <input
                    type="tel"
                    placeholder="Celular"
                    className={`form-control  ${styles.input}`}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <input
                    type="text"
                    placeholder="Identificación"
                    className={`form-control  ${styles.input}`}
                    name="identification"
                    value={formData.identification}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div className="row mb-4">
                <div className="col-12 mb-2">
                  <input
                    type="text"
                    placeholder="Dirección"
                    className={`form-control  ${styles.input}`}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div className="row mb-4">
                <div className="col-12 mb-2">
                  <select
                    className={`form-select ${styles.input} ${companyError ? 'is-invalid' : ''}`}
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleInputChange}
                    required
                    disabled={!editMode}
                  >
                    <option value="">Seleccione una compañía</option>
                    {companies && companies.map(({ id, name }) => (
                      <option value={id} key={id}>{name}</option>
                    ))}
                  </select>
                  {companyError && <div className="invalid-feedback d-block">{companyError}</div>}
                </div>
              </div>

                             {/* Campo de Estado */}
               <div className="row mb-4">
                 <div className="col-12 mb-2">
                   <div className="form-check">
                     <input
                       className="form-check-input"
                       type="checkbox"
                       id="is_active"
                       name="is_active"
                       checked={formData.is_active}
                       onChange={handleInputChange}
                       disabled={!editMode}
                     />
                     <label className="form-check-label my_title_color" htmlFor="is_active">
                       Usuario Activo
                     </label>
                   </div>
                   <small className="text-muted">
                     {editMode ? "Desmarca esta casilla para desactivar el usuario" : "Estado actual del usuario"}
                   </small>
                 </div>
               </div>

               {/* Checkbox para cambiar contraseña */}
               {editMode && (
                 <div className="row mb-4">
                   <div className="col-12 mb-2">
                     <div className="form-check">
                       <input
                         className="form-check-input"
                         type="checkbox"
                         id="changePassword"
                         checked={changePassword}
                         onChange={handleChangePasswordToggle}
                       />
                       <label className="form-check-label my_title_color" htmlFor="changePassword">
                         Cambiar contraseña
                       </label>
                     </div>
                     <small className="text-muted">
                       Marca esta casilla si quieres cambiar la contraseña del usuario
                     </small>
                   </div>
                 </div>
               )}

              {roleError && (
                <div className="alert alert-danger py-2 mb-3">{roleError}</div>
              )}
                             {/* Campos de contraseña - solo visibles si se quiere cambiar */}
               {changePassword && (
                 <div className="row mb-5">
                   <div className="col-md-6 mb-3">
                     <label className="form-label fw-semibold mb-2" style={{color: "#000"}}>Nueva contraseña *</label>
                     <input
                       type="password"
                       placeholder="Nueva contraseña"
                       className={`form-control  ${styles.input}`}
                       name="password"
                       value={formData.password}
                       onChange={handleInputChange}
                       required
                     />
                     <small className="text-muted">Campo obligatorio para cambiar contraseña</small>
                   </div>
                   <div className="col-md-6 mb-3">
                     <label className="form-label fw-semibold mb-2" style={{color: "#000"}}>Confirmar nueva contraseña *</label>
                     <input
                       type="password"
                       placeholder="Confirmar nueva contraseña"
                       className={`form-control  ${styles.input}`}
                       name="confirmarContrasena"
                       value={formData.confirmarContrasena}
                       onChange={handleInputChange}
                       required
                     />
                     <small className="text-muted">Campo obligatorio para cambiar contraseña</small>
                   </div>
                 </div>
               )}
              {feedback && (
                <div className={`alert ${feedback.includes("exitosamente") ? "alert-success" : "alert-danger"} py-2 mb-3`}>{feedback}</div>
              )}
              {editMode && (
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
                  {loading ? "Guardando..." : "GUARDAR CAMBIOS"}
                </button>
              )}
            </form>

            {!editMode && (
              <button
                type="button"
                className="btn btn-warning fw-semibold px-3 py-2 rounded-pill me-3 mb-3"
                style={{ minWidth: "180px" }}
                onClick={handleUpdate}
              >
                ACTUALIZAR
              </button>
            )}
          </div>
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

export default DetailUserSystem;
