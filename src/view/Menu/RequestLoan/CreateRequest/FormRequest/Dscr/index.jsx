import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createDscr } from "../../../../../../Api/dscr";
import { createRequestLink } from "../../../../../../Api/requestLink";
import { sendTemplateEmail } from "../../../../../../Api/emailTemplate";
import { getClientById } from "../../../../../../Api/client";

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

const DscrForm = ({ client_id, goToDocumentsTab }) => {
  const [form, setForm] = useState({ ...initialState });
  const [ficoError, setFicoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setForm({ ...initialState });
  }, [client_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

  // Función para enviar email usando template
  const handleSendEmail = async (link) => {
    if (!link || !client_id) return;
    
    setSending(true);
    try {
      // Obtener datos del cliente
      const clientData = await getClientById(client_id);
      if (!clientData?.email) {
        setFeedback("No se encontró el email del cliente.");
        return;
      }

      // Enviar email usando template
      await sendTemplateEmail({
        template_id: 0, // ID del template de solicitud
        template_type: "request_link",
        to_email: clientData.email,
        from_email: "noreply@reinvestar.com", // Email del sistema
        content_type: "text/html", // Asegurar que se envíe como HTML
        variables: {
          client_name: clientData.full_name,
          request_link: link,
          request_type: "DSCR",
          request_id: null // No tenemos el ID aún en CreateRequest
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client_id) {
      setFeedback("Debes seleccionar un cliente válido antes de crear la solicitud.");
      return;
    }
    if (form.fico && (Number(form.fico) < 300 || Number(form.fico) > 850)) {
      setFicoError("El valor de FICO debe estar entre 300 y 850");
      return;
    }
    setLoading(true);
    setFeedback("");
    try {
      // 1. Preparar datos de la solicitud
      const dataToSend = {
        type_request: "TYPE1",
        property_address: form.property_address || "",
        fico: form.fico ? Number(form.fico) : 0,
        rent_amount: form.rent_amount ? Number(form.rent_amount) : 0,
        appraisal_value: form.appraisal_value ? Number(form.appraisal_value) : 0,
        ltv_request: form.ltv_request ? Number(form.ltv_request) : 0,
        residency_status: form.residency_status || "OWNER",
        prepayment_penalty: form.prepayment_penalty ? Number(form.prepayment_penalty) : 0,
        property_units: form.property_units ? Number(form.property_units) : 0,
        type_of_transaction: form.type_of_transaction || "PURCHASE",
        primary_own_or_rent: form.primary_own_or_rent || "",
        mortgage_late_payments: form.mortgage_late_payments ? Number(form.mortgage_late_payments) : 0,
        prop_taxes: form.prop_taxes ? Number(form.prop_taxes) : 0,
        hoi: form.hoi ? Number(form.hoi) : 0,
        subject_prop_under_llc: form.subject_prop_under_llc || "",
        payoff_amount: form.payoff_amount ? Number(form.payoff_amount) : 0,
        client_id: Number(client_id)
      };

      // 2. Crear la solicitud DSCR
      const response = await createDscr(dataToSend);
      console.log('Respuesta createDscr:', response);

      // 3. Crear el enlace automáticamente
      const linkData = {
        valid_days: 30,
        dscr_request_id: response.id,
        construction_request_id: 0,
        fixflip_request_id: 0
      };

      const linkResponse = await createRequestLink(linkData);
      console.log('Respuesta createRequestLink:', linkResponse);

      if (linkResponse?.link_token) {
        const fullLink = `${URL_EXTERNAL_FORM}/dscr/${linkResponse.link_token}`;
        setExternalLink(fullLink);
        
        // 4. Enviar email automáticamente
        await handleSendEmail(fullLink);
      }

      // 5. Actualizar UI y limpiar formulario
      setFeedback("¡DSCR creado exitosamente!");
      setForm({ ...initialState });

      // 6. Navegar a documentos si es necesario
      if (typeof goToDocumentsTab === 'function') {
        goToDocumentsTab(response.id, 'dscr');
      }

    } catch (error) {
      console.error('Error completo:', error);
      if (error.response?.data?.detail) {
        setFeedback(Array.isArray(error.response.data.detail) 
          ? error.response.data.detail[0]?.msg 
          : error.response.data.detail);
      } else if (error.message) {
        setFeedback(error.message);
      } else {
        setFeedback("Error al crear el DSCR. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`container-fluid ${styles.formBlock}`} onSubmit={handleSubmit} style={{ maxWidth: '100%', margin: '0 auto', background: 'none', boxShadow: 'none', border: 'none' }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <h4 className="my_title_color fw-bold mb-0" style={{ letterSpacing: 0.5 }}>Solicitud DSCR</h4>
        {externalLink && (
          <>
            <span className="small text-muted" style={{ wordBreak: 'break-all' }}>{externalLink}</span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-2"
              onClick={() => {navigator.clipboard.writeText(externalLink); setCopied(true); setTimeout(()=>setCopied(false), 1500);}}
            >
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </>
        )}
      </div>

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
              placeholder="0"
              inputMode="numeric"
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
              placeholder="$0.00"
              inputMode="decimal"
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
              placeholder="$0.00"
              inputMode="decimal"
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
              placeholder="$0.00"
              inputMode="decimal"
            />
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
          <button
            type="submit"
            className={styles.button}
            style={{ minWidth: "200px" }}
            disabled={loading}
          >
            <span className="text-white">{loading ? "CREANDO..." : "CREAR DSCR"}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default DscrForm; 