import React, { useState } from "react";
import styles from "./style.module.css";

const initialState = {
  tipoProducto: "",
  fecha: "",
  nombre: "",
  correo: "",
  telefono: "",
  direccion: "",
  compraRefinanciacion: "",
  hipoteca: false,
  morosidad: false,
  impuestos: false,
  hoi: false,
  llc: false,
  fico: "",
  estadoResidencia: "",
  usoPropiedad: "",
  montoAlquiler: "",
  penalidad: "",
  pagoMensual: "",
  valorTasacion: "",
  unidades: "",
  notas: "",
  dscr: "",
  tipoTransaccion: ""
};

const FormRequest = () => {
  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <form className="container-fluid p-4" onSubmit={handleSubmit}>
      <div className="row gy-1">
        {/* Primera fila */}
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Tipo de producto</label>
          <select
            className={styles.select}
            name="tipoProducto"
            value={form.tipoProducto}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar...</option>
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="terreno">Terreno</option>
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Fecha de diligenciamiento</label>
          <input
            type="date"
            className={styles.input}
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2"></div>
      </div>
      <div className="row gy-1">
        {/* Segunda fila */}
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Nombre del cliente</label>
          <input
            type="text"
            className={styles.input}
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Correo electrónico</label>
          <input
            type="email"
            className={styles.input}
            name="correo"
            value={form.correo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Número de teléfono</label>
          <input
            type="tel"
            className={styles.input}
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="row gy-1">
        {/* Tercera fila */}
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small">Dirección de la propiedad</label>
          <input
            type="text"
            className={styles.input}
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small">¿Compra o refinanciación?</label>
          <input
            type="text"
            className={styles.input}
            name="compraRefinanciacion"
            value={form.compraRefinanciacion}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="row gy-1">
        {/* Fila de checkboxes */}
        <div className="col-md-2 mb-2">
          <div className="form-check">
            <input
              className={styles.checkbox}
              type="checkbox"
              id="hipoteca"
              name="hipoteca"
              checked={form.hipoteca}
              onChange={handleChange}
            />
            <label className="form-check-label text-muted small" htmlFor="hipoteca">
              ¿Tiene hipoteca?
            </label>
          </div>
        </div>
        <div className="col-md-2 mb-2">
          <div className="form-check">
            <input
              className={styles.checkbox}
              type="checkbox"
              id="morosidad"
              name="morosidad"
              checked={form.morosidad}
              onChange={handleChange}
            />
            <label className="form-check-label text-muted small" htmlFor="morosidad">
              ¿Tiene morosidad?
            </label>
          </div>
        </div>
        <div className="col-md-2 mb-2">
          <div className="form-check">
            <input
              className={styles.checkbox}
              type="checkbox"
              id="impuestos"
              name="impuestos"
              checked={form.impuestos}
              onChange={handleChange}
            />
            <label className="form-check-label text-muted small" htmlFor="impuestos">
              ¿Paga impuestos?
            </label>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="form-check">
            <input
              className={styles.checkbox}
              type="checkbox"
              id="hoi"
              name="hoi"
              checked={form.hoi}
              onChange={handleChange}
            />
            <label className="form-check-label text-muted small" htmlFor="hoi">
              ¿HOI vigente?
            </label>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="form-check">
            <input
              className={styles.checkbox}
              type="checkbox"
              id="llc"
              name="llc"
              checked={form.llc}
              onChange={handleChange}
            />
            <label className="form-check-label text-muted small" htmlFor="llc">
              ¿Sujeto bajo LLC?
            </label>
          </div>
        </div>
      </div>
      <div className="row gy-1">
        {/* Quinta fila */}
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">FICO Score</label>
          <input
            type="number"
            className={styles.input}
            name="fico"
            value={form.fico}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Estado de residencia</label>
          <select
            className={styles.select}
            name="estadoResidencia"
            value={form.estadoResidencia}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar estado...</option>
            <option value="ca">California</option>
            <option value="ny">New York</option>
            <option value="tx">Texas</option>
            <option value="fl">Florida</option>
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Uso de la propiedad</label>
          <input
            type="text"
            className={styles.input}
            name="usoPropiedad"
            value={form.usoPropiedad}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="row gy-1">
        {/* Sexta fila */}
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Monto de alquiler</label>
          <input
            type="number"
            className={styles.input}
            name="montoAlquiler"
            value={form.montoAlquiler}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Penalidad por prepago (años)</label>
          <input
            type="number"
            className={styles.input}
            name="penalidad"
            value={form.penalidad}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Importe del pago mensual</label>
          <input
            type="number"
            className={styles.input}
            name="pagoMensual"
            value={form.pagoMensual}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="row gy-1">
        {/* Séptima fila */}
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Valor de tasación</label>
          <input
            type="number"
            className={styles.input}
            name="valorTasacion"
            value={form.valorTasacion}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">N° de unidades de propiedad</label>
          <select
            className={styles.select}
            name="unidades"
            value={form.unidades}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar...</option>
            <option value="1">1 unidad</option>
            <option value="2">2 unidades</option>
            <option value="3">3 unidades</option>
            <option value="4">4+ unidades</option>
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small">Notas</label>
          <textarea
            className={styles.textarea}
            name="notas"
            rows="3"
            value={form.notas}
            onChange={handleChange}
          ></textarea>
        </div>
      </div>
      <div className="row gy-1">
        {/* Octava fila */}
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small">Porcentaje DSCR</label>
          <input
            type="number"
            className={styles.input}
            name="dscr"
            value={form.dscr}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small">Tipo de transacción</label>
          <select
            className={styles.select}
            name="tipoTransaccion"
            value={form.tipoTransaccion}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar tipo...</option>
            <option value="compra">Compra</option>
            <option value="refinanciacion">Refinanciación</option>
            <option value="cashout">Cash-out</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div className="col-12 mt-3">
          <button
            type="submit"
            className={styles.button}
            style={{ minWidth: "200px" }}
          >
            <span className="text-white">CREAR</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormRequest; 
