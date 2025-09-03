import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createFixflip } from "../../../../../../Api/fixflip";
import { createRequestLink } from "../../../../../../Api/requestLink";
import { getClientById } from "../../../../../../Api/client";
import { sendTemplateEmail } from "../../../../../../Api/emailTemplate";
import { getUserIdFromToken } from "../../../../../../utils/auth";

const URL_EXTERNAL_FORM = import.meta.env.VITE_URL_EXTERMAL_FORM;

const initialState = {
  // Campos básicos del formulario
  borrower_name: "",
  legal_status: "",
  property_address: "",
  estimated_fico_score: "",
  property_type: "",
  land_acquisition_cost: "",
  construction_rehab_budget: "",
  total_cost: "",
  estimated_after_completion_value: "",
  
  // Campos adicionales requeridos por el payload
  date: "",
  loan_type: "",
  closing_date: "",
  interest_rate_structure: "",
  loan_term: "",
  prepayment_penalty: 0,
  max_ltv: 0,
  max_ltc: 0,
  as_is_value: 0,
  original_acquisition_price: 0,
  origination_fee: 0,
  underwriting_fee: 0,
  processing_fee: 0,
  servicing_fee: 0,
  legal_fee: 0,
  appraisal_fee: 0,
  budget_review_fee: 0,
  broker_fee: 0,
  transaction_management_fee: 0,
  total_loan_amount: 0,
  annual_interest_rate: 0,
  requested_leverage: 0,
  monthly_interest_payment: 0,
  construction_holdback: 0,
  initial_funding: 0,
  day1_monthly_interest_payment: 0,
  interest_reserves: 0,
  loan_to_as_is_value: 0,
  loan_to_as_is_value_ltv: 0,
  loan_to_cost_ltc: 0,
  loan_to_arv: 0,
  rehab_category: "",
  min_credit_score: 0,
  refundable_commitment_deposit: 0,
  estimated_closing_costs: 0,
  construction_budget_10_percent: 0,
  six_months_payment_reserves: 0,
  construction_budget_delta: 0,
  down_payment: 0,
  total_liquidity: 0
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

  // Calcular Total Cost automáticamente
  const computeTotalCost = () => {
    const landCost = Number(form.land_acquisition_cost) || 0;
    const constructionBudget = Number(form.construction_rehab_budget) || 0;
    return landCost + constructionBudget;
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
      // Obtener user_id del token
      const user_id = getUserIdFromToken();
      if (!user_id) {
        setFeedback("Error de autenticación. Por favor, inicia sesión nuevamente.");
        return;
      }

      // Preparar datos de la solicitud con el nuevo payload
      const dataToSend = {
        client_id: Number(client_id),
        user_id: user_id,
        borrower_name: form.borrower_name || "",
        legal_status: form.legal_status || "",
        date: toISOOrNull(form.date),
        property_address: form.property_address || "",
        estimated_fico_score: form.estimated_fico_score ? Number(form.estimated_fico_score) : 0,
        loan_type: form.loan_type || "",
        property_type: form.property_type || "",
        closing_date: toISOOrNull(form.closing_date),
        interest_rate_structure: form.interest_rate_structure || "",
        loan_term: form.loan_term || "",
        prepayment_penalty: form.prepayment_penalty ? Number(form.prepayment_penalty) : 0,
        max_ltv: form.max_ltv ? Number(form.max_ltv) : 0,
        max_ltc: form.max_ltc ? Number(form.max_ltc) : 0,
        as_is_value: form.as_is_value ? Number(form.as_is_value) : 0,
        original_acquisition_price: form.original_acquisition_price ? Number(form.original_acquisition_price) : 0,
        land_acquisition_cost: form.land_acquisition_cost ? Number(form.land_acquisition_cost) : 0,
        construction_rehab_budget: form.construction_rehab_budget ? Number(form.construction_rehab_budget) : 0,
        total_cost: computeTotalCost(),
        estimated_after_completion_value: form.estimated_after_completion_value ? Number(form.estimated_after_completion_value) : 0,
        origination_fee: form.origination_fee ? Number(form.origination_fee) : 0,
        underwriting_fee: form.underwriting_fee ? Number(form.underwriting_fee) : 0,
        processing_fee: form.processing_fee ? Number(form.processing_fee) : 0,
        servicing_fee: form.servicing_fee ? Number(form.servicing_fee) : 0,
        legal_fee: form.legal_fee ? Number(form.legal_fee) : 0,
        appraisal_fee: form.appraisal_fee ? Number(form.appraisal_fee) : 0,
        budget_review_fee: form.budget_review_fee ? Number(form.budget_review_fee) : 0,
        broker_fee: form.broker_fee ? Number(form.broker_fee) : 0,
        transaction_management_fee: form.transaction_management_fee ? Number(form.transaction_management_fee) : 0,
        total_loan_amount: form.total_loan_amount ? Number(form.total_loan_amount) : 0,
        annual_interest_rate: form.annual_interest_rate ? Number(form.annual_interest_rate) : 0,
        requested_leverage: form.requested_leverage ? Number(form.requested_leverage) : 0,
        monthly_interest_payment: form.monthly_interest_payment ? Number(form.monthly_interest_payment) : 0,
        construction_holdback: form.construction_holdback ? Number(form.construction_holdback) : 0,
        initial_funding: form.initial_funding ? Number(form.initial_funding) : 0,
        day1_monthly_interest_payment: form.day1_monthly_interest_payment ? Number(form.day1_monthly_interest_payment) : 0,
        interest_reserves: form.interest_reserves ? Number(form.interest_reserves) : 0,
        loan_to_as_is_value: form.loan_to_as_is_value ? Number(form.loan_to_as_is_value) : 0,
        loan_to_as_is_value_ltv: form.loan_to_as_is_value_ltv ? Number(form.loan_to_as_is_value_ltv) : 0,
        loan_to_cost_ltc: form.loan_to_cost_ltc ? Number(form.loan_to_cost_ltc) : 0,
        loan_to_arv: form.loan_to_arv ? Number(form.loan_to_arv) : 0,
        rehab_category: form.rehab_category || "",
        min_credit_score: form.min_credit_score ? Number(form.min_credit_score) : 0,
        refundable_commitment_deposit: form.refundable_commitment_deposit ? Number(form.refundable_commitment_deposit) : 0,
        estimated_closing_costs: form.estimated_closing_costs ? Number(form.estimated_closing_costs) : 0,
        construction_budget_10_percent: form.construction_budget_10_percent ? Number(form.construction_budget_10_percent) : 0,
        six_months_payment_reserves: form.six_months_payment_reserves ? Number(form.six_months_payment_reserves) : 0,
        construction_budget_delta: form.construction_budget_delta ? Number(form.construction_budget_delta) : 0,
        down_payment: form.down_payment ? Number(form.down_payment) : 0,
        total_liquidity: form.total_liquidity ? Number(form.total_liquidity) : 0
      };

      // Crear la solicitud Fixflip
      const response = await createFixflip(dataToSend);
      console.log('Respuesta createFixflip:', response);

      // Crear el enlace
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
        
        // Enviar email automáticamente
        await handleSendEmail(fullLink);
      }

      // Actualizar UI y limpiar formulario
      setFeedback("¡Fixflip creado exitosamente!");
      setForm({ ...initialState });

      // Navegar a documentos si es necesario
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
    <form className="container-fluid" onSubmit={handleSubmit}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <h4 className="my_title_color fw-bold mb-0" style={{ letterSpacing: 0.5 }}>Fix & Flip - Información Básica</h4>
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

      {/* Formulario simplificado con solo los campos especificados */}
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
          <label className="form-label my_title_color">SUBJECT PROPERTY ADDRESS</label>
          <input 
            className={`form-control ${styles.input}`}
            name="property_address" 
            value={form.property_address} 
            onChange={handleChange} 
          />
        </div>
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
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label my_title_color">PROPERTY TYPE</label>
          <input 
            className={`form-control ${styles.input}`}
            name="property_type" 
            value={form.property_type} 
            onChange={handleChange} 
          />
        </div>

        {/* Land or Acquisition Cost */}
        <div className="col-md-6">
          <label className="form-label my_title_color">Estimated After Completion Value</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="estimated_after_completion_value" 
            value={form.estimated_after_completion_value} 
            onValueChange={({ value }) => handleNumberFormat("estimated_after_completion_value", value)} 
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
          <label className="form-label my_title_color">Financed Construction / Rehab Budget</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="construction_rehab_budget" 
            value={form.construction_rehab_budget} 
            onValueChange={({ value }) => handleNumberFormat("construction_rehab_budget", value)} 
            thousandSeparator="," 
            prefix="$" 
            decimalScale={2} 
            fixedDecimalScale 
            allowNegative={false} 
            inputMode="decimal" 
          />
        </div>


      {/* Estimated After Completion Value */}
        <div className="col-md-6">
          <label className="form-label my_title_color">Land or Acquisition Cost</label>
          <NumericFormat 
            className={`form-control ${styles.input}`}
            name="land_acquisition_cost" 
            value={form.land_acquisition_cost} 
            onValueChange={({ value }) => handleNumberFormat("land_acquisition_cost", value)} 
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
          <label className="form-label my_title_color">Total Cost</label>
          <input 
            className={`form-control ${styles.input}`}
            value={`$${computeTotalCost().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            disabled 
            style={{ backgroundColor: '#f8f9fa' }}
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
            {loading ? "CREANDO..." : "Guardar"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FixflipForm; 