import React, { useState } from "react";
import styles from "../style.module.css";

const initialState = {
  type_request: "TYPE1",
  property_address: "",
  fico: 0,
  rent_amount: 0,
  appraisal_value: 0,
  ltv_request: 0,
  residency_status: "OWNER",
  prepayment_penalty: 0,
  property_units: 0,
  type_of_transaction: "PURCHASE",
  primary_own_or_rent: "",
  mortgage_late_payments: 0,
  prop_taxes: 0,
  hoi: 0,
  subject_prop_under_llc: "",
  payoff_amount: 0
};

const DscrForm = ({ client_id }) => {
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
    console.log("Datos DSCR:", dataToSend);
    // Aquí puedes enviar dataToSend a la API
  };

  return (
    <form className="container-fluid" onSubmit={handleSubmit}>
      <div className="row gy-1">
        <div className="col-md-6 mb-2">
          <div className="w-100 d-flex flex-column">
            <label className="form-label text-muted small mb-1">Tipo de solicitud</label>
            <select
              className={styles.select}
              name="type_request"
              value={form.type_request}
              onChange={handleChange}
              required
            >
              <option value="TYPE1">Tipo 1</option>
              <option value="TYPE2">Tipo 2</option>
            </select>
          </div>
        </div>
        <div className="col-md-6 mb-2">
          <div className="d-flex flex-column">
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
      </div>
      <div className="row gy-1">
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">FICO</label>
            <input
              type="number"
              className={styles.input}
              name="fico"
              value={form.fico}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Monto de alquiler</label>
            <input
              type="number"
              className={styles.input}
              name="rent_amount"
              value={form.rent_amount}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Valor de tasación</label>
            <input
              type="number"
              className={styles.input}
              name="appraisal_value"
              value={form.appraisal_value}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted mb-1">LTV solicitado (%)</label>
            <input
              type="number"
              className={styles.input}
              name="ltv_request"
              value={form.ltv_request}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Residencia</label>
            <select
              className={styles.select}
              name="residency_status"
              value={form.residency_status}
              onChange={handleChange}
              required
            >
              <option value="OWNER">Propietario</option>
              <option value="RENT">Arrendatario</option>
            </select>
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label text-muted small mb-1">Penalidad por prepago (años)</label>
          <input
            type="number"
            className={styles.input}
            name="prepayment_penalty"
            value={form.prepayment_penalty}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Unidades de propiedad</label>
            <input
              type="number"
              className={styles.input}
              name="property_units"
              value={form.property_units}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Tipo de transacción</label>
            <select
              className={styles.select}
              name="type_of_transaction"
              value={form.type_of_transaction}
              onChange={handleChange}
              required
            >
              <option value="PURCHASE">Compra</option>
              <option value="REFINANCE">Refinanciación</option>
              <option value="CASHOUT">Cash-out</option>
            </select>
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">¿Propietario o arrendatario principal?</label>
            <input
              type="text"
              className={styles.input}
              name="primary_own_or_rent"
              value={form.primary_own_or_rent}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Pagos tardíos de hipoteca</label>
            <input
              type="number"
              className={styles.input}
              name="mortgage_late_payments"
              value={form.mortgage_late_payments}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Impuestos de propiedad</label>
            <input
              type="number"
              className={styles.input}
              name="prop_taxes"
              value={form.prop_taxes}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">HOI</label>
            <input
              type="number"
              className={styles.input}
              name="hoi"
              value={form.hoi}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-6 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Propiedad bajo LLC</label>
            <input
              type="text"
              className={styles.input}
              name="subject_prop_under_llc"
              value={form.subject_prop_under_llc}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-6 mb-2">
          <div className="d-flex flex-column">

            <label className="form-label text-muted small mb-1">Monto a pagar (payoff)</label>
            <input
              type="number"
              className={styles.input}
              name="payoff_amount"
              value={form.payoff_amount}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 mt-3">
          <button
            type="submit"
            className={styles.button}
            style={{ minWidth: "200px" }}
          >
            <span className="text-white">CREAR DSCR</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default DscrForm; 