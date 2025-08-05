import React, { useState, useEffect } from "react";
import Back from "../../../../../assets/back.svg"; 
import { useNavigate, useParams } from "react-router-dom";
import styles from "./style.module.css";
import { getProcessorById, updateProcessor } from "../../../../../Api/procesor";
import { getCompanies } from "../../../../../Api/admin";

const DetailProcesor = () => {
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
    role: "Procesador",
    is_active: true
  });
  const [originalData, setOriginalData] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [editMode, setEditMode] = useState(false);

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
      loadProcessorData();
    }
  }, [id]);

  const loadProcessorData = async () => {
    try {
      setLoading(true);
      const data = await getProcessorById(id);
      
      // Manejar la nueva estructura de datos
      const processorData = {
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        identification: data.identification || "",
        address: data.address || "",
        company_id: data.company_id ? String(data.company_id) : "",
        url_profile_photo: data.url_profile_photo || "",
        password: "",
        confirmarContrasena: "",
        role: data.roles?.[0] || "Procesador",
        is_active: data.is_active !== undefined ? data.is_active : true
      };
      
      setFormData(processorData);
      setOriginalData(processorData);
      
      // Por ahora, establecer datos placeholder para workload y assignments
      // En el futuro, estos se obtendrían de endpoints específicos
      setWorkload({
        active_assignments_count: 0,
        pending_requests: 0,
        in_progress_requests: 0,
        completed_requests: 0
      });
      setActiveAssignments([]);
    } catch (error) {
      console.error('Error al cargar procesador:', error);
      setFeedback("Error al cargar el procesador");
    } finally {
      setLoading(false);
    }
  };

  const handleback = () => {
    if (editMode) {
      if (window.confirm('¿Estás seguro de que deseas salir? Los cambios no guardados se perderán.')) {
        navegate('/process');
      }
    } else {
      navegate('/process');
  }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEnableEdit = () => {
    setEditMode(true);
    setFeedback("");
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
      setEditMode(false);
      setFeedback("");
      setFormData(originalData);
      setCompanyError("");
      setRoleError("");
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setFeedback("");
    setCompanyError("");
    setRoleError("");
    
    // Validaciones
    if (!formData.full_name || !formData.phone || !formData.identification || !formData.address || !formData.company_id) {
      if (!formData.company_id) setCompanyError("Debes seleccionar una compañía");
      setFeedback("Todos los campos son obligatorios, incluyendo la compañía");
      setLoading(false);
      return;
    }

    // Validación de contraseña si se está cambiando
    if (formData.password) {
      if (formData.password.length < 8) {
        setFeedback("La contraseña debe tener al menos 8 caracteres");
        setLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmarContrasena) {
        setFeedback("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }
    }

    try {
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

      if (formData.password) {
        payload.password = formData.password;
      }

      await updateProcessor(id, payload);
      setFeedback("¡Procesador actualizado exitosamente!");
      setOriginalData(formData);
      setEditMode(false);
      
      // Recargar datos después de actualizar
      await loadProcessorData();
      
      setTimeout(() => {
        navegate('/process');
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar procesador:', error);
      if (error.response?.data?.detail) {
        // Manejar errores específicos del backend
        const errorDetails = error.response.data.detail;
        if (Array.isArray(errorDetails)) {
          const passwordError = errorDetails.find(err => err.loc?.includes('password'));
          if (passwordError) {
            setFeedback(`Error en contraseña: ${passwordError.msg}`);
          } else {
            setFeedback(`Error: ${errorDetails[0]?.msg || 'Error al actualizar el procesador'}`);
          }
        } else {
          setFeedback(`Error: ${errorDetails}`);
        }
      } else {
        setFeedback("Error al actualizar el procesador. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          url_profile_photo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !editMode) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
    }

  return (
    <div className={`${styles.mainContainer} internal_layout`}>
      <div className={styles.headerSection}>
          <div className="d-flex align-items-start">
            <button className="btn border-none" onClick={handleback}>
              <img src={Back} alt="back" width={35} />
            </button>
            <h2 className={`${styles.title} fw-bolder my_title_color`}>
            {id ? "Detalle del procesador" : "Crear procesador"}
            </h2>
          </div>
        </div>

      <div className={styles.scrollContainer}>
        <div className={styles.section}>
          <div className="card" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
            <div className="card-header" style={{ backgroundColor: '#1B2559', color: 'white', borderRadius: '8px 8px 0 0' }}>
              <h5 className="card-title mb-0 fw-bolder">Información Personal</h5>
            </div>
            <div className="card-body">
        <div className="row">
                <div className="col-md-7">
                  <form onSubmit={handleSaveChanges} autoComplete="off">
                    <div className="row mb-4">
                <div className="col-md-6 mb-3">
                        <label className="form-label my_title_color">Nombre completo</label>
                  <input
                    type="text"
                          className={`form-control ${styles.input}`}
                          name="full_name"
                          value={formData.full_name}
                    onChange={handleInputChange}
                          disabled={!editMode}
                  />
                </div>
                <div className="col-md-6 mb-3">
                        <label className="form-label my_title_color">Email</label>
                  <input
                    type="email"
                          className={`form-control ${styles.input}`}
                    name="email"
                    value={formData.email}
                          disabled
                  />
                </div>
              </div>

                    <div className="row mb-4">
                <div className="col-md-6 mb-3">
                        <label className="form-label my_title_color">Celular</label>
                  <input
                    type="tel"
                          className={`form-control ${styles.input}`}
                          name="phone"
                          value={formData.phone}
                    onChange={handleInputChange}
                          disabled={!editMode}
                  />
                </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label my_title_color">Identificación</label>
                  <input
                    type="text"
                          className={`form-control ${styles.input}`}
                          name="identification"
                          value={formData.identification}
                    onChange={handleInputChange}
                          disabled={!editMode}
                  />
                </div>
              </div>

              <div className="row mb-4">
                      <div className="col-12 mb-3">
                        <label className="form-label my_title_color">Dirección</label>
                  <input
                    type="text"
                          className={`form-control ${styles.input}`}
                          name="address"
                          value={formData.address}
                    onChange={handleInputChange}
                          disabled={!editMode}
                  />
                </div>
              </div>

                    <div className="row mb-4">
                      <div className="col-12 mb-3">
                        <label className="form-label my_title_color">Compañía</label>
                        <select
                          className={`form-select ${styles.input} ${companyError ? 'is-invalid' : ''}`}
                          name="company_id"
                          value={formData.company_id}
                          onChange={handleInputChange}
                          disabled={!editMode}
                        >
                          <option value="">Seleccione una compañía</option>
                          {companies && companies.map(({ id, name }) => (
                            <option value={id} key={id}>{name}</option>
                          ))}
                        </select>
                        {companyError && <div className="invalid-feedback">{companyError}</div>}
                      </div>
                    </div>

                    {/* Campo de Estado */}
                    <div className="row mb-4">
                      <div className="col-12 mb-3">
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
                            Procesador Activo
                          </label>
                        </div>
                        <small className="text-muted">
                          {editMode ? "Desmarca esta casilla para desactivar el procesador" : "Estado actual del procesador"}
                        </small>
                      </div>
                    </div>

                    {editMode && (
                      <div className="row mb-4">
                <div className="col-md-6 mb-3">
                          <label className="form-label my_title_color">Nueva contraseña</label>
                  <input
                    type="password"
                            className={`form-control ${styles.input}`}
                            name="password"
                            value={formData.password}
                    onChange={handleInputChange}
                            placeholder="Dejar en blanco para mantener la actual (mínimo 8 caracteres)"
                  />
                  {formData.password && formData.password.length < 8 && (
                    <small className="text-warning">
                      La contraseña debe tener al menos 8 caracteres
                    </small>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                          <label className="form-label my_title_color">Confirmar contraseña</label>
                  <input
                    type="password"
                            className={`form-control ${styles.input}`}
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleInputChange}
                            placeholder="Confirmar nueva contraseña"
                  />
                  {formData.confirmarContrasena && formData.password !== formData.confirmarContrasena && (
                    <small className="text-danger">
                      Las contraseñas no coinciden
                    </small>
                  )}
                </div>
              </div>
                    )}

              {feedback && (
                      <div className={`alert ${feedback.includes("exitosamente") ? "alert-success" : "alert-danger"} py-2 mb-3`}>
                        {feedback}
                      </div>
              )}

                    <div className="d-flex justify-content-end gap-2">
                      {editMode && (
                        <>
              <button
                            type="submit"
                            disabled={loading}
                            className="btn text-white fw-semibold px-3 py-2 rounded-pill"
                style={{
                              backgroundColor: "#1B2559",
                  border: "none",
                  fontSize: "16px",
                            }}
                          >
                            {loading ? "Guardando..." : "GUARDAR CAMBIOS"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                disabled={loading}
                            className="btn btn-secondary fw-semibold px-3 py-2 rounded-pill"
              >
                            CANCELAR
              </button>
                        </>
                      )}
                    </div>
            </form>
                  {!editMode && (
                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-warning fw-semibold px-3 py-2 rounded-pill"
                        onClick={handleEnableEdit}
                      >
                        ACTUALIZAR
                      </button>
                    </div>
                  )}
          </div>

                <div className="col-md-5 d-flex justify-content-center align-items-start">
            <div className="text-center">
              <div
                className="d-flex align-items-center justify-content-center mb-3 border border-2 border-light rounded"
                style={{
                  width: "300px",
                  height: "300px",
                  backgroundColor: "#e9ecef",
                  borderStyle: "dashed !important",
                        overflow: "hidden",
                        position: "relative"
                }}
              >
                      {formData.url_profile_photo ? (
                        <img
                          src={formData.url_profile_photo}
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      ) : (
                <div className="text-center text-muted">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                  </svg>
                </div>
                      )}
              </div>
              <div className="small text-muted mb-3">300 x 300</div>
              <input
                type="file"
                id="imageUpload"
                className="d-none"
                accept="image/*"
                onChange={handleImageUpload}
                      disabled={!editMode}
              />
                    {editMode && (
              <label
                htmlFor="imageUpload"
                        className="btn text-white fw-semibold px-4 py-2 rounded-pill"
                style={{
                          backgroundColor: "#1B2559",
                  border: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                SUBIR IMAGEN
              </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Estadísticas y Métricas */}
        <div className={styles.section}>
          <div className="card mb-4" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
            <div className="card-header" style={{ backgroundColor: '#1B2559', color: 'white', borderRadius: '8px 8px 0 0' }}>
              <h5 className="card-title mb-0 fw-bolder">Carga de Trabajo</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Nota:</strong> Los datos de carga de trabajo se cargarán próximamente desde el backend.
              </div>
              
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="small my_title_color">Asignaciones Activas</div>
                    <div className="h3 mb-0 my_title_color">{workload?.active_assignments_count || 0}</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="small my_title_color">Pendientes</div>
                    <div className="h3 mb-0 my_title_color">{workload?.pending_requests || 0}</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="small my_title_color">En Progreso</div>
                    <div className="h3 mb-0 my_title_color">{workload?.in_progress_requests || 0}</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="small my_title_color">Completadas</div>
                    <div className="h3 mb-0 my_title_color">{workload?.completed_requests || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 4: Asignaciones Activas */}
        <div className={styles.section}>
          <div className="card" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
            <div className="card-header" style={{ backgroundColor: '#1B2559', color: 'white', borderRadius: '8px 8px 0 0' }}>
              <h5 className="card-title mb-0 fw-bolder">Asignaciones Activas</h5>
            </div>
            <div className="card-body">
              {activeAssignments && activeAssignments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th className="my_title_color">Tipo</th>
                        <th className="my_title_color">Cliente</th>
                        <th className="my_title_color">Estado</th>
                        <th className="my_title_color">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeAssignments.map(assignment => (
                        <tr key={assignment.id}>
                          <td>
                            <span className="badge" style={{ backgroundColor: '#1B2559', color: 'white' }}>
                              {assignment.request_type}
                            </span>
                          </td>
                          <td className="my_title_color">{assignment.client_name}</td>
                          <td>
                            <span 
                              className="badge" 
                              style={{ 
                                backgroundColor: assignment.request_status === 'PENDING' ? '#f8f9fa' : '#e3f2fd',
                                color: '#1B2559'
                              }}
                            >
                              {assignment.request_status}
                            </span>
                          </td>
                          <td>
                            <small className="my_title_color">
                              {new Date(assignment.assigned_at).toLocaleDateString()}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="alert alert-info mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>No hay asignaciones activas</strong>
                    <br />
                    <small className="text-muted">
                      Los datos de asignaciones se cargarán próximamente desde el backend.
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProcesor;
