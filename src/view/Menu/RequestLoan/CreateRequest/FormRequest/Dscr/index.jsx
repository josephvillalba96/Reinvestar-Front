import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createDscr } from "../../../../../../Api/dscr";
import { createRequestLink } from "../../../../../../Api/requestLink";
import { sendTemplateEmail } from "../../../../../../Api/emailTemplate";
import { getClientById } from "../../../../../../Api/client";

const URL_EXTERNAL_FORM = import.meta.env.VITE_URL_EXTERMAL_FORM;

const initialState = {
  // Datos del solicitante / garantes / entidad
  borrower_name: "",
  guarantor_name: "",
  legal_status: "",
  entity_name: "",
  issued_date: "",

  // Scores
  fico: "",

  // Propiedad
  property_type: "",
  property_units: "",
  property_address: "",
  property_city: "",
  property_state: "",
  property_zip: "",
  subject_prop_under_llc: "",

  // Préstamo / programa
  loan_type: "",
  type_of_program: "",
  appraisal_value: "",
  loan_amount: "",
  loan_term: "",
  ltv_request: "",
  interest_rate: "",
  interest_rate_structure: "",
  discount_points: "",
  origination_fee_percentage: "",
  origination_fee_amount: "",
  payoff_amount: "",
  cash_out: "",
  estimated_closing_date: "",

  // Ingresos / pagos propiedad
  rent_amount: "",
  mortgage_payment_piti: "",
  prop_taxes: "",
  hoi: "",
  hoa: "",
  flood_insurance: "",

  // Prepago / DSCR
  prepayment_penalty: "",
  prepayment_penalty_type: "",
  dscr_ratio: "",
  dscr_required: false,
  dscr_flag: false,

  // Costos de cierre / fees
  closing_cost_approx: "",
  closing_cost_estimated: "",
  total_closing_cost_estimated: "",
  service_fee: "",
  title_fees: "",
  government_fees: "",
  escrow_tax_insurance: "",
  appraisal_fee: "",
  underwriting_fee: "",
  credit_report_fee: "",
  processing_fee: "",
  recording_fee: "",
  legal_fee: "",
  other_costs: "",
  down_payment: "",
  closing_cost: "",
  reserves_6_months: ""
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
    if (form.fico && (Number(form.fico) < 300 || Number(form.fico) > 850)) {
      setFicoError("El valor de FICO debe estar entre 300 y 850");
      return;
    }
    setLoading(true);
    setFeedback("");
    try {
      // 1. Preparar datos de la solicitud con el nuevo modelo
      const dataToSend = {
        borrower_name: form.borrower_name || "",
        guarantor_name: form.guarantor_name || "",
        legal_status: form.legal_status || "",
        entity_name: form.entity_name || "",
        issued_date: toISOOrNull(form.issued_date),

        fico: form.fico ? Number(form.fico) : 0,

        property_type: form.property_type || "",
        property_units: form.property_units ? Number(form.property_units) : 0,
        property_address: form.property_address || "",
        property_city: form.property_city || "",
        property_state: form.property_state || "",
        property_zip: form.property_zip || "",
        subject_prop_under_llc: form.subject_prop_under_llc || "",

        loan_type: form.loan_type || "",
        type_of_program: form.type_of_program || "",
        appraisal_value: form.appraisal_value ? Number(form.appraisal_value) : 0,
        loan_amount: form.loan_amount ? Number(form.loan_amount) : 0,
        loan_term: form.loan_term ? Number(form.loan_term) : 0,
        ltv_request: form.ltv_request ? Number(form.ltv_request) : 0,
        interest_rate: form.interest_rate ? Number(form.interest_rate) : 0,
        interest_rate_structure: form.interest_rate_structure || "",
        discount_points: form.discount_points ? Number(form.discount_points) : 0,
        origination_fee_percentage: form.origination_fee_percentage ? Number(form.origination_fee_percentage) : 0,
        origination_fee_amount: form.origination_fee_amount ? Number(form.origination_fee_amount) : 0,
        payoff_amount: form.payoff_amount ? Number(form.payoff_amount) : 0,
        cash_out: form.cash_out ? Number(form.cash_out) : 0,
        estimated_closing_date: toISOOrNull(form.estimated_closing_date),

        rent_amount: form.rent_amount ? Number(form.rent_amount) : 0,
        mortgage_payment_piti: form.mortgage_payment_piti ? Number(form.mortgage_payment_piti) : 0,
        prop_taxes: form.prop_taxes ? Number(form.prop_taxes) : 0,
        hoi: form.hoi ? Number(form.hoi) : 0,
        hoa: form.hoa ? Number(form.hoa) : 0,
        flood_insurance: form.flood_insurance ? Number(form.flood_insurance) : 0,

        prepayment_penalty: form.prepayment_penalty ? Number(form.prepayment_penalty) : 0,
        prepayment_penalty_type: form.prepayment_penalty_type || "",
        dscr_ratio: form.dscr_ratio ? Number(form.dscr_ratio) : 0,
        dscr_required: Boolean(form.dscr_required),
        dscr_flag: Boolean(form.dscr_flag),

        closing_cost_approx: form.closing_cost_approx ? Number(form.closing_cost_approx) : 0,
        closing_cost_estimated: form.closing_cost_estimated ? Number(form.closing_cost_estimated) : 0,
        total_closing_cost_estimated: form.total_closing_cost_estimated ? Number(form.total_closing_cost_estimated) : 0,
        service_fee: form.service_fee ? Number(form.service_fee) : 0,
        title_fees: form.title_fees ? Number(form.title_fees) : 0,
        government_fees: form.government_fees ? Number(form.government_fees) : 0,
        escrow_tax_insurance: form.escrow_tax_insurance ? Number(form.escrow_tax_insurance) : 0,
        appraisal_fee: form.appraisal_fee ? Number(form.appraisal_fee) : 0,
        underwriting_fee: form.underwriting_fee ? Number(form.underwriting_fee) : 0,
        credit_report_fee: form.credit_report_fee ? Number(form.credit_report_fee) : 0,
        processing_fee: form.processing_fee ? Number(form.processing_fee) : 0,
        recording_fee: form.recording_fee ? Number(form.recording_fee) : 0,
        legal_fee: form.legal_fee ? Number(form.legal_fee) : 0,
        other_costs: form.other_costs ? Number(form.other_costs) : 0,
        down_payment: form.down_payment ? Number(form.down_payment) : 0,
        closing_cost: form.closing_cost ? Number(form.closing_cost) : 0,
        reserves_6_months: form.reserves_6_months ? Number(form.reserves_6_months) : 0,

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

  const computeDownPaymentPercent = () => {
    const loan = Number(form.loan_amount || 0);
    const down = Number(form.down_payment || 0);
    if (!loan || !down) return "";
    return ((down / loan) * 100).toFixed(2);
  };

  const computePrincipalAndInterest = () => {
    const piti = Number(form.mortgage_payment_piti || 0);
    const taxes = Number(form.prop_taxes || 0);
    const hoi = Number(form.hoi || 0);
    const hoa = Number(form.hoa || 0);
    const flood = Number(form.flood_insurance || 0);
    const pi = piti - (taxes + hoi + hoa + flood);
    if (!Number.isFinite(pi) || pi < 0) return "";
    return pi.toFixed(2);
  };

  return (
    <form className={`container-fluid ${styles.formBlock} ${styles.twoColsWrap}`} onSubmit={handleSubmit} style={{ maxWidth: '100%', margin: '0 auto', background: 'none', boxShadow: 'none', border: 'none' }}>
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
      <h6 className="my_title_color fw-bold mt-2 mb-2">1. BORROWER INFORMATION</h6>
      <div className="row gy-1">
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">BORROWERS NAME</label>
            <input className={styles.input} name="borrower_name" value={form.borrower_name} onChange={handleChange} />
          </div>
        </div>
        <div className="col-md-2 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">DSCR</label>
            <NumericFormat className={styles.input} name="dscr_ratio" value={form.dscr_ratio} onValueChange={({ value }) => handleNumberFormat("dscr_ratio", value)} decimalScale={3} allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">LEGAL STATUS</label>
            <select className={styles.select} name="legal_status" value={form.legal_status} onChange={handleChange}>
              <option value="">Seleccione...</option>
              <option value="CITIZEN">CITIZEN</option>
              <option value="GREEN CARD">GREEN CARD</option>
              <option value="EMD">EMD</option>
              <option value="ITIN">ITIN</option>
              <option value="FN">FN</option>
            </select>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">ISSUED DATE</label>
            <input type="date" className={styles.input} name="issued_date" value={form.issued_date} onChange={handleChange} />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">CLOSING COST APROX</label>
            <NumericFormat className={styles.input} name="closing_cost_approx" value={form.closing_cost_approx} onValueChange={({ value }) => handleNumberFormat("closing_cost_approx", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-5 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">SUBJECT PROPERTY ADDRESS</label>
            <input className={styles.input} name="property_address" value={form.property_address} onChange={handleChange} />
          </div>
        </div>
        <div className="col-md-2 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">DOWN PAYMENT %</label>
            <NumericFormat className={styles.input} value={computeDownPaymentPercent()} suffix="%" decimalScale={2} allowNegative={false} inputMode="decimal" disabled />
          </div>
        </div>
        <div className="col-md-2 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">STIMATED FICO SCORE</label>
            <NumericFormat className={styles.input} name="fico" value={form.fico} onValueChange={({ value }) => handleNumberFormat("fico", value)} allowNegative={false} decimalScale={0} inputMode="numeric" />
            {ficoError && (<span style={{ color: 'red', fontSize: 13 }}>{ficoError}</span>)}
            {!ficoError && getFicoCategory(form.fico) && (<span style={{ color: '#2c3e50', fontSize: 13, fontWeight: 500 }}>{getFicoCategory(form.fico)}</span>)}
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-3 mb-2 d-flex align-items-center" style={{ height: 38 }}>
          <input type="checkbox" id="dscr_required" className="form-check-input me-2" checked={!!form.dscr_required} onChange={(e) => setForm((p) => ({ ...p, dscr_required: e.target.checked }))} />
          <label htmlFor="dscr_required" className="form-label text-muted small mb-0">DSCR MUST BE 1%</label>
        </div>
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">PROPERTY UNDER LLC</label>
            <input className={styles.input} name="subject_prop_under_llc" value={form.subject_prop_under_llc} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* ==============================
          2. TYPE OF PROGRAM
          ============================== */}
      <h6 className="my_title_color fw-bold mt-3 mb-2">2. TYPE OF PROGRAM</h6>
      <div className="row gy-1">
        <div className="col-md-4 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">TYPE OF PROGRAM</label>
            <input className={styles.input} name="type_of_program" value={form.type_of_program} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* ==============================
          3. LOAN DETAILS
          ============================== */}
      <h6 className="my_title_color fw-bold mt-3 mb-2">3. LOAN DETAILS</h6>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Loan Type</label>
            <select className={styles.select} name="loan_type" value={form.loan_type} onChange={handleChange}>
              <option value="">Seleccione...</option>
              <option value="DSCR - Refi CashOut">DSCR - Refi CashOut</option>
              <option value="DSCR - Refi Rate & Term">DSCR - Refi Rate & Term</option>
              <option value="DSCR - Purchase">DSCR - Purchase</option>
              <option value="12-Bank Statements">12-Bank Statements</option>
              <option value="24-Bank Statements">24-Bank Statements</option>
              <option value="P&L Only">P&L Only</option>
            </select>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Appraisal value</label>
            <NumericFormat className={styles.input} name="appraisal_value" value={form.appraisal_value} onValueChange={({ value }) => handleNumberFormat("appraisal_value", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Property type</label>
            <input className={styles.input} name="property_type" value={form.property_type} onChange={handleChange} />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Annual Interest Rate</label>
            <NumericFormat className={styles.input} name="interest_rate" value={form.interest_rate} onValueChange={({ value }) => handleNumberFormat("interest_rate", value)} suffix="%" decimalScale={3} allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Estimated Closing Date</label>
            <input type="date" className={styles.input} name="estimated_closing_date" value={form.estimated_closing_date} onChange={handleChange} />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Rent Amount</label>
            <NumericFormat className={styles.input} name="rent_amount" value={form.rent_amount} onValueChange={({ value }) => handleNumberFormat("rent_amount", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Interest Rate Estructure</label>
            <input className={styles.input} name="interest_rate_structure" value={form.interest_rate_structure} onChange={handleChange} />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Property Taxes (impuesto de propiedad)</label>
            <NumericFormat className={styles.input} name="prop_taxes" value={form.prop_taxes} onValueChange={({ value }) => handleNumberFormat("prop_taxes", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Loan Term</label>
            <NumericFormat className={styles.input} name="loan_term" value={form.loan_term} onValueChange={({ value }) => handleNumberFormat("loan_term", value)} allowNegative={false} decimalScale={0} inputMode="numeric" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">property insurance (HOI)</label>
            <NumericFormat className={styles.input} name="hoi" value={form.hoi} onValueChange={({ value }) => handleNumberFormat("hoi", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Prepayment Penalty</label>
            <NumericFormat className={styles.input} name="prepayment_penalty" value={form.prepayment_penalty} onValueChange={({ value }) => handleNumberFormat("prepayment_penalty", value)} allowNegative={false} decimalScale={0} inputMode="numeric" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">HOA</label>
            <NumericFormat className={styles.input} name="hoa" value={form.hoa} onValueChange={({ value }) => handleNumberFormat("hoa", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Prepayment Penalty Type</label>
            <input className={styles.input} name="prepayment_penalty_type" value={form.prepayment_penalty_type} onChange={handleChange} />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Flood Insurance</label>
            <NumericFormat className={styles.input} name="flood_insurance" value={form.flood_insurance} onValueChange={({ value }) => handleNumberFormat("flood_insurance", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted mb-1">Maximun LTV (Loan To Value)</label>
            <NumericFormat className={styles.input} name="ltv_request" value={form.ltv_request} onValueChange={({ value }) => handleNumberFormat("ltv_request", value)} suffix="%" decimalScale={2} allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Pay Off Amount</label>
            <NumericFormat className={styles.input} name="payoff_amount" value={form.payoff_amount} onValueChange={({ value }) => handleNumberFormat("payoff_amount", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>

      {/* ==============================
          4. LOAN SUMARY
          ============================== */}
      <h6 className="my_title_color fw-bold mt-3 mb-2">4. LOAN SUMARY</h6>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">LOAN AMOUNT</label>
            <NumericFormat className={styles.input} name="loan_amount" value={form.loan_amount} onValueChange={({ value }) => handleNumberFormat("loan_amount", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">DOWNPAYMENT</label>
            <NumericFormat className={styles.input} name="down_payment" value={form.down_payment} onValueChange={({ value }) => handleNumberFormat("down_payment", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">CASH OUT</label>
            <NumericFormat className={styles.input} name="cash_out" value={form.cash_out} onValueChange={({ value }) => handleNumberFormat("cash_out", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">MORTGAGE PAYMENT PITI</label>
            <NumericFormat className={styles.input} name="mortgage_payment_piti" value={form.mortgage_payment_piti} onValueChange={({ value }) => handleNumberFormat("mortgage_payment_piti", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>

      {/* ==============================
          5. LOAN CLOSING COST ESTIMATED
          ============================== */}
      <h6 className="my_title_color fw-bold mt-3 mb-2">5. LOAN CLOSING COST ESTIMATED</h6>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Origination Fee 2,0%</label>
            <select className={styles.select} name="origination_fee_percentage" value={form.origination_fee_percentage} onChange={handleChange}>
              <option value="">Seleccione...</option>
              <option value="0.02">Origination Fee 2.0%</option>
              <option value="0.015">Origination Fee 1.5%</option>
              <option value="0.01">Origination Fee 1.0%</option>
            </select>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Discount Points</label>
            <NumericFormat className={styles.input} name="discount_points" value={form.discount_points} onValueChange={({ value }) => handleNumberFormat("discount_points", value)} decimalScale={3} allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Underwriting fee</label>
            <NumericFormat className={styles.input} name="underwriting_fee" value={form.underwriting_fee} onValueChange={({ value }) => handleNumberFormat("underwriting_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Credit Report Fee</label>
            <NumericFormat className={styles.input} name="credit_report_fee" value={form.credit_report_fee} onValueChange={({ value }) => handleNumberFormat("credit_report_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Processing Fee</label>
            <NumericFormat className={styles.input} name="processing_fee" value={form.processing_fee} onValueChange={({ value }) => handleNumberFormat("processing_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Recording Fee (*)</label>
            <NumericFormat className={styles.input} name="recording_fee" value={form.recording_fee} onValueChange={({ value }) => handleNumberFormat("recording_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Legal Fee (*)</label>
            <NumericFormat className={styles.input} name="legal_fee" value={form.legal_fee} onValueChange={({ value }) => handleNumberFormat("legal_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Title Fees (*)</label>
            <NumericFormat className={styles.input} name="title_fees" value={form.title_fees} onValueChange={({ value }) => handleNumberFormat("title_fees", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Goverment Fees / Transfer tax (*)</label>
            <NumericFormat className={styles.input} name="government_fees" value={form.government_fees} onValueChange={({ value }) => handleNumberFormat("government_fees", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Appraisal Fee (TBD)</label>
            <NumericFormat className={styles.input} name="appraisal_fee" value={form.appraisal_fee} onValueChange={({ value }) => handleNumberFormat("appraisal_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Service Fee (*)</label>
            <NumericFormat className={styles.input} name="service_fee" value={form.service_fee} onValueChange={({ value }) => handleNumberFormat("service_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Escrow tax & Insurance (*)</label>
            <NumericFormat className={styles.input} name="escrow_tax_insurance" value={form.escrow_tax_insurance} onValueChange={({ value }) => handleNumberFormat("escrow_tax_insurance", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Other</label>
            <NumericFormat className={styles.input} name="other_costs" value={form.other_costs} onValueChange={({ value }) => handleNumberFormat("other_costs", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Total Closing Cost Estimated</label>
            <NumericFormat className={styles.input} name="total_closing_cost_estimated" value={form.total_closing_cost_estimated} onValueChange={({ value }) => handleNumberFormat("total_closing_cost_estimated", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>

      {/* ==============================
          6. DSCR - PITI
          ============================== */}
      <h6 className="my_title_color fw-bold mt-3 mb-2">6. DSCR - PITI</h6>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Principal & Interest</label>
            <NumericFormat className={styles.input} value={computePrincipalAndInterest()} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Property Taxes Estimated</label>
            <NumericFormat className={styles.input} name="prop_taxes" value={form.prop_taxes} onValueChange={({ value }) => handleNumberFormat("prop_taxes", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-2 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Property Insurance</label>
            <NumericFormat className={styles.input} name="hoi" value={form.hoi} onValueChange={({ value }) => handleNumberFormat("hoi", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-2 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">HOA</label>
            <NumericFormat className={styles.input} name="hoa" value={form.hoa} onValueChange={({ value }) => handleNumberFormat("hoa", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-2 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Flood Insurance</label>
            <NumericFormat className={styles.input} name="flood_insurance" value={form.flood_insurance} onValueChange={({ value }) => handleNumberFormat("flood_insurance", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>

      {/* ==============================
          7. MINIMUM BORROWWER'S LIQUIDITY REQUIREMENTS
          ============================== */}
      <h6 className="my_title_color fw-bold mt-3 mb-2">7. MINIMUM BORROWWER'S LIQUIDITY REQUIREMENTS</h6>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Down Payment</label>
            <NumericFormat className={styles.input} name="down_payment" value={form.down_payment} onValueChange={({ value }) => handleNumberFormat("down_payment", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Closing cost</label>
            <NumericFormat className={styles.input} name="closing_cost_estimated" value={form.closing_cost_estimated} onValueChange={({ value }) => handleNumberFormat("closing_cost_estimated", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">6 months Reserves</label>
            <NumericFormat className={styles.input} name="reserves_6_months" value={form.reserves_6_months} onValueChange={({ value }) => handleNumberFormat("reserves_6_months", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Escrow tax & Insurance</label>
            <NumericFormat className={styles.input} name="escrow_tax_insurance" value={form.escrow_tax_insurance} onValueChange={({ value }) => handleNumberFormat("escrow_tax_insurance", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Other</label>
            <NumericFormat className={styles.input} name="other_costs" value={form.other_costs} onValueChange={({ value }) => handleNumberFormat("other_costs", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Appraisal Fee (TBD)</label>
            <NumericFormat className={styles.input} name="appraisal_fee" value={form.appraisal_fee} onValueChange={({ value }) => handleNumberFormat("appraisal_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Service Fee (*)</label>
            <NumericFormat className={styles.input} name="service_fee" value={form.service_fee} onValueChange={({ value }) => handleNumberFormat("service_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Title Fees (*)</label>
            <NumericFormat className={styles.input} name="title_fees" value={form.title_fees} onValueChange={({ value }) => handleNumberFormat("title_fees", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>
      <div className="row gy-1">
        <div className="col-md-3 mb-2">
          <div className="d-flex flex-column">
            <label className="form-label text-muted small mb-1">Goverment Fees / Transfer tax (*)</label>
            <NumericFormat className={styles.input} name="government_fees" value={form.government_fees} onValueChange={({ value }) => handleNumberFormat("government_fees", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`alert ${feedback.includes("exitosamente") ? "alert-success" : "alert-danger"} py-2 mb-3`}>
          {feedback}
        </div>
      )}

      <div className="row">
        <div className="col-12 mt-3 pt-3 pb-5">
          <button type="submit" className={styles.button} style={{ minWidth: "200px" }} disabled={loading}>
            <span className="text-white">{loading ? "CREANDO..." : "CREAR DSCR"}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default DscrForm; 