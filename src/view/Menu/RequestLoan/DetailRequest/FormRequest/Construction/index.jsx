import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createConstruction, updateConstruction } from "../../../../../../Api/construction";

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

const ConstructionForm = ({ client_id, goToDocumentsTab, solicitud, cliente, editable = true }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (solicitud) {
      setForm({
        property_type: solicitud.property_type || "",
        property_address: solicitud.property_address || "",
        property_city: solicitud.property_city || "",
        property_state: solicitud.property_state || "",
        property_zip: solicitud.property_zip || "",
        loan_amount: solicitud.loan_amount || "",
        property_value: solicitud.property_value || "",
        construction_cost: solicitud.construction_cost || "",
        land_cost: solicitud.land_cost || "",
        comments: solicitud.comments || ""
      });
      setIsEditMode(false);
    }
  }, [solicitud]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberFormat = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    try {
      await updateConstruction(solicitud.id, form);
      setFeedback("¡Solicitud actualizada exitosamente!");
      setIsEditMode(false);
    } catch (error) {
      setFeedback("Error al actualizar la solicitud. Inténtalo de nuevo.");
    }
    setLoading(false);
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
      if (typeof goToDocumentsTab === 'function') {
        goToDocumentsTab(response.id, 'construction');
      }
    } catch (error) {
      setFeedback("Error al crear el Construction. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  return (
    <>
      <form className="container-fluid" onSubmit={solicitud ? handleUpdate : handleSubmit}>
        {/* Datos del cliente */}
        {cliente && (
          <div className="row mb-3">
            <div className="col-md-3 mb-2">
              <label className="form-label text-muted small mb-1">Nombre</label>
              <input className={styles.input} value={cliente.full_name || ""} disabled />
            </div>
            <div className="col-md-3 mb-2">
              <label className="form-label text-muted small mb-1">Email</label>
              <input className={styles.input} value={cliente.email || ""} disabled />
            </div>
            <div className="col-md-3 mb-2">
              <label className="form-label text-muted small mb-1">Teléfono</label>
              <input className={styles.input} value={cliente.phone || ""} disabled />
            </div>
            <div className="col-md-3 mb-2">
              <label className="form-label text-muted small mb-1">Dirección</label>
              <input className={styles.input} value={cliente.address || ""} disabled />
            </div>
          </div>
        )}
        {/* Formulario de solicitud Construction */}
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
              disabled={!editable && !isEditMode}
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
              disabled={!editable && !isEditMode}
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
              disabled={!editable && !isEditMode}
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
              disabled={!editable && !isEditMode}
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
              disabled={!editable && !isEditMode}
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
              disabled={!editable && !isEditMode}
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
              disabled={!editable && !isEditMode}
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
              disabled={!editable && !isEditMode}
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
              disabled={!editable && !isEditMode}
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
              disabled={!editable && !isEditMode}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12 mt-3">
            {solicitud ? (
              isEditMode ? (
                <button
                  type="submit"
                  className={styles.button}
                  style={{ minWidth: "200px" }}
                  disabled={loading}
                >
                  <span className="text-white">{loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.button}
                  style={{ minWidth: "200px" }}
                  onClick={() => setIsEditMode(true)}
                >
                  <span className="text-white">EDITAR</span>
                </button>
              )
            ) : (
              <button
                type="submit"
                className={styles.button}
                style={{ minWidth: "200px" }}
                disabled={loading}
              >
                <span className="text-white">{loading ? "CREANDO..." : "CREAR CONSTRUCTION"}</span>
              </button>
            )}
          </div>
        </div>
        {feedback && (
          <div className={`alert ${feedback.includes("exitosamente") ? "alert-success" : "alert-danger"} py-2 mb-3`}>
            {feedback}
          </div>
        )}
      </form>
    </>
  );
};

export default ConstructionForm; 