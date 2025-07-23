import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createConstruction } from "../../../../../../Api/construction";
import { createRequestLink } from "../../../../../../Api/requestLink";

const initialState = {
  property_type: "",
  property_address: "",
  property_city: "",
  property_state: "",
  property_zip: "",
  loan_amount: "",
  property_value: "",
  construction_cost: "",
  land_cost: "",
  comments: ""
};

const ConstructionForm = ({ client_id, goToDocumentsTab }) => {
  const [form, setForm] = useState({ ...initialState });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setForm({ ...initialState });
  }, [client_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberFormat = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    try {
      const dataToSend = {
        ...form,
        client_id: Number(client_id)
      };
      const response = await createConstruction(dataToSend);
      setFeedback("¡Construction creado exitosamente!");
      // Crear link automáticamente con 30 días
      await createRequestLink({
        valid_days: 30,
        dscr_request_id: 0,
        construction_request_id: response.id,
        fixflip_request_id: 0
      });
      if (typeof goToDocumentsTab === 'function') {
        goToDocumentsTab(response.id, 'construction');
      }
      setForm({ ...initialState }); // Limpiar formulario después de crear
    } catch (error) {
      setFeedback("Error al crear el Construction. Inténtalo de nuevo.");
    }
    setLoading(false);
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
          <label className="form-label text-muted small mb-1">Valor de la propiedad</label>
          <NumericFormat
            className={styles.input}
            name="property_value"
            value={form.property_value}
            onValueChange={({ value }) => handleNumberFormat("property_value", value)}
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
          <label className="form-label text-muted small mb-1">Costo de construcción</label>
          <NumericFormat
            className={styles.input}
            name="construction_cost"
            value={form.construction_cost}
            onValueChange={({ value }) => handleNumberFormat("construction_cost", value)}
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
          <label className="form-label text-muted small mb-1">Costo del terreno</label>
          <NumericFormat
            className={styles.input}
            name="land_cost"
            value={form.land_cost}
            onValueChange={({ value }) => handleNumberFormat("land_cost", value)}
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
            disabled={loading}
          >
            {loading ? "Creando..." : "CREAR CONSTRUCTION"}
          </button>
          {feedback && (
            <div className="mt-2 text-center text-success">{feedback}</div>
          )}
        </div>
      </div>
    </form>
  );
};

export default ConstructionForm; 