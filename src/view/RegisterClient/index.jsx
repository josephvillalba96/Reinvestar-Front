import React from 'react';
import styles from './RegistrarCliente.module.css';

const RegistrarCliente = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Registrar cliente</h2>
      <form className={styles.form}>
        <div className={styles.row}>
          <input type="text" placeholder="Nombre del cliente" className={styles.input} />
          <input type="text" placeholder="Nombre de la empresa" className={styles.input} />
        </div>
        <div className={styles.row}>
          <input type="email" placeholder="Correo electrónico" className={styles.input} />
          <input type="tel" placeholder="Número de teléfono" className={styles.input} />
        </div>
        <div className={styles.row}>
          <input type="text" placeholder="Dirección de la propiedad" className={styles.inputFull} />
          <label className={styles.checkboxContainer}>
            <input type="checkbox" />
            <span>¿Compra o refinanciación?</span>
          </label>
        </div>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxContainer}><input type="checkbox" /> <span>¿Tiene hipoteca?</span></label>
          <label className={styles.checkboxContainer}><input type="checkbox" /> <span>¿Tiene morosidad?</span></label>
          <label className={styles.checkboxContainer}><input type="checkbox" /> <span>¿Paga impuestos?</span></label>
          <label className={styles.checkboxContainer}><input type="checkbox" /> <span>¿HOA vigente?</span></label>
          <label className={styles.checkboxContainer}><input type="checkbox" /> <span>¿Sujeto bajo LLC?</span></label>
        </div>
        <button type="submit" className={styles.button}>CREAR</button>
      </form>
    </div>
  );
};

export default RegistrarCliente;
