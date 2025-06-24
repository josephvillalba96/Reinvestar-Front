import React from "react";
import styles from "./style.module.css";
import Back from "../../../../assets/back.svg";
import { useNavigate } from "react-router-dom";

const CreateClient = () => {
  const navegate = useNavigate();

  const handleback = () => {
    navegate("/clients");
  };

  const handleSumit = (e) => {
    e.preventDefault();
  };

  return (
    <div className={`${styles.container} p-5 internal_layout`}>
      <div className="d-flex align-items-center mb-5">
        <button className="btn border-none" onClick={handleback}>
          <img src={Back} alt="back" width={35} />
        </button>
        <h2 className={`${styles.title} fw-bolder my_title_color`}>
          Registrar cliente
        </h2>
      </div>
      <form className={styles.form}>
        <div className={styles.row}>
          <input
            type="text"
            placeholder="Nombre del cliente"
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Nombre de la empresa"
            className={styles.input}
          />
        </div>
        <div className={styles.row}>
          <input
            type="email"
            placeholder="Correo electrónico"
            className={styles.input}
          />
          <input
            type="tel"
            placeholder="Número de teléfono"
            className={styles.input}
          />
        </div>
        <div className={`${styles.row} mb-4`}>
          <input
            type="text"
            placeholder="Dirección de la propiedad"
            className={`${styles.inputFull} me-4`}
          />
          <label className={styles.checkboxContainer}>
            <input type="checkbox" />
            <span>¿Compra o refinanciación?</span>
          </label>
        </div>
        <div className={`${styles.checkboxGroup} mb-4`}>
          <label className={styles.checkboxContainer}>
            <input type="checkbox" /> <span>¿Tiene hipoteca?</span>
          </label>
          <label className={styles.checkboxContainer}>
            <input type="checkbox" /> <span>¿Tiene morosidad?</span>
          </label>
          <label className={styles.checkboxContainer}>
            <input type="checkbox" /> <span>¿Paga impuestos?</span>
          </label>
          <label className={styles.checkboxContainer}>
            <input type="checkbox" /> <span>¿HOA vigente?</span>
          </label>
          <label className={styles.checkboxContainer}>
            <input type="checkbox" /> <span>¿Sujeto bajo LLC?</span>
          </label>
        </div>
        <button type="submit" className={styles.button} onSubmit={handleSumit}>
          CREAR
        </button>
      </form>
    </div>
  );
};

export default CreateClient;
