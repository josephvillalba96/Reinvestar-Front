import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { showSuccess, showError, showInfo, showLoading, updateLoadingToSuccess, updateLoadingToError } from '../../../../../utils/notifications';
import { getFixflipById } from '../../../../../Api/fixflip';
import { getConstructionById } from '../../../../../Api/construction';
import { getUserIdFromToken } from '../../../../../utils/auth';

const FixflipConstructionForm = ({ 
  requestId,
  initialData = {}, 
  onFormChange, 
  onSubmit, 
  loading = false,
  type = 'fixflip', // 'fixflip' o 'construction'
  editable = true
}) => {
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({

    // Borrower Information
    borrower_name: "",
    legal_status: "",
    issued_date: "",
    property_address: "",
    estimated_fico_score: "",

    //LOAN DETAILS
    loan_type: "",
    property_type: "",
    closing_date: "",
    interest_rate_structure: "",
    loan_term: "",
    prepayment_penalty: 0,
    max_ltv: 0,
    max_ltc: 0,

    //PURCHASE, REFINANCE, CASH-OUT
    as_is_value: 0,
    original_acquisition_price: 0,

    //FIX & FLIP, GROUND UP CONSTRUCTION
    land_acquisition_cost: 0,
    construction_rehab_budget: 0,
    total_cost: 0,
    estimated_after_completion_value: 0,
    
    //LOAN CLOSING COST
    origination_fee: 0,
    underwriting_fee: 0,
    processing_fee: 0,
    servicing_fee: 0,
    legal_fee: 0,
    appraisal_fee: 0,
    budget_review_fee: 0,

    //OTHER EXPENSES (Estimated)
    broker_fee: 0,
    broker_fee_percentage: 0,
    transaction_management_fee: 0,

    //LOAN SUMMRY
    total_loan_amount: 0,
    loan_amount: 0,
    annual_interest_rate: 0,
    requested_leverage: 0,
    monthly_interest_payment: 0,

    // IF LOAN IS FIX & FLIP OR GROUND UP CONSTRUCTION
    construction_holdback: 0,
    initial_funding: 0,
    day1_monthly_interest_payment: 0,
    interest_reserves: 0,

    //PURCHASE, REFINANCE, CASH OUT
    loan_to_as_is_value: 0,

    // FIX & FLIP, GROUND UP CONSTRUCTION
    loan_to_as_is_value_ltv: 0,
    loan_to_cost_ltc: 0,
    loan_to_arv: 0,
    rehab_category: "",
    
    // CONDITIONS AND ADDITIONAL INFORMATION 
    min_credit_score: 0,
    refundable_commitment_deposit: 0,
    
    // MINIMUM BORROWER'S LIQUIDITY REQUIRED (Estimated)
    estimated_closing_costs: 0,
    construction_budget_10_percent: 0,
    six_months_payment_reserves: 0,
    construction_budget_delta: 0,
    down_payment: 0,
    total_liquidity: 0,

    // Campos del Sistema
    client_id: 0,
    user_id: 0,
    client_submitted: false,
    client_form_completed: false,
    client_submitted_at: "",
    borrower_signed: false,
    guarantor_signed: false,
    is_signed: false,
    is_approved: false
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Debugging específico para land_acquisition_cost en initialData
      console.log('[FixflipConstruction] Loading initialData - land_acquisition_cost:', {
        fromInitialData: initialData.land_acquisition_cost,
        dataType: typeof initialData.land_acquisition_cost,
        previousValue: form.land_acquisition_cost,
        requestId: requestId,
        formType: type,
        allNumericFields: {
          land_acquisition_cost: initialData.land_acquisition_cost,
          construction_rehab_budget: initialData.construction_rehab_budget,
          total_cost: initialData.total_cost,
          as_is_value: initialData.as_is_value,
          original_acquisition_price: initialData.original_acquisition_price,
          estimated_after_completion_value: initialData.estimated_after_completion_value
        }
      });

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
      // Debugging específico para campos de la sección 10 en initialData
      console.log('[FixflipConstruction] Loading initialData - SECTION 10 FIELDS:', {
        min_credit_score: {
          inInitialData: 'min_credit_score' in initialData,
          initialDataValue: initialData.min_credit_score,
          inMapped: 'min_credit_score' in mapped,
          mappedValue: mapped.min_credit_score,
          previousValue: form.min_credit_score
        },
        refundable_commitment_deposit: {
          inInitialData: 'refundable_commitment_deposit' in initialData,
          initialDataValue: initialData.refundable_commitment_deposit,
          inMapped: 'refundable_commitment_deposit' in mapped,
          mappedValue: mapped.refundable_commitment_deposit,
          previousValue: form.refundable_commitment_deposit
        }
      });

      // Solo actualizar campos que existen en initialData para evitar sobrescribir campos con undefined
      setForm(prev => {
        const updatedForm = { ...prev };
        Object.keys(mapped).forEach(key => {
          if (mapped[key] !== undefined && mapped[key] !== null) {
            updatedForm[key] = mapped[key];
          }
        });
        
        // Debugging específico para verificar qué campos se están actualizando
        console.log('[FixflipConstruction] initialData - FIELDS BEING UPDATED:', {
          min_credit_score: {
            willUpdate: mapped.min_credit_score !== undefined && mapped.min_credit_score !== null,
            newValue: mapped.min_credit_score,
            oldValue: prev.min_credit_score,
            finalValue: updatedForm.min_credit_score
          },
          refundable_commitment_deposit: {
            willUpdate: mapped.refundable_commitment_deposit !== undefined && mapped.refundable_commitment_deposit !== null,
            newValue: mapped.refundable_commitment_deposit,
            oldValue: prev.refundable_commitment_deposit,
            finalValue: updatedForm.refundable_commitment_deposit
          }
        });
        
        return updatedForm;
      });
      setShowCreateForm(false);
    } else if (requestId) {
      const load = async () => {
        setLoadingData(true);
        setError("");
        try {
          const data = type === 'construction' 
            ? await getConstructionById(Number(requestId))
            : await getFixflipById(Number(requestId));
          if (data) {
            // Mapear posibles alias de campos que el backend puede retornar
            const mapped = { ...data };
            if (mapped.service_fee != null && (mapped.servicing_fee == null || Number(mapped.servicing_fee) === 0)) {
              mapped.servicing_fee = mapped.service_fee;
            }
            if (mapped.total_closing_cost_estimated != null && (mapped.estimated_closing_costs == null || Number(mapped.estimated_closing_costs) === 0)) {
              mapped.estimated_closing_costs = mapped.total_closing_cost_estimated;
            }
            if (mapped.interest_rate != null && (mapped.annual_interest_rate == null || Number(mapped.annual_interest_rate) === 0)) {
              mapped.annual_interest_rate = mapped.interest_rate;
            }
            // Mapear posibles alias para loan_to_as_is_value
            if (mapped.loan_to_value != null && (mapped.loan_to_as_is_value == null || Number(mapped.loan_to_as_is_value) === 0)) {
              mapped.loan_to_as_is_value = mapped.loan_to_value;
            }
            if (mapped.ltv != null && (mapped.loan_to_as_is_value == null || Number(mapped.loan_to_as_is_value) === 0)) {
              mapped.loan_to_as_is_value = mapped.ltv;
            }
            
            // Debugging específico para land_acquisition_cost en la carga de datos
            console.log('[FixflipConstruction] Loading data - land_acquisition_cost:', {
              fromAPI: data.land_acquisition_cost,
              fromMapped: mapped.land_acquisition_cost,
              previousValue: form.land_acquisition_cost,
              willSet: mapped.land_acquisition_cost !== undefined ? mapped.land_acquisition_cost : form.land_acquisition_cost,
              requestId: requestId,
              formType: type,
              allNumericFields: {
                land_acquisition_cost: data.land_acquisition_cost,
                construction_rehab_budget: data.construction_rehab_budget,
                total_cost: data.total_cost,
                as_is_value: data.as_is_value,
                original_acquisition_price: data.original_acquisition_price,
                estimated_after_completion_value: data.estimated_after_completion_value
              }
            });

            // Debugging específico para loan_to_as_is_value
            console.log('[FixflipConstruction] Loading data - loan_to_as_is_value:', {
              fromAPI: data.loan_to_as_is_value,
              fromMapped: mapped.loan_to_as_is_value,
              previousValue: form.loan_to_as_is_value,
              willSet: mapped.loan_to_as_is_value !== undefined ? mapped.loan_to_as_is_value : form.loan_to_as_is_value,
              requestId: requestId,
              formType: type,
              allLoanFields: {
                loan_to_as_is_value: data.loan_to_as_is_value,
                loan_to_as_is_value_ltv: data.loan_to_as_is_value_ltv,
                loan_to_cost_ltc: data.loan_to_cost_ltc,
                loan_to_arv: data.loan_to_arv
              }
            });

            // Debugging específico para min_credit_score y refundable_commitment_deposit
            console.log('[FixflipConstruction] Loading data - CONDITIONS FIELDS:', {
              min_credit_score: {
                fromAPI: data.min_credit_score,
                fromMapped: mapped.min_credit_score,
                previousValue: form.min_credit_score,
                willSet: mapped.min_credit_score !== undefined ? mapped.min_credit_score : form.min_credit_score
              },
              refundable_commitment_deposit: {
                fromAPI: data.refundable_commitment_deposit,
                fromMapped: mapped.refundable_commitment_deposit,
                previousValue: form.refundable_commitment_deposit,
                willSet: mapped.refundable_commitment_deposit !== undefined ? mapped.refundable_commitment_deposit : form.refundable_commitment_deposit
              }
            });

            // Debugging específico para campos de liquidez
            console.log('[FixflipConstruction] Loading data - LIQUIDITY FIELDS:', {
              estimated_closing_costs: {
                fromAPI: data.estimated_closing_costs,
                fromMapped: mapped.estimated_closing_costs,
                previousValue: form.estimated_closing_costs,
                willSet: mapped.estimated_closing_costs !== undefined ? mapped.estimated_closing_costs : form.estimated_closing_costs
              },
              construction_budget_10_percent: {
                fromAPI: data.construction_budget_10_percent,
                fromMapped: mapped.construction_budget_10_percent,
                previousValue: form.construction_budget_10_percent,
                willSet: mapped.construction_budget_10_percent !== undefined ? mapped.construction_budget_10_percent : form.construction_budget_10_percent
              },
              six_months_payment_reserves: {
                fromAPI: data.six_months_payment_reserves,
                fromMapped: mapped.six_months_payment_reserves,
                previousValue: form.six_months_payment_reserves,
                willSet: mapped.six_months_payment_reserves !== undefined ? mapped.six_months_payment_reserves : form.six_months_payment_reserves
              },
              construction_budget_delta: {
                fromAPI: data.construction_budget_delta,
                fromMapped: mapped.construction_budget_delta,
                previousValue: form.construction_budget_delta,
                willSet: mapped.construction_budget_delta !== undefined ? mapped.construction_budget_delta : form.construction_budget_delta
              },
              down_payment: {
                fromAPI: data.down_payment,
                fromMapped: mapped.down_payment,
                previousValue: form.down_payment,
                willSet: mapped.down_payment !== undefined ? mapped.down_payment : form.down_payment
              },
              total_liquidity: {
                fromAPI: data.total_liquidity,
                fromMapped: mapped.total_liquidity,
                previousValue: form.total_liquidity,
                willSet: mapped.total_liquidity !== undefined ? mapped.total_liquidity : form.total_liquidity
              }
            });

            setForm(prev => ({
              ...prev,
              client_id: mapped.client_id ?? prev.client_id,
              user_id: prev.user_id || mapped.user_id || (getUserIdFromToken ? Number(getUserIdFromToken()) : prev.user_id),
              borrower_name: mapped.borrower_name || prev.borrower_name,
              legal_status: mapped.legal_status || prev.legal_status,
              issued_date: mapped.issued_date || prev.issued_date,
              property_address: mapped.property_address || prev.property_address,
              estimated_fico_score: mapped.estimated_fico_score ?? mapped.fico_score ?? prev.estimated_fico_score,
              loan_type: mapped.loan_type || prev.loan_type,
              property_type: mapped.property_type || prev.property_type,
              closing_date: mapped.closing_date || mapped.estimated_closing_date || prev.closing_date,
              interest_rate_structure: mapped.interest_rate_structure || prev.interest_rate_structure,
              loan_term: mapped.loan_term || prev.loan_term,
              prepayment_penalty: mapped.prepayment_penalty ?? prev.prepayment_penalty,
              max_ltv: mapped.max_ltv ?? prev.max_ltv,
              max_ltc: mapped.max_ltc ?? prev.max_ltc,
              as_is_value: mapped.as_is_value ?? prev.as_is_value,
              original_acquisition_price: mapped.original_acquisition_price ?? prev.original_acquisition_price,
              land_acquisition_cost: mapped.land_acquisition_cost !== undefined ? mapped.land_acquisition_cost : prev.land_acquisition_cost,
              construction_rehab_budget: mapped.construction_rehab_budget ?? prev.construction_rehab_budget,
              total_cost: mapped.total_cost ?? prev.total_cost,
              estimated_after_completion_value: mapped.estimated_after_completion_value ?? prev.estimated_after_completion_value,
              origination_fee: mapped.origination_fee ?? prev.origination_fee,
              underwriting_fee: mapped.underwriting_fee ?? prev.underwriting_fee,
              processing_fee: mapped.processing_fee ?? prev.processing_fee,
              servicing_fee: mapped.servicing_fee ?? prev.servicing_fee,
              legal_fee: mapped.legal_fee ?? prev.legal_fee,
              appraisal_fee: mapped.appraisal_fee ?? prev.appraisal_fee,
              budget_review_fee: mapped.budget_review_fee ?? prev.budget_review_fee,
              broker_fee: mapped.broker_fee ?? prev.broker_fee,
              broker_fee_percentage: mapped.broker_fee_percentage ?? prev.broker_fee_percentage,
              transaction_management_fee: mapped.transaction_management_fee ?? prev.transaction_management_fee,
              total_loan_amount: mapped.total_loan_amount ?? prev.total_loan_amount,
              loan_amount: mapped.loan_amount ?? prev.loan_amount,
              annual_interest_rate: mapped.annual_interest_rate ?? prev.annual_interest_rate,
              requested_leverage: mapped.requested_leverage ?? prev.requested_leverage,
              monthly_interest_payment: mapped.monthly_interest_payment ?? prev.monthly_interest_payment,
              construction_holdback: mapped.construction_holdback ?? prev.construction_holdback,
              initial_funding: mapped.initial_funding ?? prev.initial_funding,
              day1_monthly_interest_payment: mapped.day1_monthly_interest_payment ?? prev.day1_monthly_interest_payment,
              interest_reserves: mapped.interest_reserves ?? prev.interest_reserves,
              loan_to_as_is_value: mapped.loan_to_as_is_value ?? prev.loan_to_as_is_value,
              loan_to_as_is_value_ltv: mapped.loan_to_as_is_value_ltv ?? prev.loan_to_as_is_value_ltv,
              loan_to_cost_ltc: mapped.loan_to_cost_ltc ?? prev.loan_to_cost_ltc,
              loan_to_arv: mapped.loan_to_arv ?? prev.loan_to_arv,
              rehab_category: mapped.rehab_category || prev.rehab_category,
              min_credit_score: mapped.min_credit_score ?? prev.min_credit_score,
              refundable_commitment_deposit: mapped.refundable_commitment_deposit ?? prev.refundable_commitment_deposit,
              estimated_closing_costs: mapped.estimated_closing_costs ?? prev.estimated_closing_costs,
              construction_budget_10_percent: mapped.construction_budget_10_percent ?? prev.construction_budget_10_percent,
              six_months_payment_reserves: mapped.six_months_payment_reserves ?? prev.six_months_payment_reserves,
              construction_budget_delta: mapped.construction_budget_delta ?? prev.construction_budget_delta,
              down_payment: mapped.down_payment ?? prev.down_payment,
              total_liquidity: mapped.total_liquidity ?? prev.total_liquidity,
              client_submitted: mapped.client_submitted ?? prev.client_submitted,
              client_form_completed: mapped.client_form_completed ?? prev.client_form_completed,
              client_submitted_at: mapped.client_submitted_at || prev.client_submitted_at,
              borrower_signed: mapped.borrower_signed ?? prev.borrower_signed,
              guarantor_signed: mapped.guarantor_signed ?? prev.guarantor_signed,
              is_signed: mapped.is_signed ?? prev.is_signed,
              is_approved: mapped.is_approved ?? prev.is_approved
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
  }, [initialData, requestId, type]);

  useEffect(() => {
    if (onFormChange) {
      onFormChange(form);
    }
  }, [form, onFormChange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('[FixflipConstruction] handleChange:', { name, value, type, checked });
    
    // Debugging específico para campos problemáticos
    if (name === 'loan_term' || name === 'budget_review_fee') {
      console.log(`[FixflipConstruction] ${name} changing from:`, form[name], 'to:', value);
      console.log(`[FixflipConstruction] ${name} - editable:`, editable, 'disabled:', !editable);
    }
    
    setForm(prev => {
      const newForm = {
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                name === 'prepayment_penalty' ? Number(value) : value
      };
      
      // Debugging específico para loan_term después del cambio
      if (name === 'loan_term') {
        console.log(`[FixflipConstruction] loan_term after setForm:`, newForm.loan_term);
        console.log(`[FixflipConstruction] loan_term change complete:`, {
          oldValue: form.loan_term,
          newValue: newForm.loan_term,
          inputValue: value,
          type: typeof newForm.loan_term
        });
      }
      
      return newForm;
    });
  };

  const toISOOrNull = (v) => {
    if (!v || v === "" || v === "null" || v === "undefined") return null;
    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return null;
      return d.toISOString();
    } catch (_) { return null; }
  };

  const buildDataToSend = () => {
    // Debugging específico para loan_term
    console.log('[FixflipConstruction] buildDataToSend - loan_term processing:', {
      originalValue: form.loan_term,
      type: typeof form.loan_term,
      isNull: form.loan_term === null,
      isUndefined: form.loan_term === undefined,
      isEmpty: form.loan_term === "",
      stringValue: String(form.loan_term)
    });

    // Debugging específico para land_acquisition_cost
    console.log('[FixflipConstruction] buildDataToSend - land_acquisition_cost processing:', {
      originalValue: form.land_acquisition_cost,
      type: typeof form.land_acquisition_cost,
      isNull: form.land_acquisition_cost === null,
      isUndefined: form.land_acquisition_cost === undefined,
      isEmpty: form.land_acquisition_cost === "",
      stringValue: String(form.land_acquisition_cost)
    });

    const payload = {
      client_id: Number(form.client_id || 0),
      user_id: Number(form.user_id || getUserIdFromToken?.() || 0),
      borrower_name: form.borrower_name || "",
      legal_status: form.legal_status || "",
      property_address: form.property_address || "",
      estimated_fico_score: Number(form.estimated_fico_score || 0),
      loan_type: form.loan_type || "",
      property_type: form.property_type || "",
      interest_rate_structure: form.interest_rate_structure || "",
      loan_term: (() => {
        const value = form.loan_term;
        if (value === null || value === undefined || value === "") return 0;
        const numValue = Number(value);
        return Number.isNaN(numValue) ? 0 : Math.round(numValue);
      })(),
      prepayment_penalty: Number(form.prepayment_penalty || 0),
      max_ltv: Number(form.max_ltv || 0),
      max_ltc: Number(form.max_ltc || 0),
      as_is_value: Number(form.as_is_value || 0),
      original_acquisition_price: Number(form.original_acquisition_price || 0),
      land_acquisition_cost: Number(form.land_acquisition_cost || 0),
      construction_rehab_budget: Number(form.construction_rehab_budget || 0),
      total_cost: Number(form.total_cost || 0),
      estimated_after_completion_value: Number(form.estimated_after_completion_value || 0),
      origination_fee: Number(form.origination_fee || 0),
      underwriting_fee: Number(form.underwriting_fee || 0),
      processing_fee: Number(form.processing_fee || 0),
      servicing_fee: Number(form.servicing_fee || 0),
      legal_fee: Number(form.legal_fee || 0),
      appraisal_fee: Number(form.appraisal_fee || 0),
      budget_review_fee: Number(form.budget_review_fee || 0),
      broker_fee: Number(form.broker_fee || 0),
      broker_fee_percentage: Number(form.broker_fee_percentage || 0),
      transaction_management_fee: Number(form.transaction_management_fee || 0),
      total_loan_amount: Number(form.total_loan_amount || 0),
      loan_amount: Number(form.loan_amount || 0),
      annual_interest_rate: Number(form.annual_interest_rate || 0),
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
      min_credit_score: (() => {
        const value = Number(form.min_credit_score || 0);
        console.log('[FixflipConstruction] buildDataToSend - min_credit_score processing:', {
          formValue: form.min_credit_score,
          formType: typeof form.min_credit_score,
          processedValue: value,
          processedType: typeof value
        });
        return value;
      })(),
      refundable_commitment_deposit: (() => {
        const value = Number(form.refundable_commitment_deposit || 0);
        console.log('[FixflipConstruction] buildDataToSend - refundable_commitment_deposit processing:', {
          formValue: form.refundable_commitment_deposit,
          formType: typeof form.refundable_commitment_deposit,
          processedValue: value,
          processedType: typeof value
        });
        return value;
      })(),
      estimated_closing_costs: Number(form.estimated_closing_costs || 0),
      construction_budget_10_percent: Number(form.construction_budget_10_percent || 0),
      six_months_payment_reserves: Number(form.six_months_payment_reserves || 0),
      construction_budget_delta: Number(form.construction_budget_delta || 0),
      down_payment: Number(form.down_payment || 0),
      total_liquidity: Number(form.total_liquidity || 0),
      client_submitted: Boolean(form.client_submitted),
      client_form_completed: Boolean(form.client_form_completed),
      borrower_signed: Boolean(form.borrower_signed),
      guarantor_signed: Boolean(form.guarantor_signed),
      is_signed: Boolean(form.is_signed),
      is_approved: Boolean(form.is_approved)
    };

    // Debugging del resultado final para loan_term
    console.log('[FixflipConstruction] buildDataToSend - loan_term result:', {
      finalValue: payload.loan_term,
      finalType: typeof payload.loan_term,
      isInPayload: 'loan_term' in payload
    });

    // Debugging del resultado final para land_acquisition_cost
    console.log('[FixflipConstruction] buildDataToSend - land_acquisition_cost result:', {
      finalValue: payload.land_acquisition_cost,
      finalType: typeof payload.land_acquisition_cost,
      isInPayload: 'land_acquisition_cost' in payload,
      payloadKeys: Object.keys(payload).filter(key => key.includes('land') || key.includes('acquisition')),
      fullPayload: payload
    });

    // Solo agregar campos de fecha si tienen valor
    const issuedDate = toISOOrNull(form.issued_date);
    if (issuedDate !== null) {
      payload.issued_date = issuedDate;
    }

    const closingDate = toISOOrNull(form.closing_date);
    if (closingDate !== null) {
      payload.closing_date = closingDate;
    }

    const clientSubmittedAt = toISOOrNull(form.client_submitted_at);
    if (clientSubmittedAt !== null) {
      payload.client_submitted_at = clientSubmittedAt;
    }

    // Debugging final del payload para verificar que los campos estén incluidos
    console.log('[FixflipConstruction] buildDataToSend - FINAL PAYLOAD CHECK:', {
      min_credit_score: {
        inPayload: 'min_credit_score' in payload,
        value: payload.min_credit_score,
        type: typeof payload.min_credit_score
      },
      refundable_commitment_deposit: {
        inPayload: 'refundable_commitment_deposit' in payload,
        value: payload.refundable_commitment_deposit,
        type: typeof payload.refundable_commitment_deposit
      },
      allKeys: Object.keys(payload).filter(key => key.includes('credit') || key.includes('commitment') || key.includes('deposit'))
    });

    return payload;
  };

  useEffect(() => {
    // Solo calcular campos específicos sin tocar otros campos del formulario
    const monthly = (Number(form.loan_amount || 0) * Number(form.annual_interest_rate || 0)) / 100 / 12;
    const day1 = (Number(form.initial_funding || 0) * Number(form.annual_interest_rate || 0)) / 100 / 12;
    const totalLiquidity = Number(form.estimated_closing_costs || 0) + Number(form.construction_budget_10_percent || 0) + Number(form.six_months_payment_reserves || 0) + Number(form.construction_budget_delta || 0) + Number(form.down_payment || 0);
    
    // Debugging específico para campos de la sección 11
    console.log('[FixflipConstruction] useEffect CALCULATIONS - SECTION 11 FIELDS:', {
      construction_budget_10_percent: {
        formValue: form.construction_budget_10_percent,
        formType: typeof form.construction_budget_10_percent,
        inTotalLiquidity: true
      },
      six_months_payment_reserves: {
        formValue: form.six_months_payment_reserves,
        formType: typeof form.six_months_payment_reserves,
        inTotalLiquidity: true
      },
      construction_budget_delta: {
        formValue: form.construction_budget_delta,
        formType: typeof form.construction_budget_delta,
        inTotalLiquidity: true
      },
      totalLiquidity: {
        calculated: totalLiquidity,
        isFinite: Number.isFinite(totalLiquidity),
        current: form.total_liquidity
      }
    });
    
    // Solo actualizar los campos calculados específicamente
    setForm(prev => {
      const newForm = { ...prev };
      
      // Solo actualizar si el valor calculado es diferente y válido
      if (Number.isFinite(monthly) && monthly !== prev.monthly_interest_payment) {
        newForm.monthly_interest_payment = monthly;
      }
      if (Number.isFinite(day1) && day1 !== prev.day1_monthly_interest_payment) {
        newForm.day1_monthly_interest_payment = day1;
      }
      if (Number.isFinite(totalLiquidity) && totalLiquidity !== prev.total_liquidity) {
        newForm.total_liquidity = totalLiquidity;
      }
      
      // Solo actualizar user_id si no está definido
      if (!prev.user_id && getUserIdFromToken) {
        newForm.user_id = Number(getUserIdFromToken()) || 0;
      }
      
      // Debugging para verificar que no se están modificando los campos de la sección 11
      console.log('[FixflipConstruction] useEffect CALCULATIONS - SECTION 11 FIELDS PRESERVED:', {
        construction_budget_10_percent: {
          before: prev.construction_budget_10_percent,
          after: newForm.construction_budget_10_percent,
          changed: prev.construction_budget_10_percent !== newForm.construction_budget_10_percent
        },
        six_months_payment_reserves: {
          before: prev.six_months_payment_reserves,
          after: newForm.six_months_payment_reserves,
          changed: prev.six_months_payment_reserves !== newForm.six_months_payment_reserves
        },
        construction_budget_delta: {
          before: prev.construction_budget_delta,
          after: newForm.construction_budget_delta,
          changed: prev.construction_budget_delta !== newForm.construction_budget_delta
        }
      });
      
      return newForm;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.loan_amount, form.annual_interest_rate, form.initial_funding, form.estimated_closing_costs, form.construction_budget_10_percent, form.six_months_payment_reserves, form.construction_budget_delta, form.down_payment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      const payload = buildDataToSend();
      try {
        // eslint-disable-next-line no-console
        console.log('[FixflipConstruction] Payload enviado:', payload);
        console.log('[FixflipConstruction] Form state completo:', form);
        console.log('[FixflipConstruction] OTHER EXPENSES fields:', {
          broker_fee: form.broker_fee,
          broker_fee_percentage: form.broker_fee_percentage,
          transaction_management_fee: form.transaction_management_fee
        });
        console.log('[FixflipConstruction] LAND ACQUISITION COST field:', {
          formValue: form.land_acquisition_cost,
          payloadValue: payload.land_acquisition_cost,
          type: typeof payload.land_acquisition_cost,
          isInPayload: 'land_acquisition_cost' in payload
        });
        console.log('[FixflipConstruction] SERVICING FEE field:', {
          formValue: form.servicing_fee,
          payloadValue: payload.servicing_fee,
          type: typeof payload.servicing_fee,
          isInPayload: 'servicing_fee' in payload
        });
        console.log('[FixflipConstruction] TOTAL LOAN AMOUNT field:', {
          formValue: form.total_loan_amount,
          payloadValue: payload.total_loan_amount,
          type: typeof payload.total_loan_amount,
          isInPayload: 'total_loan_amount' in payload
        });
        console.log('[FixflipConstruction] REQUESTED LEVERAGE field:', {
          formValue: form.requested_leverage,
          payloadValue: payload.requested_leverage,
          type: typeof payload.requested_leverage,
          isInPayload: 'requested_leverage' in payload
        });
        console.log('[FixflipConstruction] Form editable:', editable);
        console.log('[FixflipConstruction] loan_term field:', {
          formValue: form.loan_term,
          payloadValue: payload.loan_term,
          type: typeof payload.loan_term,
          isEditable: editable,
          isDisabled: !editable
        });
        console.log('[FixflipConstruction] budget_review_fee field:', {
          formValue: form.budget_review_fee,
          payloadValue: payload.budget_review_fee,
          type: typeof payload.budget_review_fee
        });
        console.log('[FixflipConstruction] FIX & FLIP CONSTRUCTION FIELDS:', {
          land_acquisition_cost: {
            formValue: form.land_acquisition_cost,
            payloadValue: payload.land_acquisition_cost,
            type: typeof payload.land_acquisition_cost,
            isInPayload: 'land_acquisition_cost' in payload
          },
          construction_rehab_budget: {
            formValue: form.construction_rehab_budget,
            payloadValue: payload.construction_rehab_budget,
            type: typeof payload.construction_rehab_budget,
            isInPayload: 'construction_rehab_budget' in payload
          },
          total_cost: {
            formValue: form.total_cost,
            payloadValue: payload.total_cost,
            type: typeof payload.total_cost,
            isInPayload: 'total_cost' in payload
          },
          estimated_after_completion_value: {
            formValue: form.estimated_after_completion_value,
            payloadValue: payload.estimated_after_completion_value,
            type: typeof payload.estimated_after_completion_value,
            isInPayload: 'estimated_after_completion_value' in payload
          }
        });
        console.log('[FixflipConstruction] FIX & FLIP METRICS FIELDS:', {
          loan_to_as_is_value_ltv: {
            formValue: form.loan_to_as_is_value_ltv,
            payloadValue: payload.loan_to_as_is_value_ltv,
            type: typeof payload.loan_to_as_is_value_ltv,
            isInPayload: 'loan_to_as_is_value_ltv' in payload
          },
          loan_to_cost_ltc: {
            formValue: form.loan_to_cost_ltc,
            payloadValue: payload.loan_to_cost_ltc,
            type: typeof payload.loan_to_cost_ltc,
            isInPayload: 'loan_to_cost_ltc' in payload
          },
          loan_to_arv: {
            formValue: form.loan_to_arv,
            payloadValue: payload.loan_to_arv,
            type: typeof payload.loan_to_arv,
            isInPayload: 'loan_to_arv' in payload
          },
          rehab_category: {
            formValue: form.rehab_category,
            payloadValue: payload.rehab_category,
            type: typeof payload.rehab_category,
            isInPayload: 'rehab_category' in payload
          }
        });
        console.log('[FixflipConstruction] LOAN TO AS IS VALUE field:', {
          formValue: form.loan_to_as_is_value,
          payloadValue: payload.loan_to_as_is_value,
          type: typeof payload.loan_to_as_is_value,
          isInPayload: 'loan_to_as_is_value' in payload
        });
        console.log('[FixflipConstruction] CONDITIONS AND ADDITIONAL INFORMATION FIELDS:', {
          min_credit_score: {
            formValue: form.min_credit_score,
            payloadValue: payload.min_credit_score,
            type: typeof payload.min_credit_score,
            isInPayload: 'min_credit_score' in payload
          },
          refundable_commitment_deposit: {
            formValue: form.refundable_commitment_deposit,
            payloadValue: payload.refundable_commitment_deposit,
            type: typeof payload.refundable_commitment_deposit,
            isInPayload: 'refundable_commitment_deposit' in payload
          }
        });
        console.log('[FixflipConstruction] MINIMUM BORROWER LIQUIDITY FIELDS:', {
          estimated_closing_costs: {
            formValue: form.estimated_closing_costs,
            payloadValue: payload.estimated_closing_costs,
            type: typeof payload.estimated_closing_costs,
            isInPayload: 'estimated_closing_costs' in payload
          },
          construction_budget_10_percent: {
            formValue: form.construction_budget_10_percent,
            payloadValue: payload.construction_budget_10_percent,
            type: typeof payload.construction_budget_10_percent,
            isInPayload: 'construction_budget_10_percent' in payload
          },
          six_months_payment_reserves: {
            formValue: form.six_months_payment_reserves,
            payloadValue: payload.six_months_payment_reserves,
            type: typeof payload.six_months_payment_reserves,
            isInPayload: 'six_months_payment_reserves' in payload
          },
          construction_budget_delta: {
            formValue: form.construction_budget_delta,
            payloadValue: payload.construction_budget_delta,
            type: typeof payload.construction_budget_delta,
            isInPayload: 'construction_budget_delta' in payload
          },
          down_payment: {
            formValue: form.down_payment,
            payloadValue: payload.down_payment,
            type: typeof payload.down_payment,
            isInPayload: 'down_payment' in payload
          },
          total_liquidity: {
            formValue: form.total_liquidity,
            payloadValue: payload.total_liquidity,
            type: typeof payload.total_liquidity,
            isInPayload: 'total_liquidity' in payload
          }
        });
        
        // Verificar si loan_term está en el payload
        console.log('[FixflipConstruction] Payload keys:', Object.keys(payload));
        console.log('[FixflipConstruction] loan_term in payload:', 'loan_term' in payload);
        
        // Verificar específicamente min_credit_score y refundable_commitment_deposit en el payload
        console.log('[FixflipConstruction] PAYLOAD VERIFICATION - CONDITIONS FIELDS:', {
          min_credit_score: {
            inPayload: 'min_credit_score' in payload,
            payloadValue: payload.min_credit_score,
            payloadType: typeof payload.min_credit_score,
            formValue: form.min_credit_score,
            formType: typeof form.min_credit_score
          },
          refundable_commitment_deposit: {
            inPayload: 'refundable_commitment_deposit' in payload,
            payloadValue: payload.refundable_commitment_deposit,
            payloadType: typeof payload.refundable_commitment_deposit,
            formValue: form.refundable_commitment_deposit,
            formType: typeof form.refundable_commitment_deposit
          }
        });
        
        // Debugging específico para verificar el valor exacto
        console.log('[FixflipConstruction] loan_term exact value:', {
          formValue: form.loan_term,
          formValueType: typeof form.loan_term,
          payloadValue: payload.loan_term,
          payloadValueType: typeof payload.loan_term,
          isInPayload: 'loan_term' in payload,
          payloadKeys: Object.keys(payload).filter(key => key.includes('loan'))
        });
      } catch (_) {}
      onSubmit(payload);
    }
  };

  const handleCreateIntentLetter = async () => {
    if (onSubmit) {
      const payload = buildDataToSend();
      try {
        // eslint-disable-next-line no-console
        console.log('[FixflipConstruction] Payload enviado (create):', payload);
      } catch (_) {}
      onSubmit(payload);
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
        {/* 0. BORROWER INFORMATION */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">0. BORROWER INFORMATION</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Borrower Name</label>
                <input name="borrower_name" className="form-control" value={form.borrower_name || ''} onChange={handleChange} disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Legal Status</label>
                <input name="legal_status" className="form-control" value={form.legal_status || ''} onChange={handleChange} disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Issued Date</label>
                <input type="date" name="issued_date" className="form-control" value={form.issued_date ? String(form.issued_date).split('T')[0] : ''} onChange={handleChange} disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Property Address</label>
                <input name="property_address" className="form-control" value={form.property_address || ''} onChange={handleChange} disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Estimated FICO Score</label>
                <NumericFormat name="estimated_fico_score" className="form-control" value={form.estimated_fico_score || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, estimated_fico_score: Number(value || 0) }))} disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

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
                {console.log('[FixflipConstruction] loan_term input - editable:', editable, 'disabled:', !editable, 'value:', form.loan_term)}
                {/* <small className="text-muted">Debug: editable={String(editable)}, disabled={String(!editable)}, value="{form.loan_term}"</small> */}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">PREPAYMENT PENALTY</label>
                <select name="prepayment_penalty" className="form-control" value={form.prepayment_penalty || 0} onChange={handleChange} disabled={!editable}>
                  <option value={0}>NOT APPLICABLE</option>
                  <option value={1}>1 YR</option>
                  <option value={2}>2 YR</option>
                  <option value={3}>3 YR</option>
                  <option value={4}>4 YR</option>
                  <option value={5}>5 YR</option>
                </select>
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
                <NumericFormat name="land_acquisition_cost" className="form-control" value={form.land_acquisition_cost || ""} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] land_acquisition_cost changed:', value);
                  setForm(prev => ({ ...prev, land_acquisition_cost: value ? Number(value) : null }));
                }} thousandSeparator="," prefix="$" allowNegative={false} decimalScale={0} disabled={!editable} />
                {console.log('[FixflipConstruction] land_acquisition_cost field RENDER:', {
                  formValue: form.land_acquisition_cost,
                  formValueType: typeof form.land_acquisition_cost,
                  editable: editable,
                  disabled: !editable,
                  displayValue: form.land_acquisition_cost || "",
                  isNull: form.land_acquisition_cost === null,
                  isUndefined: form.land_acquisition_cost === undefined,
                  isZero: form.land_acquisition_cost === 0
                })}
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
                <NumericFormat name="servicing_fee" className="form-control" value={form.servicing_fee || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] servicing_fee changed:', value);
                  setForm(prev => ({ ...prev, servicing_fee: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
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
                <NumericFormat name="budget_review_fee" className="form-control" value={form.budget_review_fee || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] budget_review_fee changed:', value);
                  setForm(prev => ({ ...prev, budget_review_fee: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
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
                <NumericFormat name="broker_fee" className="form-control" value={form.broker_fee || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] broker_fee changed:', value);
                  setForm(prev => ({ ...prev, broker_fee: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Broker Fee Percentage</label>
                <NumericFormat name="broker_fee_percentage" className="form-control" value={form.broker_fee_percentage || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] broker_fee_percentage changed:', value);
                  setForm(prev => ({ ...prev, broker_fee_percentage: Number(value || 0) }));
                }} decimalScale={2} suffix="%" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Transaction Management Fee</label>
                <NumericFormat name="transaction_management_fee" className="form-control" value={form.transaction_management_fee || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] transaction_management_fee changed:', value);
                  setForm(prev => ({ ...prev, transaction_management_fee: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* 6. LOAN SUMMRY */}
        <div className="row mb-4">
          <div className="col-12"><h5 className="fw-bold text-primary mb-3">6. LOAN SUMARY</h5></div>
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">TOTAL LOAN AMOUNT (subject to appraisal value)</label>
                <NumericFormat name="total_loan_amount" className="form-control" value={form.total_loan_amount || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] total_loan_amount changed:', value);
                  setForm(prev => ({ ...prev, total_loan_amount: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">LOAN AMOUNT</label>
                <NumericFormat name="loan_amount" className="form-control" value={form.loan_amount || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, loan_amount: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">ANNUAL INTEREST RATE (*)</label>
                <NumericFormat name="annual_interest_rate" className="form-control" value={form.annual_interest_rate || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, annual_interest_rate: Number(value || 0) }))} decimalScale={2} suffix="%" disabled={!editable} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">REQUESTED LEVERAGE</label>
                <NumericFormat name="requested_leverage" className="form-control" value={form.requested_leverage || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] requested_leverage changed:', value);
                  setForm(prev => ({ ...prev, requested_leverage: Number(value || 0) }));
                }} decimalScale={2} suffix="%" disabled={!editable} />
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
                <NumericFormat name="loan_to_as_is_value" className="form-control" value={form.loan_to_as_is_value || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] loan_to_as_is_value changed:', value);
                  setForm(prev => ({ ...prev, loan_to_as_is_value: Number(value || 0) }));
                }} decimalScale={2} suffix="%" disabled={!editable} />
                {console.log('[FixflipConstruction] loan_to_as_is_value field RENDER:', {
                  formValue: form.loan_to_as_is_value,
                  formValueType: typeof form.loan_to_as_is_value,
                  editable: editable,
                  disabled: !editable,
                  displayValue: form.loan_to_as_is_value || 0
                })}
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
                <NumericFormat name="min_credit_score" className="form-control" value={form.min_credit_score || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] min_credit_score changed:', value);
                  setForm(prev => ({ ...prev, min_credit_score: Number(value || 0) }));
                }} disabled={!editable} />
                {console.log('[FixflipConstruction] min_credit_score field RENDER:', {
                  formValue: form.min_credit_score,
                  formValueType: typeof form.min_credit_score,
                  editable: editable,
                  disabled: !editable,
                  displayValue: form.min_credit_score || 0
                })}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">REFUNDABLE COMMITMENT DEPOSIT</label>
                <NumericFormat name="refundable_commitment_deposit" className="form-control" value={form.refundable_commitment_deposit || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] refundable_commitment_deposit changed:', value);
                  setForm(prev => ({ ...prev, refundable_commitment_deposit: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
                {console.log('[FixflipConstruction] refundable_commitment_deposit field RENDER:', {
                  formValue: form.refundable_commitment_deposit,
                  formValueType: typeof form.refundable_commitment_deposit,
                  editable: editable,
                  disabled: !editable,
                  displayValue: form.refundable_commitment_deposit || 0
                })}
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
                <NumericFormat name="estimated_closing_costs" className="form-control" value={form.estimated_closing_costs || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] estimated_closing_costs changed:', value);
                  setForm(prev => ({ ...prev, estimated_closing_costs: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
                {console.log('[FixflipConstruction] estimated_closing_costs field RENDER:', {
                  formValue: form.estimated_closing_costs,
                  formValueType: typeof form.estimated_closing_costs,
                  editable: editable,
                  disabled: !editable,
                  displayValue: form.estimated_closing_costs || 0
                })}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">10% of Construction Budget</label>
                <NumericFormat name="construction_budget_10_percent" className="form-control" value={form.construction_budget_10_percent || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] construction_budget_10_percent changed:', value);
                  setForm(prev => ({ ...prev, construction_budget_10_percent: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
                {console.log('[FixflipConstruction] construction_budget_10_percent field RENDER:', {
                  formValue: form.construction_budget_10_percent,
                  formValueType: typeof form.construction_budget_10_percent,
                  editable: editable,
                  disabled: !editable,
                  displayValue: form.construction_budget_10_percent || 0
                })}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">6 months payment reserves</label>
                <NumericFormat name="six_months_payment_reserves" className="form-control" value={form.six_months_payment_reserves || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] six_months_payment_reserves changed:', value);
                  setForm(prev => ({ ...prev, six_months_payment_reserves: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
                {console.log('[FixflipConstruction] six_months_payment_reserves field RENDER:', {
                  formValue: form.six_months_payment_reserves,
                  formValueType: typeof form.six_months_payment_reserves,
                  editable: editable,
                  disabled: !editable,
                  displayValue: form.six_months_payment_reserves || 0
                })}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Construction budget delta</label>
                <NumericFormat name="construction_budget_delta" className="form-control" value={form.construction_budget_delta || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] construction_budget_delta changed:', value);
                  setForm(prev => ({ ...prev, construction_budget_delta: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
                {console.log('[FixflipConstruction] construction_budget_delta field RENDER:', {
                  formValue: form.construction_budget_delta,
                  formValueType: typeof form.construction_budget_delta,
                  editable: editable,
                  disabled: !editable,
                  displayValue: form.construction_budget_delta || 0
                })}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Down Payment Total</label>
                <NumericFormat name="down_payment" className="form-control" value={form.down_payment || 0} onValueChange={({ value }) => {
                  console.log('[FixflipConstruction] down_payment changed:', value);
                  setForm(prev => ({ ...prev, down_payment: Number(value || 0) }));
                }} thousandSeparator="," prefix="$" disabled={!editable} />
                {console.log('[FixflipConstruction] down_payment field RENDER:', {
                  formValue: form.down_payment,
                  formValueType: typeof form.down_payment,
                  editable: editable,
                  disabled: !editable,
                  displayValue: form.down_payment || 0
                })}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Total Liquidity</label>
                <NumericFormat name="total_liquidity" className="form-control" value={form.total_liquidity || 0} onValueChange={({ value }) => setForm(prev => ({ ...prev, total_liquidity: Number(value || 0) }))} thousandSeparator="," prefix="$" disabled={!editable} />
              </div>
            </div>
          </div>
        </div>

        {/* CAMPOS DEL SISTEMA */}
        {/* <div className="row mb-4">
          <div className="col-12">
            <h5 className="fw-bold text-primary mb-3">
              <i className="fas fa-cogs me-2"></i>
              Campos del Sistema
            </h5>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                name="borrower_signed"
                className="form-check-input"
                checked={form.borrower_signed}
                onChange={handleChange}
              />
              <label className="form-check-label fw-bold">Prestatario Firmó</label>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                name="guarantor_signed"
                className="form-check-input"
                checked={form.guarantor_signed}
                onChange={handleChange}
              />
              <label className="form-check-label fw-bold">Garante Firmó</label>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                name="is_signed"
                className="form-check-input"
                checked={form.is_signed}
                onChange={handleChange}
              />
              <label className="form-check-label fw-bold">Documento Firmado</label>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                name="is_approved"
                className="form-check-input"
                checked={form.is_approved}
                onChange={handleChange}
              />
              <label className="form-check-label fw-bold">Aprobado</label>
            </div>
          </div>
        </div> */}

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
                  Guardar Carta de Intención {type === 'construction' ? 'Construction' : 'Fixflip'}
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

export default FixflipConstructionForm;
