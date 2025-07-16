import React, { useState } from "react";
import styles from "../style.module.css";

const initialState = {
  property_type: "",
  property_address: "",
  property_city: "",
  property_state: "",
  property_zip: "",
  loan_amount: 0,
  purchase_price: 0,
  rehab_cost: 0,
  arv: 0,
  comments: ""
};

const FixflipForm = ({ client_id }) => {
  const [form, setForm] = useState({ ...initialState });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = { ...form, client_id: Number(client_id) };
    console.log("Datos Fixflip:", dataToSend);
    // Aquí puedes enviar dataToSend a la API
  };

  return (
    <form className="container-fluid" onSubmit={handleSubmit}>
      <div className="row gy-1">
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small mb-1">Tipo de propiedad</label>
          <input
            type="text"
            className={styles.input}
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small mb-1">Dirección de la propiedad</label>
          <input
            type="text"
            className={styles.input}
            name="property_address"
            value={form.property_address}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small mb-1">Ciudad</label>
          <input
            type="text"
            className={styles.input}
            name="property_city"
            value={form.property_city}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small mb-1">Estado</label>
          <input
            type="text"
            className={styles.input}
            name="property_state"
            value={form.property_state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small mb-1">Código postal</label>
          <input
            type="text"
            className={styles.input}
            name="property_zip"
            value={form.property_zip}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small mb-1">Monto del préstamo</label>
          <input
            type="number"
            className={styles.input}
            name="loan_amount"
            value={form.loan_amount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small mb-1">Precio de compra</label>
          <input
            type="number"
            className={styles.input}
            name="purchase_price"
            value={form.purchase_price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small mb-1">Costo de remodelación</label>
          <input
            type="number"
            className={styles.input}
            name="rehab_cost"
            value={form.rehab_cost}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small mb-1">ARV (valor después de remodelar)</label>
          <input
            type="number"
            className={styles.input}
            name="arv"
            value={form.arv}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small mb-1">Comentarios</label>
          <textarea
            className={styles.textarea}
            name="comments"
            value={form.comments}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12 mt-3">
          <button
            type="submit"
            className={styles.button}
            style={{ minWidth: "200px" }}
          >
            <span className="text-white">CREAR FIXFLIP</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default FixflipForm; 