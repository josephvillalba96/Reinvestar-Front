import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createFixflip } from "../../../../../../Api/fixflip";
import { createRequestLink } from "../../../../../../Api/requestLink";
import { getClientById } from "../../../../../../Api/client";
import { sendTemplateEmail } from "../../../../../../Api/emailTemplate";

const URL_EXTERNAL_FORM = import.meta.env.VITE_URL_EXTERMAL_FORM;

const initialState = {
  // Propiedad
  property_type: "",
  property_address: "",
  property_city: "",
  property_state: "",
  property_zip_code: "",
  property_value: "",

  // Préstamo base
  loan_amount: "",
  loan_type: "",
  loan_purpose: "",
  loan_term: "",
  interest_rate: "",
  payment_type: "",
  loan_position: "",
  prepayment_terms: "",

  // Compras / Rehab / Valores
  purchase_price: "",
  renovation_cost: "",
  after_repair_value: "",
  ltv: "",

  // Construcción / draw
  rehab_budget: "",
  total_project_cost: "",
  ltc: "",
  construction_type: "",
  draw_schedule: "",
  inspection_frequency: "",
  renovation_timeline: "",
  rehab_timeline: "",

  // Pagos y costos de intereses
  monthly_payment: "",
  total_interest: "",
  total_loan_cost: "",

  // Documentación / requisitos
  scope_of_work: "",
  permits_required: false,
  timeline: "",
  appraisal_required: false,
  title_insurance: false,
  borrower_experience: "",
  exit_strategy: "",
  purchase_type: "",
  refinance_type: "",
  cash_out_amount: "",

  // Fees / costos de cierre
  origination_fee: "",
  underwriting_fee: "",
  processing_fee: "",
  legal_fee: "",
  total_closing_costs: "",

  // Reservas y gastos operativos
  insurance: "",
  property_taxes: "",
  utilities: "",
  maintenance: "",
  cash_reserves: "",

  // Comprobación financiera
  bank_statements_required: false,
  proof_of_funds: "",

  // Notas
  notes: "",

  // Datos auxiliares visuales
  contractor_info: ""
};

