import React, { useState } from "react";
import styles from "./style.module.css";
import VerifyIcon from "../../../../../assets/verify-icon.png";

const pipelineData = [
    {
        tipo: "Estado",
        descripcion: "Se ha cambiado el estado a APROBADO",
        fecha: "01-05-2025 - 3:20 am"
    },
    {
        tipo: "Comentario",
        descripcion: "Por favor revisar que se firme el documento lo antes posible",
        fecha: "01-05-2025 - 3:20 am"
    },
    {
        tipo: "Documento",
        descripcion: "El documento de la propiedad no es legible, por favor cargar nuevamente",
        fecha: "01-05-2025 - 3:20 am"
    },
    {
        tipo: "Estado",
        descripcion: "Se ha cambiado el estado a PENDIENTE",
        fecha: "01-05-2025 - 3:20 am"
    },
    {
        tipo: "Proceso",
        descripcion: "Se ha asignado la solicitud al Procesador para su gestión",
        fecha: "01-05-2025 - 3:20 am"
    },
    {
        tipo: "Estado",
        descripcion: "Se ha cambiado el estado a CREADO",
        fecha: "01-05-2025 - 3:20 am"
    }
];

const PipelineRequest = () => {
    const [tipo, setTipo] = useState("");
    const [comentario, setComentario] = useState("");
    const [enviarCliente, setEnviarCliente] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí puedes enviar los datos a una API o manejarlos como necesites
        console.log({ tipo, comentario, enviarCliente });
    };

    return (
        <div className="row">
            <div className="col-7">
                <div className={styles.pipeline_container}>
                    {/* <h3 className={styles.title}>Detalles de la solicitud</h3> */}
                    <div className={styles.steps_list}>
                        {pipelineData.map((item, idx) => (
                            <div key={idx} className={styles.step_item}>
                                <div className={styles.step_header}>
                                    <span className={styles.step_type}>{item.tipo}</span>
                                    <span className={styles.step_date}>{item.fecha}</span>
                                </div>
                                <div className={styles.step_desc}>{item.descripcion}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
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
                        marginBottom:"1rem"
                      }}
                    >
                      <img src={VerifyIcon} alt="verify-icon" />
                    </div>
                    <h4 className={styles.comment_title}>Crear comentario</h4>
                    <select
                        className={styles.comment_select}
                        value={tipo}
                        onChange={e => setTipo(e.target.value)}
                        required
                    >
                        <option value="">Tipo de Actividad</option>
                        <option value="Comentario">Comentario</option>
                        <option value="Estado">Estado</option>
                        <option value="Documento">Documento</option>
                        <option value="Proceso">Proceso</option>
                    </select>
                    <textarea
                        className={styles.comment_textarea}
                        placeholder="Observaciones sobre el documento a reportar novedad"
                        rows={4}
                        value={comentario}
                        onChange={e => setComentario(e.target.value)}
                        required
                    />
                    <div className={styles.comment_checkbox_row}>
                        <label className={styles.comment_checkbox_label}>
                            ENVIAR AL CLIENTE
                            <input
                                type="checkbox"
                                className={styles.comment_checkbox}
                                checked={enviarCliente}
                                onChange={e => setEnviarCliente(e.target.checked)}
                            />
                        </label>
                    </div>
                    <button className={styles.comment_button} type="submit">ENVIAR</button>
                </form>
            </div>
        </div>
    );
};

export default PipelineRequest; 