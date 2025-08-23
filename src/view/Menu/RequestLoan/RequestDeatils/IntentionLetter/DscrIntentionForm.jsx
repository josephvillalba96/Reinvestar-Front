import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import styles from "../../CreateRequest/FormRequest/style.module.css";
import { getDscrById } from '../../../../../Api/dscr';
import { getIntentLettersByRequest } from '../../../../../Api/intentLetters';

const DscrIntentionForm = ({ 
  requestId,
  initialData = {},
  onFormChange, 
  onSubmit, 
  loading = false,
  editable = true
}) => {
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [intentLetter, setIntentLetter] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    // BORROWER INFORMATION
    borrower_name: "",
    legal_status: "",
    guarantor_name: "",
    entity_name: "",
    fico: 0,
    estimated_fico_score: 0,
    residency_status: "",
    subject_prop_under_llc: "",
    
    // PROPERTY INFORMATION
    property_address: "",
    property_type: "",
    property_city: "",
    property_state: "",
    property_zip: "",
    property_units: 0,
    
    // LOAN DETAILS
    loan_type: "",
    loan_amount: 0,
    loan_term: 0,
    interest_rate_structure: "",
    annual_interest_rate: 0,
    max_ltv: 0,
    prepayment_penalty: 0,
    prepayment_penalty_type: "",
    type_of_program: "",
    type_of_transaction: "",
    primary_own_or_rent: "",
    mortgage_late_payments: "",
    
    // DATES
    issued_date: "",
    closing_date: "",
    client_submitted_at: "",
    
    // FEES AND COSTS
    origination_fee: 0,
    origination_fee_percentage: 0,
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
    appraisal_fee: 0,
    total_closing_cost: 0,
    closing_cost_approx: 0,
    closing_cost_liquidity: 0,
    
    // LOAN AMOUNTS
    down_payment_percent: 0,
    dscr_requirement: 0,
    appraisal_value: 0,
    rent_amount: 0,
    down_payment_liquidity: 0,
    cash_out: 0,
    
    // MONTHLY PAYMENTS
    property_taxes: 0,
    property_insurance: 0,
    hoa_fees: 0,
    flood_insurance: 0,
    pay_off_amount: 0,
    mortgage_payment_piti: 0,
    principal_interest: 0,
    property_taxes_estimated: 0,
    property_insurance_estimated: 0,
    hoa_estimated: 0,
    flood_insurance_estimated: 0,
    
    // LIQUIDITY
    other_liquidity: 0,
    total_liquidity: 0,
    six_months_reserves: 0,
    
    // DSCR
    dscr_ratio: 0,
    dscr_required: false,
    dscr_flag: false,
    
    // STATUS AND TRACKING
    radicado: "",
    status: "PENDING",
    client_submitted: false,
    client_form_completed: false,
    client_id: 0,
    user_id: 0,
    comments: "",
    rejection_reason: "",
    
    // SIGNATURES
    borrower_signed: false,
    guarantor_signed: false
  });

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

  useEffect(() => {
    console.log('DscrIntentionForm - initialData recibido:', initialData);
    
    if (Object.keys(initialData).length > 0) {
      console.log('Actualizando formulario con datos iniciales');
      setForm(prev => ({ ...prev, ...initialData }));
      setShowCreateForm(false);
      setLoadingData(false);
    } else if (requestId) {
      console.log('No hay datos iniciales, cargando desde API');
      const loadData = async () => {
        setLoadingData(true);
        setError("");
        
        try {
          const dscrData = await getDscrById(requestId);
          console.log('Datos DSCR obtenidos:', dscrData);
          
          if (dscrData) {
            setForm(prev => ({
              ...prev,
              borrower_name: dscrData.borrower_name || "",
              property_address: dscrData.property_address || "",
              // Mapear todos los campos disponibles
            }));
          }
          setShowCreateForm(true);
        } catch (error) {
          console.error('Error al cargar datos DSCR:', error);
          setError("Error al cargar los datos de la solicitud");
        } finally {
          setLoadingData(false);
        }
      };

      loadData();
    }
  }, [initialData, requestId]);

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

  const handleNumberFormat = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  // Recalcular monto de Origination Fee cuando cambia el porcentaje o el loan_amount
  useEffect(() => {
    const pct = Number(form.origination_fee_percentage || 0);
    const amount = Number(form.loan_amount || 0);
    const computed = (amount * pct) / 100;
    if (Number(form.origination_fee) !== computed) {
      setForm(prev => ({ ...prev, origination_fee: computed }));
    }
  }, [form.origination_fee_percentage, form.loan_amount]);

  const buildDataToSend = () => ({
    // BORROWER INFORMATION
    borrower_name: form.borrower_name,
    legal_status: form.legal_status,
    guarantor_name: form.guarantor_name,
    entity_name: form.entity_name,
    fico: Number(form.fico),
    estimated_fico_score: Number(form.estimated_fico_score),
    residency_status: form.residency_status,
    subject_prop_under_llc: form.subject_prop_under_llc,
    
    // PROPERTY INFORMATION
    property_address: form.property_address,
    property_type: form.property_type,
    property_city: form.property_city,
    property_state: form.property_state,
    property_zip: form.property_zip,
    property_units: Number(form.property_units),
    
    // LOAN DETAILS
    loan_type: form.loan_type,
    loan_amount: Number(form.loan_amount),
    loan_term: Number(form.loan_term),
    interest_rate_structure: form.interest_rate_structure,
    annual_interest_rate: Number(form.annual_interest_rate),
    max_ltv: Number(form.max_ltv),
    prepayment_penalty: Number(form.prepayment_penalty),
    prepayment_penalty_type: form.prepayment_penalty_type,
    type_of_program: form.type_of_program,
    type_of_transaction: form.type_of_transaction,
    primary_own_or_rent: form.primary_own_or_rent,
    mortgage_late_payments: form.mortgage_late_payments,
    
    // DATES
    issued_date: toISOOrNull(form.issued_date),
    closing_date: toISOOrNull(form.closing_date),
    client_submitted_at: toISOOrNull(form.client_submitted_at),
    
    // FEES AND COSTS
    origination_fee: Number(form.origination_fee),
    origination_fee_percentage: Number(form.origination_fee_percentage),
    discount_points: Number(form.discount_points),
    underwriting_fee: Number(form.underwriting_fee),
    credit_report_fee: Number(form.credit_report_fee),
    processing_fee: Number(form.processing_fee),
    recording_fee: Number(form.recording_fee),
    legal_fee: Number(form.legal_fee),
    service_fee: Number(form.service_fee),
    title_fees: Number(form.title_fees),
    government_fees: Number(form.government_fees),
    escrow_tax_insurance: Number(form.escrow_tax_insurance),
    appraisal_fee: Number(form.appraisal_fee),
    total_closing_cost: Number(form.total_closing_cost),
    closing_cost_approx: Number(form.closing_cost_approx),
    closing_cost_liquidity: Number(form.closing_cost_liquidity),
    
    // LOAN AMOUNTS
    down_payment_percent: Number(form.down_payment_percent),
    dscr_requirement: Number(form.dscr_requirement),
    appraisal_value: Number(form.appraisal_value),
    rent_amount: Number(form.rent_amount),
    down_payment_liquidity: Number(form.down_payment_liquidity),
    cash_out: Number(form.cash_out),
    
    // MONTHLY PAYMENTS
    property_taxes: Number(form.property_taxes),
    property_insurance: Number(form.property_insurance),
    hoa_fees: Number(form.hoa_fees),
    flood_insurance: Number(form.flood_insurance),
    pay_off_amount: Number(form.pay_off_amount),
    mortgage_payment_piti: Number(form.mortgage_payment_piti),
    principal_interest: Number(form.principal_interest),
    property_taxes_estimated: Number(form.property_taxes_estimated),
    property_insurance_estimated: Number(form.property_insurance_estimated),
    hoa_estimated: Number(form.hoa_estimated),
    flood_insurance_estimated: Number(form.flood_insurance_estimated),
    
    // LIQUIDITY
    other_liquidity: Number(form.other_liquidity),
    total_liquidity: Number(form.total_liquidity),
    six_months_reserves: Number(form.six_months_reserves),
    
    // DSCR
    dscr_ratio: Number(form.dscr_ratio),
    dscr_required: Boolean(form.dscr_required),
    dscr_flag: Boolean(form.dscr_flag),
    
    // STATUS AND TRACKING
    radicado: form.radicado,
    status: form.status,
    client_submitted: Boolean(form.client_submitted),
    client_form_completed: Boolean(form.client_form_completed),
    client_id: Number(form.client_id),
    user_id: Number(form.user_id),
    comments: form.comments,
    rejection_reason: form.rejection_reason,
    
    // SIGNATURES
    borrower_signed: Boolean(form.borrower_signed),
    guarantor_signed: Boolean(form.guarantor_signed)
  });

  const handleCreateIntentLetter = async () => {
    if (onSubmit) {
      const dataToSend = buildDataToSend();
      onSubmit(dataToSend);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (onSubmit) {
      const dataToSend = buildDataToSend();

      onSubmit(dataToSend);
    }
  };

  return (
    <div className="container-fluid">
      {loadingData ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      ) : showCreateForm && !Object.keys(initialData).length ? (
        <div className="text-center py-5">
          <h4 className="mb-4">No existe una carta de intención para esta solicitud</h4>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleCreateIntentLetter}
            disabled={loading}
          >
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
          {/* BORROWER INFORMATION */}
          <div className="row mb-4">
            <div className="col-12">
              <h5 className="fw-bold text-primary mb-3">
                <i className="fas fa-user me-2"></i>
                BORROWER INFORMATION
              </h5>
            </div>
            <div className="col-12">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Borrower's Name</label>
                  <input
                    type="text"
                    name="borrower_name"
                    className={`form-control ${styles.input}`}
                    value={form.borrower_name}
                    onChange={handleChange}
                    disabled={!editable}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Legal Status</label>
                  <select
                    name="legal_status"
                    className={`form-control ${styles.input}`}
                    value={form.legal_status}
                    onChange={handleChange}
                    disabled={!editable}
                  >
                    <option value="">Seleccione...</option>
                    <option value="CITIZEN">CITIZEN</option>
                    <option value="GREEN CARD">GREEN CARD</option>
                    <option value="EMD">EMD</option>
                    <option value="ITIN">ITIN</option>
                    <option value="FN">FN</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Issued Date</label>
                  <input
                    type="date"
                    name="issued_date"
                    className={`form-control ${styles.input}`}
                    value={form.issued_date ? String(form.issued_date).split('T')[0] : ''}
                    onChange={handleChange}
                    disabled={!editable}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Subject Property Address</label>
                  <input
                    type="text"
                    name="property_address"
                    className={`form-control ${styles.input}`}
                    value={form.property_address}
                    onChange={handleChange}
                    disabled={!editable}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Estimated FICO Score</label>
                  <NumericFormat
                    name="estimated_fico_score"
                    className={`form-control ${styles.input}`}
                    value={form.estimated_fico_score}
                    onValueChange={(values) => handleNumberFormat('estimated_fico_score', values.value)}
                    disabled={!editable}
                    thousandSeparator={false}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Property Under LLC</label>
                  <input
                    type="text"
                    name="subject_prop_under_llc"
                    className={`form-control ${styles.input}`}
                    value={form.subject_prop_under_llc}
                    onChange={handleChange}
                    disabled={!editable}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LOAN DETAILS */}
          <div className="row mb-4">
            <div className="col-12">
              <h5 className="fw-bold text-primary mb-3">
                <i className="fas fa-file-invoice-dollar me-2"></i>
                LOAN DETAILS
              </h5>
            </div>
            <div className="col-12">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Loan Type</label>
                  <select
                    name="loan_type"
                    className={`form-control ${styles.input}`}
                    value={form.loan_type}
                    onChange={handleChange}
                    disabled={!editable}
                  >
                    <option value="">Seleccione...</option>
                    <option value="DSCR - Refi CashOut">DSCR - Refi CashOut</option>
                    <option value="DSCR - Refi Rate & Term">DSCR - Refi Rate & Term</option>
                    <option value="DSCR - Purchase">DSCR - Purchase</option>
                    <option value="12-Bank Statements">12-Bank Statements</option>
                    <option value="24-Bank Statements">24-Bank Statements</option>
                    <option value="P&L Only">P&L Only</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Property Type</label>
                  <input
                    type="text"
                    name="property_type"
                    className={`form-control ${styles.input}`}
                    value={form.property_type}
                    onChange={handleChange}
                    disabled={!editable}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Estimated Closing Date</label>
                  <input
                    type="date"
                    name="closing_date"
                    className={`form-control ${styles.input}`}
                    value={form.closing_date ? String(form.closing_date).split('T')[0] : ''}
                    onChange={handleChange}
                    disabled={!editable}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Interest Rate Estructure</label>
                  <input
                    type="text"
                    name="interest_rate_structure"
                    className={`form-control ${styles.input}`}
                    value={form.interest_rate_structure}
                    onChange={handleChange}
                    disabled={!editable}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Loan Term</label>
                  <NumericFormat
                    name="loan_term"
                    className={`form-control ${styles.input}`}
                    value={form.loan_term}
                    onValueChange={(values) => handleNumberFormat('loan_term', values.value)}
                    disabled={!editable}
                    thousandSeparator={false}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Prepayment Penalty</label>
                  <NumericFormat
                    name="prepayment_penalty"
                    className={`form-control ${styles.input}`}
                    value={form.prepayment_penalty}
                    onValueChange={(values) => handleNumberFormat('prepayment_penalty', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Prepayment Penalty Type</label>
                  <input
                    type="text"
                    name="prepayment_penalty_type"
                    className={`form-control ${styles.input}`}
                    value={form.prepayment_penalty_type}
                    onChange={handleChange}
                    disabled={!editable}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Maximun LTV (Loan To Value)</label>
                  <NumericFormat
                    name="max_ltv"
                    className={`form-control ${styles.input}`}
                    value={form.max_ltv}
                    onValueChange={(values) => handleNumberFormat('max_ltv', values.value)}
                    disabled={!editable}
                    decimalScale={2}
                    suffix="%"
                  />
                </div>
              </div>
            </div>
          </div>

          

          

          {/* LOAN CLOSING COST ESTIMATED */}
          <div className="row mb-4">
            <div className="col-12">
              <h5 className="fw-bold text-primary mb-3">
                <i className="fas fa-dollar-sign me-2"></i>
                LOAN CLOSING COST ESTIMATED
              </h5>
            </div>
            <div className="col-12">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Origination Fee 2,0%</label>
                  <select
                    name="origination_fee_percentage"
                    className={`form-control ${styles.input}`}
                    value={String(form.origination_fee_percentage)}
                    onChange={(e) => handleNumberFormat('origination_fee_percentage', e.target.value)}
                    disabled={!editable}
                  >
                    <option value="2.5">Origination Fee 2,5%</option>
                    <option value="2.0">Origination Fee 2,0%</option>
                    <option value="1.5">Origination Fee 1,5%</option>
                    <option value="1.0">Origination Fee 1,0%</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Discount Points</label>
                  <NumericFormat
                    name="discount_points"
                    className={`form-control ${styles.input}`}
                    value={form.discount_points}
                    onValueChange={(values) => handleNumberFormat('discount_points', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Underwriting fee</label>
                  <NumericFormat
                    name="underwriting_fee"
                    className={`form-control ${styles.input}`}
                    value={form.underwriting_fee}
                    onValueChange={(values) => handleNumberFormat('underwriting_fee', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Credit Report Fee</label>
                  <NumericFormat
                    name="credit_report_fee"
                    className={`form-control ${styles.input}`}
                    value={form.credit_report_fee}
                    onValueChange={(values) => handleNumberFormat('credit_report_fee', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Processing Fee</label>
                  <NumericFormat
                    name="processing_fee"
                    className={`form-control ${styles.input}`}
                    value={form.processing_fee}
                    onValueChange={(values) => handleNumberFormat('processing_fee', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Recording Fee</label>
                  <NumericFormat
                    name="recording_fee"
                    className={`form-control ${styles.input}`}
                    value={form.recording_fee}
                    onValueChange={(values) => handleNumberFormat('recording_fee', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Legal Fee</label>
                  <NumericFormat
                    name="legal_fee"
                    className={`form-control ${styles.input}`}
                    value={form.legal_fee}
                    onValueChange={(values) => handleNumberFormat('legal_fee', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Service Fee</label>
                  <NumericFormat
                    name="service_fee"
                    className={`form-control ${styles.input}`}
                    value={form.service_fee}
                    onValueChange={(values) => handleNumberFormat('service_fee', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Title Fees</label>
                  <NumericFormat
                    name="title_fees"
                    className={`form-control ${styles.input}`}
                    value={form.title_fees}
                    onValueChange={(values) => handleNumberFormat('title_fees', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Goverment Fees / Transfer tax</label>
                  <NumericFormat
                    name="government_fees"
                    className={`form-control ${styles.input}`}
                    value={form.government_fees}
                    onValueChange={(values) => handleNumberFormat('government_fees', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Escrow tax & Insurance</label>
                  <NumericFormat
                    name="escrow_tax_insurance"
                    className={`form-control ${styles.input}`}
                    value={form.escrow_tax_insurance}
                    onValueChange={(values) => handleNumberFormat('escrow_tax_insurance', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Appraisal Fee</label>
                  <NumericFormat
                    name="appraisal_fee"
                    className={`form-control ${styles.input}`}
                    value={form.appraisal_fee}
                    onValueChange={(values) => handleNumberFormat('appraisal_fee', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Total Closing Cost Estimated</label>
                  <NumericFormat
                    name="total_closing_cost"
                    className={`form-control ${styles.input}`}
                    value={form.total_closing_cost}
                    onValueChange={(values) => handleNumberFormat('total_closing_cost', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Closing Cost Approx</label>
                  <NumericFormat
                    name="closing_cost_approx"
                    className={`form-control ${styles.input}`}
                    value={form.closing_cost_approx}
                    onValueChange={(values) => handleNumberFormat('closing_cost_approx', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TYPE OF PROGRAM */}
          <div className="row mb-4">
            <div className="col-12">
              <h5 className="fw-bold text-primary mb-3">
                <i className="fas fa-layer-group me-2"></i>
                TYPE OF PROGRAM
              </h5>
            </div>
            <div className="col-12">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">DSCR</label>
                  <input
                    type="text"
                    name="type_of_program"
                    className={`form-control ${styles.input}`}
                    value={form.type_of_program || 'DSCR'}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">CLOSING COST APROX</label>
                  <NumericFormat
                    name="closing_cost_approx"
                    className={`form-control ${styles.input}`}
                    value={form.closing_cost_approx}
                    onValueChange={(values) => handleNumberFormat('closing_cost_approx', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">DOWN PAYMENT %</label>
                  <NumericFormat
                    name="down_payment_percent"
                    className={`form-control ${styles.input}`}
                    value={form.down_payment_percent}
                    onValueChange={(values) => handleNumberFormat('down_payment_percent', values.value)}
                    disabled={!editable}
                    suffix="%"
                    decimalScale={2}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">DSCR  MUST BE 1%</label>
                  <NumericFormat
                    name="dscr_requirement"
                    className={`form-control ${styles.input}`}
                    value={form.dscr_requirement}
                    onValueChange={(values) => handleNumberFormat('dscr_requirement', values.value)}
                    disabled={!editable}
                    decimalScale={2}
                    suffix="%"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LOAN SUMARY */}
          <div className="row mb-4">
            <div className="col-12">
              <h5 className="fw-bold text-primary mb-3">
                <i className="fas fa-list me-2"></i>
                LOAN SUMARY
              </h5>
            </div>
            <div className="col-12">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Appraisal value</label>
                  <NumericFormat
                    name="appraisal_value"
                    className={`form-control ${styles.input}`}
                    value={form.appraisal_value}
                    onValueChange={(values) => handleNumberFormat('appraisal_value', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Annual Interest Rate</label>
                  <NumericFormat
                    name="annual_interest_rate"
                    className={`form-control ${styles.input}`}
                    value={form.annual_interest_rate}
                    onValueChange={(values) => handleNumberFormat('annual_interest_rate', values.value)}
                    disabled={!editable}
                    decimalScale={2}
                    suffix="%"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Rent Amount</label>
                  <NumericFormat
                    name="rent_amount"
                    className={`form-control ${styles.input}`}
                    value={form.rent_amount}
                    onValueChange={(values) => handleNumberFormat('rent_amount', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Property Taxes</label>
                  <NumericFormat
                    name="property_taxes"
                    className={`form-control ${styles.input}`}
                    value={form.property_taxes}
                    onValueChange={(values) => handleNumberFormat('property_taxes', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Property Insurance</label>
                  <NumericFormat
                    name="property_insurance"
                    className={`form-control ${styles.input}`}
                    value={form.property_insurance}
                    onValueChange={(values) => handleNumberFormat('property_insurance', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">HOA Fees</label>
                  <NumericFormat
                    name="hoa_fees"
                    className={`form-control ${styles.input}`}
                    value={form.hoa_fees}
                    onValueChange={(values) => handleNumberFormat('hoa_fees', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Flood Insurance</label>
                  <NumericFormat
                    name="flood_insurance"
                    className={`form-control ${styles.input}`}
                    value={form.flood_insurance}
                    onValueChange={(values) => handleNumberFormat('flood_insurance', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Pay Off Amount</label>
                  <NumericFormat
                    name="pay_off_amount"
                    className={`form-control ${styles.input}`}
                    value={form.pay_off_amount}
                    onValueChange={(values) => handleNumberFormat('pay_off_amount', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">LOAN AMOUNT</label>
                  <NumericFormat
                    name="loan_amount"
                    className={`form-control ${styles.input}`}
                    value={form.loan_amount}
                    onValueChange={(values) => handleNumberFormat('loan_amount', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Downpayment</label>
                  <NumericFormat
                    name="down_payment_liquidity"
                    className={`form-control ${styles.input}`}
                    value={form.down_payment_liquidity}
                    onValueChange={(values) => handleNumberFormat('down_payment_liquidity', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Cash out</label>
                  <NumericFormat
                    name="cash_out"
                    className={`form-control ${styles.input}`}
                    value={form.cash_out}
                    onValueChange={(values) => handleNumberFormat('cash_out', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Mortgage Payment PITI</label>
                  <NumericFormat
                    name="mortgage_payment_piti"
                    className={`form-control ${styles.input}`}
                    value={form.mortgage_payment_piti}
                    onValueChange={(values) => handleNumberFormat('mortgage_payment_piti', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DSCR - PITI */}
          <div className="row mb-4">
            <div className="col-12">
              <h5 className="fw-bold text-primary mb-3">
                <i className="fas fa-equals me-2"></i>
                DSCR - PITI
              </h5>
            </div>
            <div className="col-12">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Principal & Interest</label>
                  <NumericFormat
                    name="principal_interest"
                    className={`form-control ${styles.input}`}
                    value={form.principal_interest}
                    onValueChange={(values) => handleNumberFormat('principal_interest', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Property Taxes Estimated</label>
                  <NumericFormat
                    name="property_taxes_estimated"
                    className={`form-control ${styles.input}`}
                    value={form.property_taxes_estimated}
                    onValueChange={(values) => handleNumberFormat('property_taxes_estimated', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Property Insurance</label>
                  <NumericFormat
                    name="property_insurance_estimated"
                    className={`form-control ${styles.input}`}
                    value={form.property_insurance_estimated}
                    onValueChange={(values) => handleNumberFormat('property_insurance_estimated', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">HOA</label>
                  <NumericFormat
                    name="hoa_estimated"
                    className={`form-control ${styles.input}`}
                    value={form.hoa_estimated}
                    onValueChange={(values) => handleNumberFormat('hoa_estimated', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Flood Insurance</label>
                  <NumericFormat
                    name="flood_insurance_estimated"
                    className={`form-control ${styles.input}`}
                    value={form.flood_insurance_estimated}
                    onValueChange={(values) => handleNumberFormat('flood_insurance_estimated', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LIQUIDITY */}
          <div className="row mb-4">
            <div className="col-12">
              <h5 className="fw-bold text-primary mb-3">
                <i className="fas fa-piggy-bank me-2"></i>
                LIQUIDITY
              </h5>
            </div>
            <div className="col-12">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">DSCR Ratio</label>
                  <select
                    name="dscr_required"
                    className={`form-control ${styles.input}`}
                    value={form.dscr_required ? 'YES' : 'NO'}
                    onChange={(e) => setForm(prev => ({ ...prev, dscr_required: e.target.value === 'YES' }))}
                    disabled={!editable}
                  >
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Other Liquidity</label>
                  <NumericFormat
                    name="other_liquidity"
                    className={`form-control ${styles.input}`}
                    value={form.other_liquidity}
                    onValueChange={(values) => handleNumberFormat('other_liquidity', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Total Liquidity</label>
                  <NumericFormat
                    name="total_liquidity"
                    className={`form-control ${styles.input}`}
                    value={form.total_liquidity}
                    onValueChange={(values) => handleNumberFormat('total_liquidity', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Six Months Reserves</label>
                  <NumericFormat
                    name="six_months_reserves"
                    className={`form-control ${styles.input}`}
                    value={form.six_months_reserves}
                    onValueChange={(values) => handleNumberFormat('six_months_reserves', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Closing Cost Liquidity</label>
                  <NumericFormat
                    name="closing_cost_liquidity"
                    className={styles.input}
                    value={form.closing_cost_liquidity}
                    onValueChange={(values) => handleNumberFormat('closing_cost_liquidity', values.value)}
                    disabled={!editable}
                    thousandSeparator={true}
                    prefix="$"
                  />
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
                disabled={loading || !editable}
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
                    {Object.keys(initialData).length ? 'Actualizar' : 'Crear'} Carta de Intención
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

export default DscrIntentionForm;