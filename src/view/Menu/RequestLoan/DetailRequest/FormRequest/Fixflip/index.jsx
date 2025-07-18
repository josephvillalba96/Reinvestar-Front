import React, { useState } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";

const initialState = {
  property_type: "",
  property_address: "",
  property_city: "",
  property_state: "",
  property_zip: "",
  loan_amount: "",
  purchase_price: "",
  rehab_cost: "",
  arv: "",
  comments: ""
};

const FixflipForm = ({ client_id, goToDocumentsTab }) => {
  const [form, setForm] = useState({ ...initialState });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberFormat = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...form,
      client_id: Number(client_id),
      loan_amount: form.loan_amount ? Number(form.loan_amount) : 0,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : 0,
      rehab_cost: form.rehab_cost ? Number(form.rehab_cost) : 0,
      arv: form.arv ? Number(form.arv) : 0,
    };
    // Aquí puedes enviar dataToSend a la API y obtener el id de la solicitud creada
    // Simulación:
    const fakeId = Math.floor(Math.random() * 10000) + 1;
    if (typeof goToDocumentsTab === 'function') {
      goToDocumentsTab(fakeId, 'fixflip');
    }
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
          <NumericFormat
            className={styles.input}
            name="loan_amount"
            value={form.loan_amount}
            onValueChange={({ value }) => handleNumberFormat("loan_amount", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            required
            placeholder="$0.00"
            inputMode="decimal"
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small mb-1">Precio de compra</label>
          <NumericFormat
            className={styles.input}
            name="purchase_price"
            value={form.purchase_price}
            onValueChange={({ value }) => handleNumberFormat("purchase_price", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            required
            placeholder="$0.00"
            inputMode="decimal"
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small mb-1">Costo de remodelación</label>
          <NumericFormat
            className={styles.input}
            name="rehab_cost"
            value={form.rehab_cost}
            onValueChange={({ value }) => handleNumberFormat("rehab_cost", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            required
            placeholder="$0.00"
            inputMode="decimal"
          />
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small mb-1">ARV (valor después de remodelar)</label>
          <NumericFormat
            className={styles.input}
            name="arv"
            value={form.arv}
            onValueChange={({ value }) => handleNumberFormat("arv", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            required
            placeholder="$0.00"
            inputMode="decimal"
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