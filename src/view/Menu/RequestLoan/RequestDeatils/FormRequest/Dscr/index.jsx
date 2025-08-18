import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createDscr, updateDscr } from "../../../../../../Api/dscr";
import { getRequestLinks, createRequestLink, sendRequestLink } from "../../../../../../Api/requestLink";
import { sendTemplateEmail } from "../../../../../../Api/emailTemplate";

const URL_EXTERNAL_FORM = import.meta.env.VITE_URL_EXTERMAL_FORM;

const initialState = {
  // Borrower information
  borrower_name: "",
  guarantor_name: "",
  legal_status: "",
  entity_name: "",
  issued_date: "",
  // Scores
  fico: "",
  // Property
  property_type: "",
  property_units: "",
  property_address: "",
  property_city: "",
  property_state: "",
  property_zip: "",
  subject_prop_under_llc: "",
  // Loan / program
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
  // Income / property payments
  rent_amount: "",
  mortgage_payment_piti: "",
  prop_taxes: "",
  hoi: "",
  hoa: "",
  flood_insurance: "",
  // Prepayment / DSCR
  prepayment_penalty: "",
  prepayment_penalty_type: "",
  dscr_ratio: "",
  dscr_required: false,
  dscr_flag: false,
  // Closing costs / fees
  closing_cost_approx: "",
  closing_cost_estimated: "",
  total_closing_cost_estimated: "",
  service_fee: "",
  title_fees: "",
  government_fees: "",
  escrow_tax_insurance: "",
  appraisal_fee: "",
  down_payment: "",
  closing_cost: "",
  reserves_6_months: "",
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
        // Borrower information
        borrower_name: solicitud.borrower_name || "",
        guarantor_name: solicitud.guarantor_name || "",
        legal_status: solicitud.legal_status || "",
        entity_name: solicitud.entity_name || "",
        issued_date: solicitud.issued_date || "",
        // Scores
        fico: solicitud.fico || "",
        // Property
        property_type: solicitud.property_type || "",
        property_units: solicitud.property_units || "",
        property_address: solicitud.property_address || "",
        property_city: solicitud.property_city || "",
        property_state: solicitud.property_state || "",
        property_zip: solicitud.property_zip || "",
        subject_prop_under_llc: solicitud.subject_prop_under_llc || "",
        // Loan / program
        loan_type: solicitud.loan_type || "",
        type_of_program: solicitud.type_of_program || "",
        appraisal_value: solicitud.appraisal_value || "",
        loan_amount: solicitud.loan_amount || "",
        loan_term: solicitud.loan_term || "",
        ltv_request: solicitud.ltv_request || "",
        interest_rate: solicitud.interest_rate || "",
        interest_rate_structure: solicitud.interest_rate_structure || "",
        discount_points: solicitud.discount_points || "",
        origination_fee_percentage: solicitud.origination_fee_percentage || "",
        origination_fee_amount: solicitud.origination_fee_amount || "",
        payoff_amount: solicitud.payoff_amount || "",
        cash_out: solicitud.cash_out || "",
        estimated_closing_date: solicitud.estimated_closing_date || "",
        // Income / property payments
        rent_amount: solicitud.rent_amount || "",
        mortgage_payment_piti: solicitud.mortgage_payment_piti || "",
        prop_taxes: solicitud.prop_taxes || "",
        hoi: solicitud.hoi || "",
        hoa: solicitud.hoa || "",
        flood_insurance: solicitud.flood_insurance || "",
        // Prepayment / DSCR
        prepayment_penalty: solicitud.prepayment_penalty || "",
        prepayment_penalty_type: solicitud.prepayment_penalty_type || "",
        dscr_ratio: solicitud.dscr_ratio || "",
        dscr_required: Boolean(solicitud.dscr_required),
        dscr_flag: Boolean(solicitud.dscr_flag),
        // Closing costs / fees
        closing_cost_approx: solicitud.closing_cost_approx || "",
        closing_cost_estimated: solicitud.closing_cost_estimated || "",
        total_closing_cost_estimated: solicitud.total_closing_cost_estimated || "",
        service_fee: solicitud.service_fee || "",
        title_fees: solicitud.title_fees || "",
        government_fees: solicitud.government_fees || "",
        escrow_tax_insurance: solicitud.escrow_tax_insurance || "",
        appraisal_fee: solicitud.appraisal_fee || "",
        down_payment: solicitud.down_payment || "",
        closing_cost: solicitud.closing_cost || "",
        reserves_6_months: solicitud.reserves_6_months || "",
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

  const computeDownPaymentPercent = () => {
    const loan = Number(form.loan_amount || 0);
    const down = Number(form.down_payment || 0);
    if (!loan || !down) return "";
    const pct = (down / loan) * 100;
    return pct.toFixed(2);
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
    <form className={`container-fluid ${styles.formBlock} ${styles.twoColsWrap}`} onSubmit={solicitud ? handleUpdate : handleSubmit} style={{ maxWidth: '100%', margin: '0 auto', background: 'none', boxShadow: 'none', border: 'none' }}>
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
            {/* <div className="col-md-3">
              <label className="form-label my_title_color">ID</label>
              <input className={`form-control ${styles.input}`} value={cliente.id || ""} disabled />
            </div> */}
          </div>
        </div>
        )}
      {cliente && (
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
      )}
        {/* ==============================
            1. BORROWER INFORMATION
            ============================== */}
        <h6 className="my_title_color fw-bold mt-2 mb-2">1. BORROWER INFORMATION</h6>
        <div className="row gy-1">
          <div className="col-md-4 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">BORROWERS NAME</label>
              <input className={styles.input} name="borrower_name" value={form.borrower_name} onChange={handleChange} disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-2 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">DSCR</label>
              <NumericFormat className={styles.input} name="dscr_ratio" value={form.dscr_ratio} onValueChange={({ value }) => handleNumberFormat("dscr_ratio", value)} decimalScale={3} allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">LEGAL STATUS</label>
              <select className={styles.select} name="legal_status" value={form.legal_status} onChange={handleChange} disabled={!editable && !isEditMode}>
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
              <input type="date" className={styles.input} name="issued_date" value={form.issued_date} onChange={handleChange} disabled={!editable && !isEditMode} />
            </div>
          </div>
        </div>
        <div className="row gy-1">
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">CLOSING COST APROX</label>
              <NumericFormat className={styles.input} name="closing_cost_approx" value={form.closing_cost_approx} onValueChange={({ value }) => handleNumberFormat("closing_cost_approx", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-5 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">SUBJECT PROPERTY ADDRESS</label>
              <input className={styles.input} name="property_address" value={form.property_address} onChange={handleChange} disabled={!editable && !isEditMode} />
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
              <NumericFormat className={styles.input} name="fico" value={form.fico} onValueChange={({ value }) => handleNumberFormat("fico", value)} allowNegative={false} decimalScale={0} inputMode="numeric" disabled={!editable && !isEditMode} />
              {ficoError && (<span style={{ color: 'red', fontSize: 13 }}>{ficoError}</span>)}
              {!ficoError && getFicoCategory(form.fico) && (<span style={{ color: '#2c3e50', fontSize: 13, fontWeight: 500 }}>{getFicoCategory(form.fico)}</span>)}
            </div>
          </div>
        </div>
        <div className="row gy-1">
          <div className="col-md-3 mb-2 d-flex align-items-center" style={{ height: 38 }}>
            <input type="checkbox" id="dscr_required" className="form-check-input me-2" checked={!!form.dscr_required} onChange={(e) => setForm((p) => ({ ...p, dscr_required: e.target.checked }))} disabled={!editable && !isEditMode} />
            <label htmlFor="dscr_required" className="form-label text-muted small mb-0">DSCR MUST BE 1%</label>
          </div>
          <div className="col-md-4 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">PROPERTY UNDER LLC</label>
              <input className={styles.input} name="subject_prop_under_llc" value={form.subject_prop_under_llc} onChange={handleChange} disabled={!editable && !isEditMode} />
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
              <input className={styles.input} name="type_of_program" value={form.type_of_program} onChange={handleChange} disabled={!editable && !isEditMode} />
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
              <select className={styles.select} name="loan_type" value={form.loan_type} onChange={handleChange} disabled={!editable && !isEditMode}>
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
              <NumericFormat className={styles.input} name="appraisal_value" value={form.appraisal_value} onValueChange={({ value }) => handleNumberFormat("appraisal_value", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Property type</label>
              <input className={styles.input} name="property_type" value={form.property_type} onChange={handleChange} disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Annual Interest Rate</label>
              <NumericFormat className={styles.input} name="interest_rate" value={form.interest_rate} onValueChange={({ value }) => handleNumberFormat("interest_rate", value)} suffix="%" decimalScale={3} allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
        </div>
        <div className="row gy-1">
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Estimated Closing Date</label>
              <input type="date" className={styles.input} name="estimated_closing_date" value={form.estimated_closing_date} onChange={handleChange} disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Rent Amount</label>
              <NumericFormat className={styles.input} name="rent_amount" value={form.rent_amount} onValueChange={({ value }) => handleNumberFormat("rent_amount", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Interest Rate Estructure</label>
              <input className={styles.input} name="interest_rate_structure" value={form.interest_rate_structure} onChange={handleChange} disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Property Taxes (impuesto de propiedad)</label>
              <NumericFormat className={styles.input} name="prop_taxes" value={form.prop_taxes} onValueChange={({ value }) => handleNumberFormat("prop_taxes", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
        </div>
        <div className="row gy-1">
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Loan Term</label>
              <NumericFormat className={styles.input} name="loan_term" value={form.loan_term} onValueChange={({ value }) => handleNumberFormat("loan_term", value)} allowNegative={false} decimalScale={0} inputMode="numeric" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">property insurance (HOI)</label>
              <NumericFormat className={styles.input} name="hoi" value={form.hoi} onValueChange={({ value }) => handleNumberFormat("hoi", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Prepayment Penalty</label>
              <NumericFormat className={styles.input} name="prepayment_penalty" value={form.prepayment_penalty} onValueChange={({ value }) => handleNumberFormat("prepayment_penalty", value)} allowNegative={false} decimalScale={0} inputMode="numeric" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">HOA</label>
              <NumericFormat className={styles.input} name="hoa" value={form.hoa} onValueChange={({ value }) => handleNumberFormat("hoa", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
        </div>
        <div className="row gy-1">
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Prepayment Penalty Type</label>
              <input className={styles.input} name="prepayment_penalty_type" value={form.prepayment_penalty_type} onChange={handleChange} disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Flood Insurance</label>
              <NumericFormat className={styles.input} name="flood_insurance" value={form.flood_insurance} onValueChange={({ value }) => handleNumberFormat("flood_insurance", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted mb-1">Maximun LTV (Loan To Value)</label>
              <NumericFormat className={styles.input} name="ltv_request" value={form.ltv_request} onValueChange={({ value }) => handleNumberFormat("ltv_request", value)} suffix="%" decimalScale={2} allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Pay Off Amount</label>
              <NumericFormat className={styles.input} name="payoff_amount" value={form.payoff_amount} onValueChange={({ value }) => handleNumberFormat("payoff_amount", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
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
              <NumericFormat className={styles.input} name="loan_amount" value={form.loan_amount} onValueChange={({ value }) => handleNumberFormat("loan_amount", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">DOWNPAYMENT</label>
              <NumericFormat className={styles.input} name="down_payment" value={form.down_payment} onValueChange={({ value }) => handleNumberFormat("down_payment", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">CASH OUT</label>
              <NumericFormat className={styles.input} name="cash_out" value={form.cash_out} onValueChange={({ value }) => handleNumberFormat("cash_out", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">MORTGAGE PAYMENT PITI</label>
              <NumericFormat className={styles.input} name="mortgage_payment_piti" value={form.mortgage_payment_piti} onValueChange={({ value }) => handleNumberFormat("mortgage_payment_piti", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
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
              <select className={styles.select} name="origination_fee_percentage" value={form.origination_fee_percentage} onChange={handleChange} disabled={!editable && !isEditMode}>
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
              <NumericFormat className={styles.input} name="discount_points" value={form.discount_points} onValueChange={({ value }) => handleNumberFormat("discount_points", value)} decimalScale={3} allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Title Fees (*)</label>
              <NumericFormat className={styles.input} name="title_fees" value={form.title_fees} onValueChange={({ value }) => handleNumberFormat("title_fees", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Goverment Fees / Transfer tax (*)</label>
              <NumericFormat className={styles.input} name="government_fees" value={form.government_fees} onValueChange={({ value }) => handleNumberFormat("government_fees", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
        </div>
        <div className="row gy-1">
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Appraisal Fee (TBD)</label>
              <NumericFormat className={styles.input} name="appraisal_fee" value={form.appraisal_fee} onValueChange={({ value }) => handleNumberFormat("appraisal_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Service Fee (*)</label>
              <NumericFormat className={styles.input} name="service_fee" value={form.service_fee} onValueChange={({ value }) => handleNumberFormat("service_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Escrow tax & Insurance (*)</label>
              <NumericFormat className={styles.input} name="escrow_tax_insurance" value={form.escrow_tax_insurance} onValueChange={({ value }) => handleNumberFormat("escrow_tax_insurance", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Total Closing Cost Estimated</label>
              <NumericFormat className={styles.input} name="total_closing_cost_estimated" value={form.total_closing_cost_estimated} onValueChange={({ value }) => handleNumberFormat("total_closing_cost_estimated", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
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
              <NumericFormat className={styles.input} name="prop_taxes" value={form.prop_taxes} onValueChange={({ value }) => handleNumberFormat("prop_taxes", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-2 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Property Insurance</label>
              <NumericFormat className={styles.input} name="hoi" value={form.hoi} onValueChange={({ value }) => handleNumberFormat("hoi", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-2 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">HOA</label>
              <NumericFormat className={styles.input} name="hoa" value={form.hoa} onValueChange={({ value }) => handleNumberFormat("hoa", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-2 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Flood Insurance</label>
              <NumericFormat className={styles.input} name="flood_insurance" value={form.flood_insurance} onValueChange={({ value }) => handleNumberFormat("flood_insurance", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
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
              <NumericFormat className={styles.input} name="down_payment" value={form.down_payment} onValueChange={({ value }) => handleNumberFormat("down_payment", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Closing cost</label>
              <NumericFormat className={styles.input} name="closing_cost_estimated" value={form.closing_cost_estimated} onValueChange={({ value }) => handleNumberFormat("closing_cost_estimated", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">6 months Reserves</label>
              <NumericFormat className={styles.input} name="reserves_6_months" value={form.reserves_6_months} onValueChange={({ value }) => handleNumberFormat("reserves_6_months", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Escrow tax & Insurance</label>
              <NumericFormat className={styles.input} name="escrow_tax_insurance" value={form.escrow_tax_insurance} onValueChange={({ value }) => handleNumberFormat("escrow_tax_insurance", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
        </div>
        <div className="row gy-1">
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Appraisal Fee (TBD)</label>
              <NumericFormat className={styles.input} name="appraisal_fee" value={form.appraisal_fee} onValueChange={({ value }) => handleNumberFormat("appraisal_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Service Fee (*)</label>
              <NumericFormat className={styles.input} name="service_fee" value={form.service_fee} onValueChange={({ value }) => handleNumberFormat("service_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Title Fees (*)</label>
              <NumericFormat className={styles.input} name="title_fees" value={form.title_fees} onValueChange={({ value }) => handleNumberFormat("title_fees", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex flex-column">
              <label className="form-label text-muted small mb-1">Goverment Fees / Transfer tax (*)</label>
              <NumericFormat className={styles.input} name="government_fees" value={form.government_fees} onValueChange={({ value }) => handleNumberFormat("government_fees", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" disabled={!editable && !isEditMode} />
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