const FixflipForm = ({ client_id, goToDocumentsTab }) => {
  const [form, setForm] = useState({ ...initialState });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [client, setClient] = useState(null);
  const [externalLink, setExternalLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setForm({ ...initialState });
    if (client_id) {
      getClientById(client_id).then(setClient).catch(() => setClient(null));
    }
  }, [client_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberFormat = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const computeLtv = () => {
    const loanAmountNum = form.loan_amount === "" ? 0 : Number(form.loan_amount);
    const propertyValueNum = form.property_value === "" ? 0 : Number(form.property_value);
    const arvNum = form.after_repair_value === "" ? 0 : Number(form.after_repair_value);
    const purchaseNum = form.purchase_price === "" ? 0 : Number(form.purchase_price);
    const base = propertyValueNum || arvNum || purchaseNum;
    if (base > 0) return Number(((loanAmountNum / base) * 100).toFixed(2));
    return 0;
  };

  const computeLtc = () => {
    const loanAmountNum = form.loan_amount === "" ? 0 : Number(form.loan_amount);
    const totalProjectNum = form.total_project_cost === "" ? 0 : Number(form.total_project_cost);
    if (totalProjectNum > 0) return Number(((loanAmountNum / totalProjectNum) * 100).toFixed(2));
    return 0;
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
          request_type: "Fixflip",
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

    setLoading(true);
    setFeedback("");

    try {
      // 1. Preparar datos de la solicitud
      const loanAmountNum = form.loan_amount === "" ? 0 : Number(form.loan_amount);
      const propertyValueNum = form.property_value === "" ? 0 : Number(form.property_value);
      const purchaseNum = form.purchase_price === "" ? 0 : Number(form.purchase_price);
      const afterRepairNum = form.after_repair_value === "" ? 0 : Number(form.after_repair_value);
      const totalProjectNum = form.total_project_cost === "" ? 0 : Number(form.total_project_cost);

      const ltv = computeLtv();
      const ltc = computeLtc();

      const dataToSend = {
        client_id: Number(client_id),
        loan_amount: loanAmountNum || 0,
        property_value: propertyValueNum || afterRepairNum || purchaseNum || 0,
        property_address: form.property_address || "",
        property_type: form.property_type || "",
        property_city: form.property_city || "",
        property_state: form.property_state || "",
        property_zip_code: form.property_zip_code || "",
        ltv,
        purchase_price: purchaseNum || 0,
        renovation_cost: form.renovation_cost === "" ? 0 : Number(form.renovation_cost),
        after_repair_value: afterRepairNum || 0,
        renovation_timeline: form.renovation_timeline || "",
        contractor_info: form.contractor_info || "",

        loan_type: form.loan_type || "",
        loan_purpose: form.loan_purpose || "",
        loan_term: form.loan_term || "",
        interest_rate: form.interest_rate === "" ? 0 : Number(form.interest_rate),
        payment_type: form.payment_type || "",
        loan_position: form.loan_position || "",
        prepayment_terms: form.prepayment_terms || "",

        rehab_budget: form.rehab_budget === "" ? 0 : Number(form.rehab_budget),
        total_project_cost: totalProjectNum || 0,
        ltc,
        construction_type: form.construction_type || "",
        draw_schedule: form.draw_schedule || "",
        inspection_frequency: form.inspection_frequency || "",
        rehab_timeline: form.rehab_timeline || "",

        monthly_payment: form.monthly_payment === "" ? 0 : Number(form.monthly_payment),
        total_interest: form.total_interest === "" ? 0 : Number(form.total_interest),
        total_loan_cost: form.total_loan_cost === "" ? 0 : Number(form.total_loan_cost),

        scope_of_work: form.scope_of_work || "",
        permits_required: Boolean(form.permits_required),
        timeline: form.timeline || "",
        appraisal_required: Boolean(form.appraisal_required),
        title_insurance: Boolean(form.title_insurance),
        borrower_experience: form.borrower_experience || "",
        exit_strategy: form.exit_strategy || "",
        purchase_type: form.purchase_type || "",
        refinance_type: form.refinance_type || "",
        cash_out_amount: form.cash_out_amount === "" ? 0 : Number(form.cash_out_amount),

        origination_fee: form.origination_fee === "" ? 0 : Number(form.origination_fee),
        underwriting_fee: form.underwriting_fee === "" ? 0 : Number(form.underwriting_fee),
        processing_fee: form.processing_fee === "" ? 0 : Number(form.processing_fee),
        legal_fee: form.legal_fee === "" ? 0 : Number(form.legal_fee),
        total_closing_costs: form.total_closing_costs === "" ? 0 : Number(form.total_closing_costs),

        insurance: form.insurance === "" ? 0 : Number(form.insurance),
        property_taxes: form.property_taxes === "" ? 0 : Number(form.property_taxes),
        utilities: form.utilities === "" ? 0 : Number(form.utilities),
        maintenance: form.maintenance === "" ? 0 : Number(form.maintenance),
        cash_reserves: form.cash_reserves === "" ? 0 : Number(form.cash_reserves),

        bank_statements_required: Boolean(form.bank_statements_required),
        proof_of_funds: form.proof_of_funds || "",
        notes: form.notes || ""
      };

      // 2. Crear la solicitud Fixflip
      const response = await createFixflip(dataToSend);
      console.log('Respuesta createFixflip:', response);

      // 3. Crear el enlace
      const linkData = {
        valid_days: 30,
        fixflip_request_id: response.id,
        dscr_request_id: 0,
        construction_request_id: 0
      };

      const linkResponse = await createRequestLink(linkData);
      console.log('Respuesta createRequestLink:', linkResponse);

      if (linkResponse?.link_token) {
        const fullLink = `${URL_EXTERNAL_FORM}/fixflip/${linkResponse.link_token}`;
        setExternalLink(fullLink);
        
        // 4. Enviar email automáticamente
        await handleSendEmail(fullLink);
      }

      // 5. Actualizar UI y limpiar formulario
      setFeedback("¡Fixflip creado exitosamente!");
      setForm({ ...initialState });

      // 6. Navegar a documentos si es necesario
      if (typeof goToDocumentsTab === 'function') {
        goToDocumentsTab(response.id, 'fixflip');
      }

    } catch (error) {
      console.error('Error completo:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.data?.detail) {
        setFeedback(Array.isArray(error.response.data.detail) 
          ? error.response.data.detail[0]?.msg 
          : error.response.data.detail);
      } else if (error.message) {
        setFeedback(error.message);
      } else {
        setFeedback("Error al crear la solicitud. Por favor, intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`container-fluid ${styles.formBlock}`} onSubmit={handleSubmit} style={{ maxWidth: '100%', margin: '0 auto', background: 'none', boxShadow: 'none', border: 'none' }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <h4 className="my_title_color fw-bold mb-0" style={{ letterSpacing: 0.5 }}>Solicitud Fixflip</h4>
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

      {/* Propiedad */}
      <div className={styles.twoColsWrap}>
      <div className="row gy-4 mb-2">
        <div className="col-md-6">
          <label className="form-label my_title_color">Tipo de propiedad</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">Dirección de la propiedad</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="property_address"
            value={form.property_address}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-6">
          <label className="form-label my_title_color">Ciudad</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="property_city"
            value={form.property_city}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label my_title_color">Estado</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="property_state"
            value={form.property_state}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label my_title_color">Cód. postal</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="property_zip_code"
            value={form.property_zip_code}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-6">
          <label className="form-label my_title_color">Monto del préstamo</label>
          <NumericFormat
            className={`form-control ${styles.input}`}
            name="loan_amount"
            value={form.loan_amount}
            onValueChange={({ value }) => handleNumberFormat("loan_amount", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            placeholder="$0.00"
            inputMode="decimal"
            autoComplete="off"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">Valor de la propiedad</label>
          <NumericFormat
            className={`form-control ${styles.input}`}
            name="property_value"
            value={form.property_value}
            onValueChange={({ value }) => handleNumberFormat("property_value", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            placeholder="$0.00"
            inputMode="decimal"
            autoComplete="off"
          />
        </div>
      </div>

      {/* LTV y costos base */}
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-4">
          <label className="form-label my_title_color">Precio de compra</label>
          <NumericFormat
            className={`form-control ${styles.input}`}
            name="purchase_price"
            value={form.purchase_price}
            onValueChange={({ value }) => handleNumberFormat("purchase_price", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            placeholder="$0.00"
            inputMode="decimal"
            autoComplete="off"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Costo de remodelación</label>
          <NumericFormat
            className={`form-control ${styles.input}`}
            name="renovation_cost"
            value={form.renovation_cost}
            onValueChange={({ value }) => handleNumberFormat("renovation_cost", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            placeholder="$0.00"
            inputMode="decimal"
            autoComplete="off"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">ARV (valor después de remodelar)</label>
          <NumericFormat
            className={`form-control ${styles.input}`}
            name="after_repair_value"
            value={form.after_repair_value}
            onValueChange={({ value }) => handleNumberFormat("after_repair_value", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            placeholder="$0.00"
            inputMode="decimal"
            autoComplete="off"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">LTV estimado</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            value={`${computeLtv()}%`}
            disabled
          />
        </div>
      </div>

      {/* Términos del préstamo */}
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-4">
          <label className="form-label my_title_color">Tipo de préstamo</label>
          <input type="text" className={`form-control ${styles.input}`} name="loan_type" value={form.loan_type} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Propósito del préstamo</label>
          <input type="text" className={`form-control ${styles.input}`} name="loan_purpose" value={form.loan_purpose} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Plazo del préstamo</label>
          <input type="text" className={`form-control ${styles.input}`} name="loan_term" value={form.loan_term} onChange={handleChange} />
        </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-4">
          <label className="form-label my_title_color">Tasa de interés (%)</label>
          <NumericFormat className={`form-control ${styles.input}`} name="interest_rate" value={form.interest_rate} onValueChange={({ value }) => handleNumberFormat("interest_rate", value)} suffix="%" decimalScale={3} allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Tipo de pago</label>
          <input type="text" className={`form-control ${styles.input}`} name="payment_type" value={form.payment_type} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Posición del préstamo</label>
          <input type="text" className={`form-control ${styles.input}`} name="loan_position" value={form.loan_position} onChange={handleChange} />
        </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-6">
          <label className="form-label my_title_color">Términos de prepago</label>
          <input type="text" className={`form-control ${styles.input}`} name="prepayment_terms" value={form.prepayment_terms} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">Contratista</label>
          <input type="text" className={`form-control ${styles.input}`} name="contractor_info" value={form.contractor_info} onChange={handleChange} />
        </div>
      </div>

      {/* Construcción y draw */}
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-4">
          <label className="form-label my_title_color">Presupuesto de rehab</label>
          <NumericFormat className={`form-control ${styles.input}`} name="rehab_budget" value={form.rehab_budget} onValueChange={({ value }) => handleNumberFormat("rehab_budget", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Costo total del proyecto</label>
          <NumericFormat className={`form-control ${styles.input}`} name="total_project_cost" value={form.total_project_cost} onValueChange={({ value }) => handleNumberFormat("total_project_cost", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">LTC</label>
          <input type="text" className={`form-control ${styles.input}`} value={`${computeLtc()}%`} disabled />
        </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-4">
          <label className="form-label my_title_color">Tipo de construcción</label>
          <input type="text" className={`form-control ${styles.input}`} name="construction_type" value={form.construction_type} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Calendario de draws</label>
          <input type="text" className={`form-control ${styles.input}`} name="draw_schedule" value={form.draw_schedule} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Frecuencia de inspección</label>
          <input type="text" className={`form-control ${styles.input}`} name="inspection_frequency" value={form.inspection_frequency} onChange={handleChange} />
        </div>
      </div>

      {/* Cálculo pagos/intereses */}
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-4">
          <label className="form-label my_title_color">Pago mensual</label>
          <NumericFormat className={`form-control ${styles.input}`} name="monthly_payment" value={form.monthly_payment} onValueChange={({ value }) => handleNumberFormat("monthly_payment", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Interés total</label>
          <NumericFormat className={`form-control ${styles.input}`} name="total_interest" value={form.total_interest} onValueChange={({ value }) => handleNumberFormat("total_interest", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Costo total del préstamo</label>
          <NumericFormat className={`form-control ${styles.input}`} name="total_loan_cost" value={form.total_loan_cost} onValueChange={({ value }) => handleNumberFormat("total_loan_cost", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
      </div>

      {/* Requisitos y estrategia */}
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-6">
          <label className="form-label my_title_color">Alcance de trabajo (SOW)</label>
          <input type="text" className={`form-control ${styles.input}`} name="scope_of_work" value={form.scope_of_work} onChange={handleChange} />
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="permits_required" checked={!!form.permits_required} onChange={(e) => setForm(prev => ({ ...prev, permits_required: e.target.checked }))} />
            <label className="form-check-label" htmlFor="permits_required">Requiere permisos</label>
          </div>
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="appraisal_required" checked={!!form.appraisal_required} onChange={(e) => setForm(prev => ({ ...prev, appraisal_required: e.target.checked }))} />
            <label className="form-check-label" htmlFor="appraisal_required">Requiere appraisal</label>
          </div>
        </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-3 d-flex align-items-end">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="title_insurance" checked={!!form.title_insurance} onChange={(e) => setForm(prev => ({ ...prev, title_insurance: e.target.checked }))} />
            <label className="form-check-label" htmlFor="title_insurance">Title insurance</label>
          </div>
        </div>
        <div className="col-md-3">
          <label className="form-label my_title_color">Experiencia del borrower</label>
          <input type="text" className={`form-control ${styles.input}`} name="borrower_experience" value={form.borrower_experience} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label my_title_color">Estrategia de salida</label>
          <input type="text" className={`form-control ${styles.input}`} name="exit_strategy" value={form.exit_strategy} onChange={handleChange} />
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="bank_statements_required" checked={!!form.bank_statements_required} onChange={(e) => setForm(prev => ({ ...prev, bank_statements_required: e.target.checked }))} />
            <label className="form-check-label" htmlFor="bank_statements_required">Bank statements req.</label>
          </div>
        </div>
      </div>

      {/* Tipos compra/refi y cash out */}
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-3">
          <label className="form-label my_title_color">Tipo de compra</label>
          <input type="text" className={`form-control ${styles.input}`} name="purchase_type" value={form.purchase_type} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label my_title_color">Tipo de refinanciación</label>
          <input type="text" className={`form-control ${styles.input}`} name="refinance_type" value={form.refinance_type} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label my_title_color">Cash-out</label>
          <NumericFormat className={`form-control ${styles.input}`} name="cash_out_amount" value={form.cash_out_amount} onValueChange={({ value }) => handleNumberFormat("cash_out_amount", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-3">
          <label className="form-label my_title_color">Prueba de fondos</label>
          <input type="text" className={`form-control ${styles.input}`} name="proof_of_funds" value={form.proof_of_funds} onChange={handleChange} />
        </div>
      </div>

      {/* Fees / costos */}
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-3">
          <label className="form-label my_title_color">Origination fee</label>
          <NumericFormat className={`form-control ${styles.input}`} name="origination_fee" value={form.origination_fee} onValueChange={({ value }) => handleNumberFormat("origination_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-3">
          <label className="form-label my_title_color">Underwriting fee</label>
          <NumericFormat className={`form-control ${styles.input}`} name="underwriting_fee" value={form.underwriting_fee} onValueChange={({ value }) => handleNumberFormat("underwriting_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-3">
          <label className="form-label my_title_color">Processing fee</label>
          <NumericFormat className={`form-control ${styles.input}`} name="processing_fee" value={form.processing_fee} onValueChange={({ value }) => handleNumberFormat("processing_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-3">
          <label className="form-label my_title_color">Legal fee</label>
          <NumericFormat className={`form-control ${styles.input}`} name="legal_fee" value={form.legal_fee} onValueChange={({ value }) => handleNumberFormat("legal_fee", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-4">
          <label className="form-label my_title_color">Total closing costs</label>
          <NumericFormat className={`form-control ${styles.input}`} name="total_closing_costs" value={form.total_closing_costs} onValueChange={({ value }) => handleNumberFormat("total_closing_costs", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Seguro (Insurance)</label>
          <NumericFormat className={`form-control ${styles.input}`} name="insurance" value={form.insurance} onValueChange={({ value }) => handleNumberFormat("insurance", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Impuestos (Property taxes)</label>
          <NumericFormat className={`form-control ${styles.input}`} name="property_taxes" value={form.property_taxes} onValueChange={({ value }) => handleNumberFormat("property_taxes", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
      </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-4">
          <label className="form-label my_title_color">Servicios (Utilities)</label>
          <NumericFormat className={`form-control ${styles.input}`} name="utilities" value={form.utilities} onValueChange={({ value }) => handleNumberFormat("utilities", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Mantenimiento</label>
          <NumericFormat className={`form-control ${styles.input}`} name="maintenance" value={form.maintenance} onValueChange={({ value }) => handleNumberFormat("maintenance", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Reservas (Cash reserves)</label>
          <NumericFormat className={`form-control ${styles.input}`} name="cash_reserves" value={form.cash_reserves} onValueChange={({ value }) => handleNumberFormat("cash_reserves", value)} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale allowNegative={false} inputMode="decimal" />
        </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className={`col-md-12 ${styles.fullWidth}`}>
          <label className="form-label my_title_color">Comentarios</label>
          <textarea
            className={`form-control ${styles.textarea}`}
            name="comments"
            value={form.comments}
            onChange={handleChange}
            rows={2}
            autoComplete="off"
            style={{ resize: "vertical", minHeight: 40, maxHeight: 120 }}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12 mt-4 d-flex flex-column align-items-center pt-3 pb-5">
          <button
            type="submit"
            className={`btn fw-bold text-white rounded-pill ${styles.button}`}
            style={{ minWidth: "220px", background: "#1B2559", fontSize: 18 }}
            disabled={loading}
          >
            {loading ? "Creando..." : "CREAR FIXFLIP"}
          </button>
          {feedback && (
            <div className={`mt-3 ${feedback.includes("exitosamente") ? "text-success" : "text-danger"} fw-semibold`}>
              {feedback}
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default FixflipForm; 
export { FixflipForm };