import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { getConstructionById } from '../../../../../Api/construction';
import { getUserIdFromToken } from '../../../../../utils/auth';

const ConstructionIntentionForm = ({ 
  requestId,
  initialData = {}, 
  onFormChange, 
  onSubmit, 
  loading = false,
  editable = true
}) => {
  const type = 'construction';

  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    // Información Básica del Préstamo
    loan_amount: 0,
    interest_rate: 0,
    loan_term: "",
    loan_type: "",
    loan_purpose: "",
    
    // Propiedad
    property_type: "",
    property_address: "",
    property_city: "",
    property_state: "",
    property_zip: "",
    property_value: 0,
    
    // Precios y Valores
    purchase_price: 0,
    land_cost: 0,
    construction_cost: 0,
    renovation_cost: 0,
    rehab_budget: 0,
    after_repair_value: 0,
    total_project_cost: 0,
    
    // LTV y LTC
    ltv: 0,
    ltc: 0,
    
    // Información del Proyecto
    renovation_timeline: "",
    rehab_timeline: "",
    construction_timeline: "",
    contractor_info: "",
    construction_type: "",
    scope_of_work: "",
    
    // Draw Schedule y Inspecciones
    draw_schedule: "",
    inspection_frequency: "",
    
    // Permisos y Requisitos
    permits_required: false,
    permits_status: "",
    appraisal_required: false,
    title_insurance: false,
    
    // Experiencia y Estrategia
    borrower_experience: "",
    exit_strategy: "",
    purchase_type: "",
    refinance_type: "",
    
    // Pagos y Costos
    monthly_payment: 0,
    total_interest: 0,
    total_loan_cost: 0,
    total_closing_costs: 0,
    closing_costs: 0,
    
    // Fees y Costos de Cierre
    origination_fee: 0,
    underwriting_fee: 0,
    processing_fee: 0,
    legal_fee: 0,
    appraisal_fee: 0,
    service_fee: 0,
    
    // Fees Específicos
    broker_fee_percentage: 0,
    broker_fee: 0,
    feasibility_fee: 0,
    budget_review_fee: 0,
    transaction_management_fee: 0,
    
    // Gastos Operativos
    insurance: 0,
    property_taxes: 0,
    utilities: 0,
    maintenance: 0,
    cash_reserves: 0,
    
    // Documentación
    bank_statements_required: false,
    proof_of_funds: "",
    
    // Categorías y Puntajes
    rehab_category: "",
    min_credit_score: 0,
    
    // Gastos y Depósitos
    statement_expenses: 0,
    refundable_commitment_deposit: 0,
    
    // Presupuesto y Financiamiento
    construction_budget_delta: 0,
    initial_funding: 0,
    construction_holdback: 0,
    interest_reserves: 0,
    
    // Cash Out
    cash_out_amount: 0,
    
    // Fechas
    estimated_closing_date: "",
    
    // Campos del Sistema
    borrower_signed: false,
    guarantor_signed: false,
    is_signed: false,
    is_approved: false
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Mapear posibles alias de campos que el backend puede retornar
      const mapped = { ...initialData };
      if (mapped.service_fee != null && (mapped.servicing_fee == null || Number(mapped.servicing_fee) === 0)) {
        mapped.servicing_fee = mapped.service_fee;
      }
      if (mapped.total_closing_cost_estimated != null && (mapped.estimated_closing_costs == null || Number(mapped.estimated_closing_costs) === 0)) {
        mapped.estimated_closing_costs = mapped.total_closing_cost_estimated;
      }
      if (mapped.interest_rate != null && (mapped.annual_interest_rate == null || Number(mapped.annual_interest_rate) === 0)) {
        mapped.annual_interest_rate = mapped.interest_rate;
      }
      setForm(prev => ({ ...prev, ...mapped }));
      setShowCreateForm(false);
    } else if (requestId) {
      const load = async () => {
        setLoadingData(true);
        setError("");
        try {
          const data = await getConstructionById(Number(requestId));
          if (data) {
            setForm(prev => ({
              ...prev,
              client_id: data.client_id ?? prev.client_id,
              user_id: prev.user_id || data.user_id || (getUserIdFromToken ? Number(getUserIdFromToken()) : prev.user_id),
              borrower_name: data.borrower_name || prev.borrower_name,
              legal_status: data.legal_status || prev.legal_status,
              property_address: data.property_address || prev.property_address,
              fico_score: data.fico_score ?? prev.fico_score,
              loan_type: data.loan_type || prev.loan_type,
              property_type: data.property_type || prev.property_type,
              closing_date: data.closing_date || data.estimated_closing_date || prev.closing_date,
              interest_rate_structure: data.interest_rate_structure || prev.interest_rate_structure,
              loan_term: data.loan_term || prev.loan_term,
              prepayment_penalty: data.prepayment_penalty ?? prev.prepayment_penalty,
              max_ltv: data.max_ltv ?? data.ltv ?? prev.max_ltv,
              max_ltc: data.max_ltc ?? data.ltc ?? prev.max_ltc,
              as_is_value: data.as_is_value ?? data.property_value ?? prev.as_is_value,
              original_acquisition_price: data.original_acquisition_price ?? data.purchase_price ?? prev.original_acquisition_price,
              land_acquisition_cost: data.land_acquisition_cost ?? data.land_cost ?? prev.land_acquisition_cost,
              construction_rehab_budget: data.construction_rehab_budget ?? data.rehab_budget ?? data.construction_cost ?? prev.construction_rehab_budget,
              total_cost: data.total_cost ?? data.total_project_cost ?? prev.total_cost,
              estimated_after_completion_value: data.estimated_after_completion_value ?? data.after_repair_value ?? prev.estimated_after_completion_value,
              origination_fee: data.origination_fee ?? prev.origination_fee,
              underwriting_fee: data.underwriting_fee ?? prev.underwriting_fee,
              processing_fee: data.processing_fee ?? prev.processing_fee,
              servicing_fee: data.servicing_fee ?? data.service_fee ?? prev.servicing_fee,
              legal_fee: data.legal_fee ?? prev.legal_fee,
              appraisal_fee: data.appraisal_fee ?? prev.appraisal_fee,
              budget_review_fee: data.budget_review_fee ?? data.feasibility_fee ?? prev.budget_review_fee,
              broker_fee: data.broker_fee ?? prev.broker_fee,
              transaction_management_fee: data.transaction_management_fee ?? prev.transaction_management_fee,
              total_loan_amount: data.total_loan_amount ?? prev.total_loan_amount,
              loan_amount: data.loan_amount ?? prev.loan_amount,
              annual_interest_rate: data.annual_interest_rate ?? data.interest_rate ?? prev.annual_interest_rate,
              requested_leverage: data.requested_leverage ?? prev.requested_leverage,
              monthly_interest_payment: data.monthly_interest_payment ?? prev.monthly_interest_payment,
              construction_holdback: data.construction_holdback ?? prev.construction_holdback,
              initial_funding: data.initial_funding ?? prev.initial_funding,
              day1_monthly_interest_payment: data.day1_monthly_interest_payment ?? prev.day1_monthly_interest_payment,
              interest_reserves: data.interest_reserves ?? prev.interest_reserves,
              loan_to_as_is_value: data.loan_to_as_is_value ?? prev.loan_to_as_is_value,
              loan_to_as_is_value_ltv: data.loan_to_as_is_value_ltv ?? prev.loan_to_as_is_value_ltv,
              loan_to_cost_ltc: data.loan_to_cost_ltc ?? prev.loan_to_cost_ltc,
              loan_to_arv: data.loan_to_arv ?? prev.loan_to_arv,
              rehab_category: data.rehab_category || prev.rehab_category,
              min_credit_score: data.min_credit_score ?? prev.min_credit_score,
              refundable_commitment_deposit: data.refundable_commitment_deposit ?? prev.refundable_commitment_deposit,
              estimated_closing_costs: data.estimated_closing_costs ?? prev.estimated_closing_costs,
              construction_budget_10_percent: data.construction_budget_10_percent ?? prev.construction_budget_10_percent,
              six_months_payment_reserves: data.six_months_payment_reserves ?? prev.six_months_payment_reserves,
              construction_budget_delta: data.construction_budget_delta ?? prev.construction_budget_delta,
              down_payment: data.down_payment ?? prev.down_payment,
              total_liquidity: data.total_liquidity ?? prev.total_liquidity,
            }));
          }
          setShowCreateForm(true);
        } catch (err) {
          setError("Error al cargar los datos de la solicitud");
        } finally {
          setLoadingData(false);
        }
      };
      load();
    }
  }, [initialData, requestId]);

  useEffect(() => {
    if (onFormChange) onFormChange(form);
  }, [form, onFormChange]);

  useEffect(() => {
    if (onFormChange) {
      onFormChange(form);
    }
  }, [form, onFormChange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toISOOrNull = (v) => {
    if (!v) return null;
    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return null;
      return d.toISOString();
    } catch (_) { return null; }
  };

  const buildDataToSend = () => ({
    client_id: Number(form.client_id || 0),
    user_id: Number(form.user_id || getUserIdFromToken?.() || 0),
    borrower_name: form.borrower_name || "",
    legal_status: form.legal_status || "",
    date: toISOOrNull(form.date) || new Date().toISOString(),
    property_address: form.property_address || "",
    fico_score: Number(form.fico_score || 0),
    loan_type: form.loan_type || "",
    property_type: form.property_type || "",
    closing_date: toISOOrNull(form.closing_date || form.estimated_closing_date),
    interest_rate_structure: form.interest_rate_structure || "",
    loan_term: String(form.loan_term || "").trim() === "" ? 0 : Number(form.loan_term),
    prepayment_penalty: Number(form.prepayment_penalty || 0),
    max_ltv: Number(form.max_ltv || form.ltv || 0),
    max_ltc: Number(form.max_ltc || form.ltc || 0),
    as_is_value: Number(form.as_is_value || form.property_value || 0),
    original_acquisition_price: Number(form.original_acquisition_price || form.purchase_price || 0),
    land_acquisition_cost: Number(form.land_acquisition_cost || form.land_cost || 0),
    construction_rehab_budget: Number(form.construction_rehab_budget || form.rehab_budget || form.construction_cost || 0),
    total_cost: Number(form.total_cost || form.total_project_cost || 0),
    estimated_after_completion_value: Number(form.estimated_after_completion_value || form.after_repair_value || 0),
    origination_fee: Number(form.origination_fee || 0),
    underwriting_fee: Number(form.underwriting_fee || 0),
    processing_fee: Number(form.processing_fee || 0),
    servicing_fee: Number(form.servicing_fee || form.service_fee || 0),
    legal_fee: Number(form.legal_fee || 0),
    appraisal_fee: Number(form.appraisal_fee || 0),
    budget_review_fee: Number(form.budget_review_fee || form.feasibility_fee || 0),
    broker_fee: Number(form.broker_fee || 0),
    transaction_management_fee: Number(form.transaction_management_fee || 0),
    total_loan_amount: Number(form.total_loan_amount || 0),
    loan_amount: Number(form.loan_amount || 0),
    annual_interest_rate: Number(form.annual_interest_rate || form.interest_rate || 0),
    requested_leverage: Number(form.requested_leverage || 0),
    monthly_interest_payment: Number(form.monthly_interest_payment || 0),
    construction_holdback: Number(form.construction_holdback || 0),
    initial_funding: Number(form.initial_funding || 0),
    day1_monthly_interest_payment: Number(form.day1_monthly_interest_payment || 0),
    interest_reserves: Number(form.interest_reserves || 0),
    loan_to_as_is_value: Number(form.loan_to_as_is_value || 0),
    loan_to_as_is_value_ltv: Number(form.loan_to_as_is_value_ltv || 0),
    loan_to_cost_ltc: Number(form.loan_to_cost_ltc || 0),
    loan_to_arv: Number(form.loan_to_arv || 0),
    rehab_category: form.rehab_category || "",
    min_credit_score: Number(form.min_credit_score || 0),
    refundable_commitment_deposit: Number(form.refundable_commitment_deposit || 0),
    estimated_closing_costs: Number(form.estimated_closing_costs || 0),
    construction_budget_10_percent: Number(form.construction_budget_10_percent || 0),
    six_months_payment_reserves: Number(form.six_months_payment_reserves || 0),
    construction_budget_delta: Number(form.construction_budget_delta || 0),
    down_payment: Number(form.down_payment || 0),
    total_liquidity: Number(form.total_liquidity || 0),
    client_submitted: Boolean(form.client_submitted),
    client_form_completed: Boolean(form.client_form_completed),
    client_submitted_at: toISOOrNull(form.client_submitted_at)
  });

  useEffect(() => {
    const monthly = (Number(form.loan_amount || 0) * Number(form.annual_interest_rate || form.interest_rate || 0)) / 100 / 12;
    const day1 = (Number(form.initial_funding || 0) * Number(form.annual_interest_rate || form.interest_rate || 0)) / 100 / 12;
    const totalLiquidity = Number(form.estimated_closing_costs || 0) + Number(form.construction_budget_10_percent || 0) + Number(form.six_months_payment_reserves || 0) + Number(form.construction_budget_delta || 0) + Number(form.down_payment || 0);
    setForm(prev => ({
      ...prev,
      monthly_interest_payment: Number.isFinite(monthly) ? monthly : prev.monthly_interest_payment,
      day1_monthly_interest_payment: Number.isFinite(day1) ? day1 : prev.day1_monthly_interest_payment,
      total_liquidity: Number.isFinite(totalLiquidity) ? totalLiquidity : prev.total_liquidity,
      user_id: prev.user_id || (getUserIdFromToken ? (Number(getUserIdFromToken()) || 0) : 0)
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.loan_amount, form.annual_interest_rate, form.interest_rate, form.initial_funding, form.estimated_closing_costs, form.construction_budget_10_percent, form.six_months_payment_reserves, form.construction_budget_delta, form.down_payment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      const payload = buildDataToSend();
      try {
        // eslint-disable-next-line no-console
        console.debug('[Construction] Payload enviado:', payload);
      } catch (_) {}
      onSubmit(payload);
    }
  };

  const handleCreateIntentLetter = async () => {
    if (onSubmit) {
      const payload = buildDataToSend();
      try {
        // eslint-disable-next-line no-console
        console.debug('[Construction] Payload enviado (create):', payload);
      } catch (_) {}
      onSubmit(payload);
    }
  };

  return (
    <div className="container-fluid">
      {loadingData ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visualmente-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">{error}</div>
      ) : showCreateForm && !Object.keys(initialData || {}).length ? (
        <div className="text-center py-5">
          <h4 className="mb-4">No existe una carta de intención para esta solicitud</h4>
          <button type="button" className="btn btn-primary btn-lg" onClick={handleCreateIntentLetter} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creando carta de intención...
              </>
            ) : (
              <>
                <i className="fas fa-file-alt me-2"></i>
                Crear Carta de Intención
              </>
            )}
          </button>
        </div>
      ) : (
      <form onSubmit={handleSubmit}>
        {/* 1. LOAN DETAILS */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">1. LOAN DETAILS</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">LOAN TYPE</label>
                <input name="loan_type" className="form-control" value={form.loan_type || ''} onChange={handleChange} disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">PROPERTY TYPE</label>
                <input name="property_type" className="form-control" value={form.property_type || ''} onChange={handleChange} disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">ESTIMATED CLOSING DATE</label>
                <input type="date" name="closing_date" className="form-control" value={form.closing_date ? String(form.closing_date).split('T')[0] : ''} onChange={handleChange} disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">INTEREST RATE STRUCTURE</label>
                <input name="interest_rate_structure" className="form-control" value={form.interest_rate_structure || ''} onChange={handleChange} disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">LOAN TERM</label>
                <input name="loan_term" className="form-control" value={form.loan_term || ''} onChange={handleChange} disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">PREPAYMENT PENALTY</label>
                <NumericFormat name="prepayment_penalty" className="form-control" value={form.prepayment_penalty || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, prepayment_penalty: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">MAXIMUM LTV (Loan to Value)</label>
                <NumericFormat name="max_ltv" className="form-control" value={form.max_ltv || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, max_ltv: Number(value || 0) }))} decimalScale={2} suffix="%" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">MAXIMUM LTC (Loan to Cost)</label>
                <NumericFormat name="max_ltc" className="form-control" value={form.max_ltc || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, max_ltc: Number(value || 0) }))} decimalScale={2} suffix="%" disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. PURCHASE, REFINANCE, CASH-OUT */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">2. PURCHASE, REFINANCE, CASH-OUT</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">As-is Value</label>
                <NumericFormat name="as_is_value" className="form-control" value={form.as_is_value || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, as_is_value: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Original Acquisition Price</label>
                <NumericFormat name="original_acquisition_price" className="form-control" value={form.original_acquisition_price || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, original_acquisition_price: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* 3. FIX & FLIP, GROUND UP CONSTRUCTION */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">3. FIX & FLIP, GROUND UP CONSTRUCTION</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Land or Acquisition Cost</label>
                <NumericFormat name="land_acquisition_cost" className="form-control" value={form.land_acquisition_cost || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, land_acquisition_cost: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Financed Construction / Rehab Budget</label>
                <NumericFormat name="construction_rehab_budget" className="form-control" value={form.construction_rehab_budget || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, construction_rehab_budget: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Total Cost</label>
                <NumericFormat name="total_cost" className="form-control" value={form.total_cost || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, total_cost: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Estimated After Completion Value</label>
                <NumericFormat name="estimated_after_completion_value" className="form-control" value={form.estimated_after_completion_value || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, estimated_after_completion_value: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* 4. LOAN CLOSING COST */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">4. LOAN CLOSING COST</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Origination Fee</label>
                <NumericFormat name="origination_fee" className="form-control" value={form.origination_fee || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, origination_fee: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Underwriting Fee</label>
                <NumericFormat name="underwriting_fee" className="form-control" value={form.underwriting_fee || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, underwriting_fee: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Processing Fee</label>
                <NumericFormat name="processing_fee" className="form-control" value={form.processing_fee || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, processing_fee: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Servicing Fee</label>
                <NumericFormat name="servicing_fee" className="form-control" value={form.servicing_fee || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, servicing_fee: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Legal Fee</label>
                <NumericFormat name="legal_fee" className="form-control" value={form.legal_fee || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, legal_fee: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Appraisal Fee (TBD)</label>
                <NumericFormat name="appraisal_fee" className="form-control" value={form.appraisal_fee || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, appraisal_fee: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Budget Review & Feasibility Report Fee</label>
                <NumericFormat name="budget_review_fee" className="form-control" value={form.budget_review_fee || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, budget_review_fee: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* 5. OTHER EXPENSES (Estimated) */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">5. OTHER EXPENSES (Estimated)</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Broker Fee (0.00%)</label>
                <NumericFormat name="broker_fee" className="form-control" value={form.broker_fee || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, broker_fee: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Transaction Management Fee</label>
                <NumericFormat name="transaction_management_fee" className="form-control" value={form.transaction_management_fee || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, transaction_management_fee: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* 6. LOAN SUMMRY */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">6. LOAN SUMMRY</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">TOTAL LOAN AMOUNT (subject to appraisal value)</label>
                <NumericFormat name="total_loan_amount" className="form-control" value={form.total_loan_amount || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, total_loan_amount: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">ANNUAL INTEREST RATE (*)</label>
                <NumericFormat name="annual_interest_rate" className="form-control" value={form.annual_interest_rate || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, annual_interest_rate: Number(value || 0) }))} decimalScale={2} suffix="%" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">REQUESTED LEVERAGE</label>
                <NumericFormat name="requested_leverage" className="form-control" value={form.requested_leverage || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, requested_leverage: Number(value || 0) }))} decimalScale={2} suffix="%" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">APPROX. MONTHLY INTEREST PAYMENT</label>
                <NumericFormat name="monthly_interest_payment" className="form-control" value={form.monthly_interest_payment || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, monthly_interest_payment: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* 7. IF LOAN IS FIX & FLIP OR GROUND UP CONSTRUCTION */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">7. IF LOAN IS FIX & FLIP OR GROUND UP CONSTRUCTION</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">CONSTRUCTION HOLDBACK</label>
                <NumericFormat name="construction_holdback" className="form-control" value={form.construction_holdback || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, construction_holdback: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">INITIAL FUNDING</label>
                <NumericFormat name="initial_funding" className="form-control" value={form.initial_funding || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, initial_funding: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">DAY 1 APPROX. MONTHLY INTEREST PAYMENT</label>
                <NumericFormat name="day1_monthly_interest_payment" className="form-control" value={form.day1_monthly_interest_payment || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, day1_monthly_interest_payment: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Interest Reserves</label>
                <NumericFormat name="interest_reserves" className="form-control" value={form.interest_reserves || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, interest_reserves: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-12">
                <small className="text-muted">*** Monthly payment on rehab begins when drawn</small>
              </div>
            </div>
          </div>
        </div>

        {/* 8. PURCHASE, REFINANCE, CASH OUT */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">8. PURCHASE, REFINANCE, CASH OUT</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Loan to As-Is Value (LTV)</label>
                <NumericFormat name="loan_to_as_is_value_ltv" className="form-control" value={form.loan_to_as_is_value_ltv || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, loan_to_as_is_value_ltv: Number(value || 0) }))} decimalScale={2} suffix="%" disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* 9. FIX & FLIP, GROUND UP CONSTRUCTION (Metrics) */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">9. FIX & FLIP, GROUND UP CONSTRUCTION (Metrics)</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Loan to As-Is Value (LTAIV)</label>
                <NumericFormat name="loan_to_as_is_value" className="form-control" value={form.loan_to_as_is_value || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, loan_to_as_is_value: Number(value || 0) }))} decimalScale={2} suffix="%" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Loan to Cost (LTC)</label>
                <NumericFormat name="loan_to_cost_ltc" className="form-control" value={form.loan_to_cost_ltc || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, loan_to_cost_ltc: Number(value || 0) }))} decimalScale={2} suffix="%" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Loan to ARV (Maximum 75%)</label>
                <NumericFormat name="loan_to_arv" className="form-control" value={form.loan_to_arv || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, loan_to_arv: Number(value || 0) }))} decimalScale={2} suffix="%" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Rehab Category</label>
                <input name="rehab_category" className="form-control" value={form.rehab_category || ''} onChange={handleChange} disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* 10. CONDITIONS AND ADDITIONAL INFORMATION */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">10. CONDITIONS AND ADDITIONAL INFORMATION</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Minimum Credit Score required</label>
                <NumericFormat name="min_credit_score" className="form-control" value={form.fico_score || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, min_credit_score: Number(value || 0) }))} disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">REFUNDABLE COMMITMENT DEPOSIT</label>
                <NumericFormat name="refundable_commitment_deposit" className="form-control" value={form.refundable_commitment_deposit || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, refundable_commitment_deposit: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* 11. MINIMUM BORROWER'S LIQUIDITY REQUIRED (Estimated) */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">11. MINIMUM BORROWER'S LIQUIDITY REQUIRED (Estimated)</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Estimated closing costs</label>
                <NumericFormat name="estimated_closing_costs" className="form-control" value={form.estimated_closing_costs || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, estimated_closing_costs: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">10% of Construction Budget</label>
                <NumericFormat name="construction_budget_10_percent" className="form-control" value={form.construction_budget_10_percent || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, construction_budget_10_percent: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">6 months payment reserves</label>
                <NumericFormat name="six_months_payment_reserves" className="form-control" value={form.six_months_payment_reserves || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, six_months_payment_reserves: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Construction budget delta</label>
                <NumericFormat name="construction_budget_delta" className="form-control" value={form.construction_budget_delta || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, construction_budget_delta: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Down Payment Total</label>
                <NumericFormat name="down_payment" className="form-control" value={form.down_payment || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, down_payment: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Total Liquidity (auto)</label>
                <NumericFormat name="total_liquidity" className="form-control" value={form.total_liquidity || 0} thousandSeparator="," prefix="$" disabled />
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="row">
          <div className="col-12 text-center">
            <button
              type="submit"
              className="btn btn-primary btn-lg px-5"
              disabled={loading}
              style={{ borderRadius: '25px' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Procesando...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Guardar Carta de Intención Construction
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      )}
    </div>
  );
};

export default ConstructionIntentionForm;


