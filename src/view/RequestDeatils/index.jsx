import React from 'react';
import styles from './DetalleSolicitud.module.css';

const DetalleSolicitud = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Détalles de la solicitud</h1>
      
      <div className={styles.tabs}>
        <span className={styles.activeTab}>Solicitud</span>
        <span className={styles.tab}>Documentos</span>
        <span className={styles.tab}>Pipeline</span>
      </div>
      
      <div className={styles.detailsContainer}>
        <div className={styles.detailSection}>
          <div className={styles.detailItem}>
            <span className={styles.label}>Nombre del cliente</span>
            <span className={styles.value}>Guillermo Antonio González Betancur</span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.label}>Fecha de diligenciamiento</span>
            <span className={styles.value}>01/05/2025</span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.label}>Tipo de producto</span>
            <span className={styles.value}>DSCR</span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.label}>Correo electrónico</span>
            <span className={styles.value}>GuillermoGonzalez@outlook.com</span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.label}>Número de teléfono</span>
            <span className={styles.value}>+57 3017605472</span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.label}>Dirección de la propiedad</span>
            <span className={styles.value}>12345 Avenue St 1287 St George</span>
          </div>
        </div>
        
        <div className={styles.optionsSection}>
          <div className={styles.optionsRow}>
            <button className={styles.optionButton}>
              <span className={styles.checkbox}></span>Correo a información
            </button>
            <button className={styles.optionButton}>
              <span className={styles.checkbox}></span>Treve hipótesis
            </button>
            <button className={styles.optionButton}>
              <span className={styles.checkbox}></span>Treve mensajes
            </button>
          </div>
          
          <div className={styles.optionsRow}>
            <button className={styles.optionButton}>
              <span className={styles.checkbox}></span>Pagar impuestas
            </button>
            <button className={styles.optionButton}>
              <span className={styles.checkbox}></span>PSX superior
            </button>
            <button className={styles.optionButton}>
              <span className={styles.checkbox}></span>Sujeto bajo LLC
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.dataSection}>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>ECO Score</span>
          <span className={styles.dataValue}>8</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Monto de dijular</span>
          <span className={styles.dataValue}>180.00</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Veter de tracción</span>
          <span className={styles.dataValue}>100.000</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>DSCR</span>
          <span className={styles.dataValue}>75%</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Tipo de transacción</span>
          <span className={styles.dataValue}>Compor / Refil</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Usa de la propiedad</span>
          <span className={styles.dataValue}>Projeto / Alquiler</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Importe del pago mensual</span>
          <span className={styles.dataValue}>1.000</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Unidades de propiedad</span>
          <span className={styles.dataValue}>3</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Estado de residencia</span>
          <span className={styles.dataValue}>Preopreobodo</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Toda sugestión</span>
          <span className={styles.dataValue}>1.8%</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Valor soporte de pozo</span>
          <span className={styles.dataValue}>1.000</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Cuales</span>
          <span className={styles.dataValue}>25</span>
        </div>
        
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Estado de residencia</span>
          <span className={styles.dataValue}>Revista</span>
        </div>
      </div>
    </div>
  );
};

export default DetalleSolicitud;