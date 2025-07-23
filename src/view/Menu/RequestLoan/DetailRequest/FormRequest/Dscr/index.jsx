import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createDscr, updateDscr } from "../../../../../../Api/dscr";
import { createRequestLink } from "../../../../../../Api/requestLink";

const initialState = {
  type_request: "TYPE1",
  property_address: "",
  fico: "",
  rent_amount: "",
  appraisal_value: "",
  ltv_request: "",
  residency_status: "OWNER",
  prepayment_penalty: "",
  property_units: "",
  type_of_transaction: "PURCHASE",
  primary_own_or_rent: "",
  mortgage_late_payments: "",
  prop_taxes: "",
  hoi: "",
  subject_prop_under_llc: "",
  payoff_amount: ""
};

const DscrForm = ({ client_id, goToDocumentsTab, solicitud, cliente, editable = true }) => {
  const [form, setForm] = useState(initialState);
  const [ficoError, setFicoError] = useState("");
  const [assignToClient, setAssignToClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [createdDscrId, setCreatedDscrId] = useState(null);
  const [linkForm, setLinkForm] = useState({ valid_days: 7 });
  const [isEditMode, setIsEditMode] = useState(false);

  // Inicializar el formulario con los datos de la solicitud si existen
  useEffect(() => {
    if (solicitud) {
      setForm({
        type_request: solicitud.type_request || "TYPE1",
        property_address: solicitud.property_address || "",
        fico: solicitud.fico || "",
        rent_amount: solicitud.rent_amount || "",
        appraisal_value: solicitud.appraisal_value || "",
        ltv_request: solicitud.ltv_request || "",
        residency_status: solicitud.residency_status || "OWNER",
        prepayment_penalty: solicitud.prepayment_penalty || "",
        property_units: solicitud.property_units || "",
        type_of_transaction: solicitud.type_of_transaction || "PURCHASE",
        primary_own_or_rent: solicitud.primary_own_or_rent || "",
        mortgage_late_payments: solicitud.mortgage_late_payments || "",
        prop_taxes: solicitud.prop_taxes || "",
        hoi: solicitud.hoi || "",
        subject_prop_under_llc: solicitud.subject_prop_under_llc || "",
        payoff_amount: solicitud.payoff_amount || ""
      });
      setIsEditMode(false);
    }
  }, [solicitud]);

  // Maneja cambios generales
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Maneja cambios de campos numéricos con máscara
  const handleNumberFormat = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "fico") {
      if (value && (Number(value) < 300 || Number(value) > 850)) {
        setFicoError("El valor de FICO debe estar entre 300 y 850");
      } else {
        setFicoError("");
      }
    }
  };

  // Mensaje de categoría FICO
  const getFicoCategory = (fico) => {
    const n = Number(fico);
    if (!fico || isNaN(n)) return "";
    if (n >= 300 && n <= 579) return "Muy pobre (Very Poor)";
    if (n >= 580 && n <= 669) return "Aceptable (Fair)";
    if (n >= 670 && n <= 739) return "Bueno (Good)";
    if (n >= 740 && n <= 799) return "Muy bueno (Very Good)";
    if (n >= 800 && n <= 850) return "Excelente (Exceptional)";
    return "";
  };

  // Guardar cambios (update)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    try {
      await updateDscr(solicitud.id, form);
      setFeedback("¡Solicitud actualizada exitosamente!");
      setIsEditMode(false);
    } catch (error) {
      setFeedback("Error al actualizar la solicitud. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  // Guardar nuevo (create, solo si no hay solicitud)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.fico && (Number(form.fico) < 300 || Number(form.fico) > 850)) {
      setFicoError("El valor de FICO debe estar entre 300 y 850");
      return;
    }
    setLoading(true);
    setFeedback("");
    try {
      const dataToSend = {
        ...form,
        client_id: Number(client_id)
      };
      const response = await createDscr(dataToSend);
      setCreatedDscrId(response.id);
      setFeedback("¡DSCR creado exitosamente!");
      if (typeof goToDocumentsTab === 'function') {
        goToDocumentsTab(response.id, 'dscr');
      }
    } catch (error) {
      setFeedback("Error al crear el DSCR. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const handleCreateEmptyDscr = async () => {
    setLoading(true);
    setFeedback("");

    try {
      const emptyData = {
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
        payoff_amount: 0,
        client_id: Number(client_id)
      };

      const response = await createDscr(emptyData);
      setCreatedDscrId(response.id);
      setFeedback("¡DSCR vacío creado y asignado al cliente exitosamente!");
      setShowLinkForm(true);
    } catch (error) {
      setFeedback("Error al crear el DSCR vacío. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      const linkData = {
        valid_days: Number(linkForm.valid_days),
        dscr_request_id: createdDscrId,
        construction_request_id: 0,
        fixflip_request_id: 0
      };

      const response = await createRequestLink(linkData);
      setFeedback("¡Link creado exitosamente!");
      console.log("Link creado:", response);
    } catch (error) {
      setFeedback("Error al crear el link. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  return (
    <>
      <form className="container-fluid" onSubmit={solicitud ? handleUpdate : handleSubmit}>
        {/* Datos del cliente */}
        {cliente && (
          <div className="row mb-3">
            <div className="col-md-6 mb-2">
              <div className="d-flex flex-column">
                <label className="form-label text-muted small mb-1">Nombre</label>
                <input className={styles.input} value={cliente.full_name || ""} disabled />
              </div>
            </div>
            <div className="col-md-6 mb-2">
              <div className="d-flex flex-column">
                <label className="form-label text-muted small mb-1">Email</label>
                <input className={styles.input} value={cliente.email || ""} disabled />
              </div>
            </div>
            <div className="col-md-7 mb-2">
              <div className="d-flex flex-column">
                <label className="form-label text-muted small mb-1">Teléfono</label>
                <input className={styles.input} value={cliente.phone || ""} disabled />
              </div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="d-flex flex-column">
                <label className="form-label text-muted small mb-1">Dirección</label>
                <input className={styles.input} value={cliente.address || ""} disabled />
              </div>
            </div>
          </div>
        )}
        {/* Formulario de solicitud DSCR */}
        <div className="row gy-1">
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
                disabled={!editable && !isEditMode}
              />
            </div>
          </div>
        </div>
        <div className="row gy-1">
          <div className="col-md-4 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">FICO</label>
              <NumericFormat
                className={styles.input}
                name="fico"
                value={form.fico}
                onValueChange={({ value }) => handleNumberFormat("fico", value)}
                allowNegative={false}
                decimalScale={0}
                allowLeadingZeros={false}
                thousandSeparator=","
                required
                placeholder="0"
                inputMode="numeric"
                disabled={!editable && !isEditMode}
              />
              {ficoError && (
                <span style={{ color: 'red', fontSize: 13 }}>{ficoError}</span>
              )}
              {!ficoError && getFicoCategory(form.fico) && (
                <span style={{ color: '#2c3e50', fontSize: 13, fontWeight: 500 }}>{getFicoCategory(form.fico)}</span>
              )}
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Monto de alquiler</label>
              <NumericFormat
                className={styles.input}
                name="rent_amount"
                value={form.rent_amount}
                onValueChange={({ value }) => handleNumberFormat("rent_amount", value)}
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
          <div className="col-md-4 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Valor de tasación</label>
              <NumericFormat
                className={styles.input}
                name="appraisal_value"
                value={form.appraisal_value}
                onValueChange={({ value }) => handleNumberFormat("appraisal_value", value)}
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
        </div>
        <div className="row gy-1">
          <div className="col-md-4 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted mb-1">LTV solicitado (%)</label>
              <NumericFormat
                className={styles.input}
                name="ltv_request"
                value={form.ltv_request}
                onValueChange={({ value }) => handleNumberFormat("ltv_request", value)}
                suffix="%"
                decimalScale={2}
                allowNegative={false}
                required
                placeholder="0.00%"
                inputMode="decimal"
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
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Penalidad por prepago (años)</label>
              <NumericFormat
                className={styles.input}
                name="prepayment_penalty"
                value={form.prepayment_penalty}
                onValueChange={({ value }) => handleNumberFormat("prepayment_penalty", value)}
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
        </div>
        <div className="row gy-1">
          <div className="col-md-4 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Unidades de propiedad</label>
              <NumericFormat
                className={styles.input}
                name="property_units"
                value={form.property_units}
                onValueChange={({ value }) => handleNumberFormat("property_units", value)}
                allowNegative={false}
                decimalScale={0}
                required
                placeholder="0"
                inputMode="numeric"
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
              <NumericFormat
                className={styles.input}
                name="mortgage_late_payments"
                value={form.mortgage_late_payments}
                onValueChange={({ value }) => handleNumberFormat("mortgage_late_payments", value)}
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
          <div className="col-md-4 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Impuestos de propiedad</label>
              <NumericFormat
                className={styles.input}
                name="prop_taxes"
                value={form.prop_taxes}
                onValueChange={({ value }) => handleNumberFormat("prop_taxes", value)}
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
          <div className="col-md-4 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">HOI</label>
              <NumericFormat
                className={styles.input}
                name="hoi"
                value={form.hoi}
                onValueChange={({ value }) => handleNumberFormat("hoi", value)}
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
        </div>
        <div className="row gy-1">
          <div className="col-md-6 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Propiedad bajo LLC</label>
              <select
                className={styles.input}
                name="subject_prop_under_llc"
                value={form.subject_prop_under_llc}
                onChange={e => setForm(prev => ({ ...prev, subject_prop_under_llc: e.target.value }))}
                required
              >
                <option value="">Seleccione una opción</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </div>
          </div>
          <div className="col-md-6 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Monto a pagar (payoff)</label>
              <NumericFormat
                className={styles.input}
                name="payoff_amount"
                value={form.payoff_amount}
                onValueChange={({ value }) => handleNumberFormat("payoff_amount", value)}
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
        </div>

        {/* Checkbox para asignar */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="assignToClient"
                checked={assignToClient}
                onChange={(e) => setAssignToClient(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="assignToClient">
                Asignar
              </label>
            </div>
          </div>
        </div>

        {feedback && (
          <div className={`alert ${feedback.includes("exitosamente") ? "alert-success" : "alert-danger"} py-2 mb-3`}>
            {feedback}
          </div>
        )}

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
                <span className="text-white">{loading ? "CREANDO..." : "CREAR DSCR"}</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Formulario para crear link */}
      {showLinkForm && (
        <div className="mt-4 p-3 border rounded">
          <h5 className="mb-3">Crear Link</h5>
          <form onSubmit={handleCreateLink}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small mb-1">Días de validez</label>
                <input
                  type="number"
                  className={styles.input}
                  value={linkForm.valid_days}
                  onChange={(e) => setLinkForm(prev => ({ ...prev, valid_days: e.target.value }))}
                  min="1"
                  max="365"
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <button
                  type="submit"
                  className={styles.button}
                  style={{ minWidth: "200px" }}
                  disabled={loading}
                >
                  <span className="text-white">{loading ? "CREANDO..." : "CREAR LINK"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default DscrForm; 