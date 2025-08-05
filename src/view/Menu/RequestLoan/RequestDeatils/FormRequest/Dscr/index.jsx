import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createDscr, updateDscr } from "../../../../../../Api/dscr";
import { getRequestLinks, createRequestLink, sendRequestLink } from "../../../../../../Api/requestLink";
import { sendTemplateEmail } from "../../../../../../Api/emailTemplate";

const URL_EXTERNAL_FORM = import.meta.env.VITE_URL_EXTERMAL_FORM;

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [externalLink, setExternalLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

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

  useEffect(() => {
    if (solicitud && solicitud.id) {
      let isMounted = true;
      
      getRequestLinks({ dscr_request_id: solicitud.id })
        .then(links => {
          if (isMounted) {
            const link = Array.isArray(links) ? links.find(l => l.link_token) : null;
            if (link && link.link_token) {
              setExternalLink(`${URL_EXTERNAL_FORM}/dscr/${link.link_token}`);
            } else {
              setExternalLink("");
            }
          }
        })
        .catch(error => {
          if (isMounted) {
            console.error('Error fetching request links:', error);
            setExternalLink("");
          }
        });
      
      return () => {
        isMounted = false;
      };
    }
  }, [solicitud?.id]); // Solo depende del ID de la solicitud

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
      setIsEditMode(false);
      setFeedback("¡DSCR creado exitosamente!");
      if (typeof goToDocumentsTab === 'function') {
        goToDocumentsTab(response.id, 'dscr');
      }
    } catch (error) {
      setFeedback("Error al crear el DSCR. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const handleGenerateLink = async () => {
    if (!solicitud || !solicitud.id) return;
    setGenerating(true);
    try {
      const link = await createRequestLink({
        valid_days: 30,
        dscr_request_id: solicitud.id,
        construction_request_id: 0,
        fixflip_request_id: 0
      });
      if (link && link.link_token) {
        setExternalLink(`${URL_EXTERNAL_FORM}/dscr/${link.link_token}`);
      }
    } catch (e) {
      // feedback opcional
    }
    setGenerating(false);
  };

  // Función para enviar email usando template
  const handleSendLink = async () => {
    if (!externalLink || !cliente?.email) return;
    setSending(true);
    try {
      // Enviar email usando template
      await sendTemplateEmail({
        template_id: 0, // ID del template de solicitud
        template_type: "request_link",
        to_email: cliente.email,
        from_email: "noreply@reinvestar.com", // Email del sistema
        content_type: "text/html", // Asegurar que se envíe como HTML
        variables: {
          client_name: cliente.full_name,
          request_link: externalLink,
          request_type: "DSCR",
          request_id: solicitud.id
        }
      });
      setFeedback("¡Email enviado exitosamente!");
    } catch (error) {
      console.error('Error enviando email:', error);
      setFeedback("Error al enviar el email. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form className={`container-fluid ${styles.formBlock}`} onSubmit={solicitud ? handleUpdate : handleSubmit} style={{ maxWidth: '100%', margin: '0 auto', background: 'none', boxShadow: 'none', border: 'none' }}>
        {/* Datos del cliente */}
        {cliente && (
        <div className="mb-4">
          <div className="row gy-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label my_title_color">Nombre</label>
              <input className={`form-control ${styles.input}`} value={cliente.full_name || ""} disabled />
            </div>
            <div className="col-md-3">
              <label className="form-label my_title_color">Email</label>
              <input className={`form-control ${styles.input}`} value={cliente.email || ""} disabled />
            </div>
            <div className="col-md-3">
              <label className="form-label my_title_color">Teléfono</label>
              <input className={`form-control ${styles.input}`} value={cliente.phone || ""} disabled />
            </div>
            <div className="col-md-3">
              <label className="form-label my_title_color">ID</label>
              <input className={`form-control ${styles.input}`} value={cliente.id || ""} disabled />
            </div>
          </div>
        </div>
        )}
      <div className="d-flex align-items-center mb-4 gap-3">
        <h4 className="my_title_color fw-bold mb-0" style={{ letterSpacing: 0.5 }}>Detalle de Solicitud DSCR</h4>
        {externalLink ? (
          <>
            <span className="small text-muted" style={{ wordBreak: 'break-all' }}>{externalLink}</span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-2"
              onClick={() => {navigator.clipboard.writeText(externalLink); setCopied(true); setTimeout(()=>setCopied(false), 1500);}}
            >
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
            <button
              type="button"
              className="btn btn-outline-success btn-sm ms-2"
              onClick={handleSendLink}
              disabled={sending || !cliente?.email}
              title={!cliente?.email ? "No hay email del cliente" : "Enviar enlace al cliente"}
            >
              {sending ? "Enviando..." : "Enviar"}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm ms-2"
            onClick={handleGenerateLink}
            disabled={generating}
          >
            {generating ? "Generando..." : "Generar enlace"}
          </button>
        )}
      </div>
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
            {/* <div className="form-check">
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
            </div> */}
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
  );
};

export default DscrForm; 