import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createDscr } from "../../../../../../Api/dscr";
import { createRequestLink } from "../../../../../../Api/requestLink";
import { sendTemplateEmail } from "../../../../../../Api/emailTemplate";
import { getClientById } from "../../../../../../Api/client";
import { getUserIdFromToken } from "../../../../../../utils/auth";

const URL_EXTERNAL_FORM = import.meta.env.VITE_URL_EXTERMAL_FORM;

const initialState = {
  // Borrower Information
  borrower_name: "",
  legal_status: "",
  issued_date: "",
  property_address: "",
  estimated_fico_score: "",
  subject_prop_under_llc: "",
  
  // Loan Summary
  appraisal_value: "",
  annual_interest_rate: "",
  rent_amount: "",
  property_taxes: "",
  property_insurance: "",
  hoa_fees: "",
  flood_insurance: "",
  pay_off_amount: "",
  
  // Campos adicionales requeridos por el payload
  loan_type: "",
  property_type: "",
  closing_date: "",
  interest_rate_structure: "",
  loan_term: 0,
  prepayment_penalty: 0,
  prepayment_penalty_type: "",
  max_ltv: 0,
  origination_fee: 0,
  discount_points: 0,
  underwriting_fee: 0,
  credit_report_fee: 0,
  processing_fee: 0,
  recording_fee: 0,
  legal_fee: 0,
  service_fee: 0,
  title_fees: 0,
  government_fees: 0,
  escrow_tax_insurance: 0,
  total_closing_cost: 0,
  closing_cost_approx: 0,
  down_payment_percent: 0,
  dscr_requirement: 0,
  loan_amount: 0,
  down_payment_liquidity: 0,
  cash_out: 0,
  mortgage_payment_piti: 0,
  principal_interest: 0,
  property_taxes_estimated: 0,
  property_insurance_estimated: 0,
  hoa_estimated: 0,
  flood_insurance_estimated: 0,
  other_liquidity: 0,
  total_liquidity: 0,
  six_months_reserves: 0,
  property_city: "",
  property_state: "",
  property_zip: "",
  residency_status: "",
  origination_fee_percentage: 0,
  dscr_ratio: 0,
  closing_cost_liquidity: 0,
  guarantor_name: "",
  entity_name: "",
  type_of_program: "",
  dscr_required: false,
  dscr_flag: false,
  type_of_transaction: "",
  primary_own_or_rent: "",
  mortgage_late_payments: "",
  property_units: 0,
  borrower_signed: false,
  guarantor_signed: false,
  radicado: "",
  status: "PENDING",
  client_submitted: false,
  client_form_completed: false,
  client_submitted_at: null,
  comments: "",
  rejection_reason: ""
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
    if (name === "estimated_fico_score") {
      if (value && (Number(value) < 300 || Number(value) > 850)) {
        setFicoError("El valor de FICO debe estar entre 300 y 850");
      } else {
        setFicoError("");
      }
    }
  };

  const toISOOrNull = (dateStr) => {
    if (!dateStr) return null;
    try {
      const dt = new Date(dateStr);
      if (Number.isNaN(dt.getTime())) return null;
      return dt.toISOString();
    } catch (_) {
      return null;
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
    if (form.estimated_fico_score && (Number(form.estimated_fico_score) < 300 || Number(form.estimated_fico_score) > 850)) {
      setFicoError("El valor de FICO debe estar entre 300 y 850");
      return;
    }
    setLoading(true);
    setFeedback("");
    try {
      // Obtener user_id del token
      const user_id = getUserIdFromToken();
      if (!user_id) {
        setFeedback("Error de autenticación. Por favor, inicia sesión nuevamente.");
        return;
      }

      // Preparar datos de la solicitud con el nuevo payload
      const dataToSend = {
        borrower_name: form.borrower_name || "",
        legal_status: form.legal_status || "",
        issued_date: toISOOrNull(form.issued_date),
        property_address: form.property_address || "",
        estimated_fico_score: form.estimated_fico_score ? Number(form.estimated_fico_score) : 0,
        subject_prop_under_llc: form.subject_prop_under_llc || "",

        // Loan Summary
        appraisal_value: form.appraisal_value ? Number(form.appraisal_value) : 0,
        annual_interest_rate: form.annual_interest_rate ? Number(form.annual_interest_rate) : 0,
        rent_amount: form.rent_amount ? Number(form.rent_amount) : 0,
        property_taxes: form.property_taxes ? Number(form.property_taxes) : 0,
        property_insurance: form.property_insurance ? Number(form.property_insurance) : 0,
        hoa_fees: form.hoa_fees ? Number(form.hoa_fees) : 0,
        flood_insurance: form.flood_insurance ? Number(form.flood_insurance) : 0,
        pay_off_amount: form.pay_off_amount ? Number(form.pay_off_amount) : 0,
        
        // Campos adicionales requeridos
        loan_type: form.loan_type || "",
        property_type: form.property_type || "",
        closing_date: toISOOrNull(form.closing_date),
        interest_rate_structure: form.interest_rate_structure || "",
        loan_term: form.loan_term ? Number(form.loan_term) : 0,
        prepayment_penalty: form.prepayment_penalty ? Number(form.prepayment_penalty) : 0,
        prepayment_penalty_type: form.prepayment_penalty_type || "",
        max_ltv: form.max_ltv ? Number(form.max_ltv) : 0,
        origination_fee: form.origination_fee ? Number(form.origination_fee) : 0,
        discount_points: form.discount_points ? Number(form.discount_points) : 0,
        underwriting_fee: form.underwriting_fee ? Number(form.underwriting_fee) : 0,
        credit_report_fee: form.credit_report_fee ? Number(form.credit_report_fee) : 0,
        processing_fee: form.processing_fee ? Number(form.processing_fee) : 0,
        recording_fee: form.recording_fee ? Number(form.recording_fee) : 0,
        legal_fee: form.legal_fee ? Number(form.legal_fee) : 0,
        service_fee: form.service_fee ? Number(form.service_fee) : 0,
        title_fees: form.title_fees ? Number(form.title_fees) : 0,
        government_fees: form.government_fees ? Number(form.government_fees) : 0,
        escrow_tax_insurance: form.escrow_tax_insurance ? Number(form.escrow_tax_insurance) : 0,
        total_closing_cost: form.total_closing_cost ? Number(form.total_closing_cost) : 0,
        closing_cost_approx: form.closing_cost_approx ? Number(form.closing_cost_approx) : 0,
        down_payment_percent: form.down_payment_percent ? Number(form.down_payment_percent) : 0,
        dscr_requirement: form.dscr_requirement ? Number(form.dscr_requirement) : 0,
        loan_amount: form.loan_amount ? Number(form.loan_amount) : 0,
        down_payment_liquidity: form.down_payment_liquidity ? Number(form.down_payment_liquidity) : 0,
        cash_out: form.cash_out ? Number(form.cash_out) : 0,
        mortgage_payment_piti: form.mortgage_payment_piti ? Number(form.mortgage_payment_piti) : 0,
        principal_interest: form.principal_interest ? Number(form.principal_interest) : 0,
        property_taxes_estimated: form.property_taxes ? Number(form.property_taxes) : 0,
        property_insurance_estimated: form.property_insurance ? Number(form.property_insurance) : 0,
        hoa_estimated: form.hoa_fees ? Number(form.hoa_fees) : 0,
        flood_insurance_estimated: form.flood_insurance ? Number(form.flood_insurance) : 0,
        other_liquidity: form.other_liquidity ? Number(form.other_liquidity) : 0,
        total_liquidity: form.total_liquidity ? Number(form.total_liquidity) : 0,
        six_months_reserves: form.six_months_reserves ? Number(form.six_months_reserves) : 0,
        property_city: form.property_city || "",
        property_state: form.property_state || "",
        property_zip: form.property_zip || "",
        residency_status: form.residency_status || "",
        origination_fee_percentage: form.origination_fee_percentage ? Number(form.origination_fee_percentage) : 0,
        dscr_ratio: form.dscr_ratio ? Number(form.dscr_ratio) : 0,
        closing_cost_liquidity: form.closing_cost_liquidity ? Number(form.closing_cost_liquidity) : 0,
        guarantor_name: form.guarantor_name || "",
        entity_name: form.entity_name || "",
        type_of_program: form.type_of_program || "",
        dscr_required: Boolean(form.dscr_required),
        dscr_flag: Boolean(form.dscr_flag),
        type_of_transaction: form.type_of_transaction || "",
        primary_own_or_rent: form.primary_own_or_rent || "",
        mortgage_late_payments: form.mortgage_late_payments || "",
        property_units: form.property_units ? Number(form.property_units) : 0,
        borrower_signed: Boolean(form.borrower_signed),
        guarantor_signed: Boolean(form.guarantor_signed),
        radicado: form.radicado || "",
        status: "PENDING",
        client_submitted: Boolean(form.client_submitted),
        client_form_completed: Boolean(form.client_form_completed),
        client_submitted_at: null,
        comments: form.comments || "",
        rejection_reason: form.rejection_reason || "",

        client_id: Number(client_id),
        user_id: user_id
      };

      // Crear la solicitud DSCR
      const response = await createDscr(dataToSend);
      console.log('Respuesta createDscr:', response);

      // Crear el enlace automáticamente
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
        // Enviar email automáticamente
        await handleSendEmail(fullLink);
      }

      // Actualizar UI y limpiar formulario
      setFeedback("¡DSCR creado exitosamente!");
      setForm({ ...initialState });

      // Navegar a documentos si es necesario
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
    <form className="container-fluid" onSubmit={handleSubmit}>
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

      {/* ==============================
          1. BORROWER INFORMATION
          ============================== */}
      <div className="row mb-4">
        <div className="col-12">
          <h6 className="my_title_color fw-bold mb-3">1. BORROWER INFORMATION</h6>
        </div>
          </div>
      
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label my_title_color">BORROWER'S NAME</label>
          <input 
            className={`form-control ${styles.input}`}
            name="borrower_name" 
            value={form.borrower_name} 
            onChange={handleChange} 
          />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">LEGAL STATUS</label>
          <select 
            className={`form-control ${styles.input}`}
            name="legal_status" 
            value={form.legal_status} 
            onChange={handleChange}
          >
              <option value="">Seleccione...</option>
              <option value="CITIZEN">CITIZEN</option>
              <option value="GREEN CARD">GREEN CARD</option>
              <option value="EMD">EMD</option>
              <option value="ITIN">ITIN</option>
              <option value="FN">FN</option>
            </select>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label my_title_color">ISSUED DATE</label>
          <input 
            type="date" 
            className={`form-control ${styles.input}`}
            name="issued_date" 
            value={form.issued_date} 
            onChange={handleChange} 
          />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">SUBJECT PROPERTY ADDRESS</label>
          <input 
            className={`form-control ${styles.input}`}
            name="property_address" 
            value={form.property_address} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label my_title_color">ESTIMATED FICO SCORE</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="estimated_fico_score" 
            value={form.estimated_fico_score} 
            onValueChange={({ value }) => handleNumberFormat("estimated_fico_score", value)} 
            allowNegative={false} 
            decimalScale={0} 
            inputMode="numeric" 
          />
          {ficoError && (<span style={{ color: 'red', fontSize: 13 }}>{ficoError}</span>)}
          {!ficoError && getFicoCategory(form.estimated_fico_score) && (
            <span style={{ color: '#2c3e50', fontSize: 13, fontWeight: 500 }}>
              {getFicoCategory(form.estimated_fico_score)}
            </span>
          )}
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">PROPERTY UNDER LLC</label>
          <input 
            className={`form-control ${styles.input}`}
            name="subject_prop_under_llc" 
            value={form.subject_prop_under_llc} 
            onChange={handleChange} 
          />
        </div>
      </div>

      {/* ==============================
          2. LOAN SUMMARY
          ============================== */}
      <div className="row mb-4 mt-5">
        <div className="col-12">
          <h6 className="my_title_color fw-bold mb-3">2. LOAN SUMMARY</h6>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label my_title_color">Appraisal Value</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="appraisal_value" 
            value={form.appraisal_value} 
            onValueChange={({ value }) => handleNumberFormat("appraisal_value", value)} 
            thousandSeparator="," 
            prefix="$" 
            decimalScale={2} 
            fixedDecimalScale 
            allowNegative={false} 
            inputMode="decimal" 
          />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">Annual Interest Rate</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="annual_interest_rate" 
            value={form.annual_interest_rate} 
            onValueChange={({ value }) => handleNumberFormat("annual_interest_rate", value)} 
            suffix="%" 
            decimalScale={3} 
            allowNegative={false} 
            inputMode="decimal" 
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label my_title_color">Rent Amount</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="rent_amount" 
            value={form.rent_amount} 
            onValueChange={({ value }) => handleNumberFormat("rent_amount", value)} 
            thousandSeparator="," 
            prefix="$" 
            decimalScale={2} 
            fixedDecimalScale 
            allowNegative={false} 
            inputMode="decimal" 
          />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">Property Taxes</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="property_taxes" 
            value={form.property_taxes} 
            onValueChange={({ value }) => handleNumberFormat("property_taxes", value)} 
            thousandSeparator="," 
            prefix="$" 
            decimalScale={2} 
            fixedDecimalScale 
            allowNegative={false} 
            inputMode="decimal" 
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label my_title_color">Property Insurance (HOI)</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="property_insurance" 
            value={form.property_insurance} 
            onValueChange={({ value }) => handleNumberFormat("property_insurance", value)} 
            thousandSeparator="," 
            prefix="$" 
            decimalScale={2} 
            fixedDecimalScale 
            allowNegative={false} 
            inputMode="decimal" 
          />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">HOA</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="hoa_fees" 
            value={form.hoa_fees} 
            onValueChange={({ value }) => handleNumberFormat("hoa_fees", value)} 
            thousandSeparator="," 
            prefix="$" 
            decimalScale={2} 
            fixedDecimalScale 
            allowNegative={false} 
            inputMode="decimal" 
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label my_title_color">Flood Insurance</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="flood_insurance" 
            value={form.flood_insurance} 
            onValueChange={({ value }) => handleNumberFormat("flood_insurance", value)} 
            thousandSeparator="," 
            prefix="$" 
            decimalScale={2} 
            fixedDecimalScale 
            allowNegative={false} 
            inputMode="decimal" 
          />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">Pay Off Amount</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="pay_off_amount" 
            value={form.pay_off_amount} 
            onValueChange={({ value }) => handleNumberFormat("pay_off_amount", value)} 
            thousandSeparator="," 
            prefix="$" 
            decimalScale={2} 
            fixedDecimalScale 
            allowNegative={false} 
            inputMode="decimal" 
          />
        </div>
      </div>

      {feedback && (
        <div className={`alert ${feedback.includes("exitosamente") ? "alert-success" : "alert-danger"} py-2 mb-3`}>
          {feedback}
        </div>
      )}

      <div className="row">
        <div className="col-12 mt-4">
          <button type="submit" className="btn btn-primary" style={{ minWidth: "200px" }} disabled={loading}>
            {loading ? "CREANDO..." : "CREAR DSCR"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DscrForm; 
