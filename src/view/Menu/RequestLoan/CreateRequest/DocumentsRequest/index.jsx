import Load from "../../../../../assets/material-symbols_upload.svg";
import Check from "../../../../../assets/lets-icons_check-fill.svg";
import VerifyIcon from "../../../../../assets/verify-icon.png";
import styles from "./style.module.css";

const DocumentsRequest = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes enviar los datos a una API o manejarlos como necesites
    // console.log({ tipo, comentario, enviarCliente });
  };

  return (
    <>
      <div className="container-fluid py-4">
        <div className="row">
          {/* Columna izquierda - Lista de documentos */}
          <div className="col-7">
            <div className="d-flex flex-column gap-3">
              {/* Documento 1 */}
              <div className={`d-flex align-items-center justify-content-between p-3 rounded shadow-sm ${styles.load_document}`}>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "24px", height: "24px" }}
                  >
                    <img src={Check} alt="" />
                  </div>
                  <span className="text-dark">Documento de identidad</span>
                </div>
                <input
                  type="file"
                  id="imageUpload"
                  className="d-none"
                  accept="image/*"
                />
                <label htmlFor="imageUpload" className="btn btn-link p-0 text-muted">
                  <img src={Load} alt="" />
                </label>
              </div>
            </div>

            {/* Botón Guardar Documentos */}
            <div className="mt-4">
              <button
                type="button"
                className="btn btn-primary px-4 py-2 fw-bold"
                style={{
                  backgroundColor: "#1e3a8a",
                  borderColor: "#1e3a8a",
                  borderRadius: "25px",
                }}
              >
                <span className="text-white">GUARDAR DOCUMENTOS</span>
              </button>
            </div>
          </div>

          {/* Columna derecha - Reportar documento */}

          <div className="col-5">
            <form className={styles.comment_box_container} onSubmit={handleSubmit}>
              {/* <div className={styles.comment_icon_wrapper}>
                        <span className={styles.comment_icon}>📝</span>
                    </div> */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                style={{
                  width: "80px",
                  height: "80px",
                  marginBottom: "1rem"
                }}
              >
                <img src={VerifyIcon} alt="verify-icon" />
              </div>
              <h4 className={styles.comment_title}>Crear comentario</h4>
              <select
                className={styles.comment_select}
                // value={tipo}
                onChange={e => setTipo(e.target.value)}
                required
              >
                <option value="">Seleccione el documento</option>
                <option value="identidad">Documento de identidad</option>
                <option value="apartamento">Documento del apartamento</option>
                <option value="ingresos">Documento de ingresos</option>
                <option value="bancario">Documento bancario</option>
              </select>
              <textarea
                className={styles.comment_textarea}
                placeholder="Observaciones sobre el documento a reportar novedad"
                rows={4}
                // value={comentario}
                onChange={e => setComentario(e.target.value)}
                required
              />
              <div className={styles.comment_checkbox_row}>
                <label className={styles.comment_checkbox_label}>
                  ENVIAR AL CLIENTE
                  <input
                    type="checkbox"
                    className={styles.comment_checkbox}
                    // checked={enviarCliente}
                    onChange={e => setEnviarCliente(e.target.checked)}
                  />
                </label>
              </div>
              <button className={styles.comment_button} type="submit">ENVIAR</button>
            </form>
          </div>

          {/* <div className="col-md-6">
            <div className="d-flex justify-content-center">
              <div className={`d-flex flex-column align-items-center box-indication ${styles.container_report}`}>
                {/* Icono y título 
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                      style={{
                        width: "80px",
                        height: "80px",
                      }}
                    >
                      <img src={VerifyIcon} alt="verify-icon" />
                    </div>
                  </div>
                  <h4 className="fw-bold text-dark mb-4">Reportar documento</h4>
                </div>

                {/* Select de documento
                <div className="w-100 mb-4" style={{ maxWidth: "300px" }}>
                  <select className="form-select py-3 text-muted">
                    <option value="">Seleccione el documento</option>
                    <option value="identidad">Documento de identidad</option>
                    <option value="apartamento">Documento del apartamento</option>
                    <option value="ingresos">Documento de ingresos</option>
                    <option value="bancario">Documento bancario</option>
                  </select>
                </div>

                {/* Área de texto 
                <div className="w-100 mb-4" style={{ maxWidth: "300px" }}>
                  <div
                    className="text-center text-muted border rounded"
                    style={{
                      backgroundColor: "#e9ecef",
                      minHeight: "120px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <textarea placeholder="Observaciones sobre el documento a reportar novedad">
                    </textarea>
                  </div>
                </div>

                {/* Botón Enviar 
                <button
                  type="button"
                  className="btn btn-primary px-4 py-2 fw-bold"
                  style={{
                    backgroundColor: "#1e3a8a",
                    borderColor: "#1e3a8a",
                    borderRadius: "25px",
                    minWidth: "120px",
                  }}
                >
                  <span className="text-white">ENVIAR</span>
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default DocumentsRequest;
