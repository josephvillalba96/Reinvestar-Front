import React, { useEffect, useState, useRef } from 'react';
import styles from './style.module.css';
import {
  createIntentLetter,
  getIntentLetters,
  uploadIntentLetterFile,
  updateIntentLetterStatus,
  getIntentLettersByRequest,
  updateIntentLetter,
} from '../../../../../Api/intentLetters';
import { generateDocument } from '../../../../../Api/documentGeneration';
import DscrIntentionForm from './DscrIntentionForm';
import FixflipConstructionForm from './FixflipConstructionForm';
import ConstructionIntentionForm from './ConstructionIntentionForm';

const IntentionLetter = ({ requestId, requestType, solicitud }) => {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [intentLetter, setIntentLetter] = useState(null);
  const [file, setFile] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const formRef = useRef(null);

  // Estados válidos para mostrar la carta de intención (basado en StatusEnum)
  const validStates = [
    'PRICING',         // En Pricing
    'ACCEPTED',        // Aceptada
    'REJECTED',        // Rechazada
    'CANCELLED',       // Cancelada
    'CLOSED'          // Cerrada
  ];

  // Verificar si el estado actual permite mostrar la carta de intención
  const shouldShowIntentionLetter = () => {
    if (!solicitud?.status) {
      console.log('IntentionLetter: No status found');
      return false;
    }

    const currentStatus = solicitud.status.toString().toUpperCase();
    const isValid = validStates.includes(currentStatus);

    console.log('IntentionLetter: Status check:', {
      currentStatus,
      isValid,
      validStates
    });

    return isValid;
  };

  // Función para obtener el mensaje según el estado
  const getStatusMessage = () => {
    if (!solicitud?.status) return "Estado no definido";
    
    const status = solicitud.status.toString().toUpperCase();
    
    switch (status) {
      case 'PRICING':
        return "La solicitud está en proceso de determinación de tasa y condiciones.";
      case 'ACCEPTED':
        return "La solicitud ha sido aprobada y está lista para generar la carta de intención.";
      case 'REJECTED':
        return "La solicitud no cumple con los requisitos, pero puede generar una carta de intención.";
      case 'CANCELLED':
        return "La solicitud ha sido cancelada por el cliente.";
      case 'CLOSED':
        return "El proceso ha finalizado, puede generar la carta de intención final.";
      default:
        return `Estado actual: ${solicitud.status}`;
    }
  };

  // Si no se debe mostrar la carta de intención, retornar null
  if (!shouldShowIntentionLetter()) {
    return null;
  }

  // Utils de conversión segura
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
  const n = (v) => {
    if (v === undefined || v === null || v === "") return 0;
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
  };
  const s = (v) => (v === undefined || v === null ? "" : String(v));
  const b = (v) => Boolean(v);

  // Payload base con todos los campos del esquema
  const buildEmptyPayload = (tipo, requestId, title, content) => ({
    title: s(title),
    content: s(content),
    description: "",
    loan_amount: 0,
    interest_rate: 0,
    loan_term: 0,
    closing_costs: 0,
    tipo: s(tipo),
    request_id: Number(requestId),
    radicado: "",
    property_type: "",
    property_address: "",
    property_city: "",
    property_state: "",
    property_zip: "",
    fico: 0,
    // Campos de dirección
    street_address: "",
    city: "",
    state: "",
    zip: "",
    lived_less_than_2_years: false,
    previous_street_address: "",
    previous_city: "",
    previous_state: "",
    previous_zip: "",
    rent_amount: 0,
    appraisal_value: 0,
    ltv_request: 0,
    residency_status: "",
    prepayment_penalty: 0,
    prepayment_penalty_type: "",
    interest_rate_structure: "",
    discount_points: 0,
    origination_fee_percentage: 0,
    origination_fee_amount: 0,
    prop_taxes: 0,
    hoi: 0,
    hoa: 0,
    flood_insurance: 0,
    payoff_amount: 0,
    dscr_ratio: 0,
    mortgage_payment_piti: 0,
    closing_cost_estimated: 0,
    subject_prop_under_llc: "",
    down_payment: 0,
    reserves_6_months: 0,
    borrower_name: "",
    guarantor_name: "",
    legal_status: "",
    entity_name: "",
    issued_date: null,
    estimated_closing_date: null,
    estimated_fico_score: 0,
    loan_type: "",
    type_of_program: "",
    cash_out: 0,
    dscr_required: false,
    dscr_flag: false,
    closing_cost_approx: 0,
    total_closing_cost_estimated: 0,
    service_fee: 0,
    title_fees: 0,
    government_fees: 0,
    escrow_tax_insurance: 0,
    appraisal_fee: 0,
    type_of_transaction: "",
    primary_own_or_rent: "",
    mortgage_late_payments: "",
    property_units: 0,
    borrower_signed: false,
    guarantor_signed: false,
    property_value: 0,
    ltv: 0,
    purchase_price: 0,
    renovation_cost: 0,
    after_repair_value: 0,
    renovation_timeline: "",
    contractor_info: "",
    rehab_budget: 0,
    total_project_cost: 0,
    ltc: 0,
    construction_type: "",
    draw_schedule: "",
    inspection_frequency: "",
    rehab_timeline: "",
    scope_of_work: "",
    permits_required: false,
    timeline: "",
    appraisal_required: false,
    title_insurance: false,
    borrower_experience: "",
    exit_strategy: "",
    purchase_type: "",
    refinance_type: "",
    cash_out_amount: 0,
    origination_fee: 0,
    underwriting_fee: 0,
    processing_fee: 0,
    legal_fee: 0,
    total_closing_costs: 0,
    insurance: 0,
    property_taxes: 0,
    utilities: 0,
    maintenance: 0,
    cash_reserves: 0,
    bank_statements_required: false,
    proof_of_funds: "",
    construction_cost: 0,
    land_cost: 0,
    construction_timeline: "",
    permits_status: "",
    loan_purpose: "",
    payment_type: "",
    loan_position: "",
    prepayment_terms: "",
    monthly_payment: 0,
    total_interest: 0,
    total_loan_cost: 0,
    file_path: "",
    is_signed: false,
    signature_data: "",
    is_approved: false,
  });

  const buildPayloadFromSolicitud = (tipo, requestId, solicitud, title, content) => {
    const base = buildEmptyPayload(tipo, requestId, title, content);
    if (!solicitud) return base;

    console.log(`[IntentionLetter] Mapeando datos de solicitud ${tipo} #${requestId}:`, {
      fico: solicitud.fico,
      estimated_fico_score: solicitud.estimated_fico_score,
      fico_score: solicitud.fico_score,
      street_address: solicitud.street_address,
      city: solicitud.city,
      state: solicitud.state,
      zip: solicitud.zip,
      lived_less_than_2_years: solicitud.lived_less_than_2_years,
      previous_street_address: solicitud.previous_street_address,
      previous_city: solicitud.previous_city,
      previous_state: solicitud.previous_state,
      previous_zip: solicitud.previous_zip
    });

    // Comunes (si existen)
    base.property_type = s(solicitud.property_type);
    base.property_address = s(solicitud.property_address);
    base.property_city = s(solicitud.property_city);
    base.property_state = s(solicitud.property_state);
    base.property_zip = s(solicitud.property_zip || solicitud.property_zip_code);
    base.property_value = n(solicitud.property_value);

    // Campos de FICO y dirección que deben mapearse para todos los tipos
    const ficoValue = solicitud.fico || solicitud.estimated_fico_score || solicitud.fico_score;
    const estimatedFicoValue = solicitud.estimated_fico_score || solicitud.fico || solicitud.fico_score;
    
    console.log(`[IntentionLetter] Mapeando FICO para ${tipo}:`, {
      solicitud_fico: solicitud.fico,
      solicitud_estimated_fico_score: solicitud.estimated_fico_score,
      solicitud_fico_score: solicitud.fico_score,
      ficoValue: ficoValue,
      estimatedFicoValue: estimatedFicoValue,
      base_fico: n(ficoValue),
      base_estimated_fico_score: n(estimatedFicoValue)
    });
    
    base.fico = n(ficoValue);
    base.estimated_fico_score = n(estimatedFicoValue);
    base.street_address = s(solicitud.street_address);
    base.city = s(solicitud.city);
    base.state = s(solicitud.state);
    base.zip = s(solicitud.zip);
    base.lived_less_than_2_years = b(solicitud.lived_less_than_2_years);
    base.previous_street_address = s(solicitud.previous_street_address);
    base.previous_city = s(solicitud.previous_city);
    base.previous_state = s(solicitud.previous_state);
    base.previous_zip = s(solicitud.previous_zip);

    // Tipos
    if (tipo === 'dscr') {
      base.borrower_name = s(solicitud.borrower_name);
      base.guarantor_name = s(solicitud.guarantor_name);
      base.legal_status = s(solicitud.legal_status);
      base.residency_status = s(solicitud.legal_status);
      base.entity_name = s(solicitud.entity_name);
      base.issued_date = toISOOrNull(solicitud.issued_date);
      base.estimated_closing_date = toISOOrNull(solicitud.estimated_closing_date);
      base.fico = n(solicitud.fico);
      base.rent_amount = n(solicitud.rent_amount);
      base.appraisal_value = n(solicitud.appraisal_value);
      base.loan_amount = n(solicitud.loan_amount);
      base.loan_term = n(solicitud.loan_term);
      base.interest_rate = n(solicitud.interest_rate);
      base.ltv_request = n(solicitud.ltv_request);
      base.interest_rate_structure = s(solicitud.interest_rate_structure);
      base.discount_points = n(solicitud.discount_points);
      base.origination_fee_percentage = n(solicitud.origination_fee_percentage);
      base.origination_fee_amount = n(solicitud.origination_fee_amount);
      base.prop_taxes = n(solicitud.prop_taxes);
      base.hoi = n(solicitud.hoi);
      base.hoa = n(solicitud.hoa);
      base.flood_insurance = n(solicitud.flood_insurance);
      base.payoff_amount = n(solicitud.payoff_amount);
      base.dscr_ratio = n(solicitud.dscr_ratio);
      base.mortgage_payment_piti = n(solicitud.mortgage_payment_piti);
      base.closing_cost_estimated = n(solicitud.closing_cost_estimated);
      base.subject_prop_under_llc = s(solicitud.subject_prop_under_llc);
      base.down_payment = n(solicitud.down_payment);
      base.reserves_6_months = n(solicitud.reserves_6_months);
      base.type_of_program = s(solicitud.type_of_program);
      base.cash_out = n(solicitud.cash_out);
      base.dscr_required = b(solicitud.dscr_required);
      base.dscr_flag = b(solicitud.dscr_flag);
      base.closing_cost_approx = n(solicitud.closing_cost_approx);
      base.total_closing_cost_estimated = n(solicitud.total_closing_cost_estimated);
      base.service_fee = n(solicitud.service_fee);
      base.title_fees = n(solicitud.title_fees);
      base.government_fees = n(solicitud.government_fees);
      base.escrow_tax_insurance = n(solicitud.escrow_tax_insurance);
      base.appraisal_fee = n(solicitud.appraisal_fee);
      base.type_of_transaction = s(solicitud.type_of_transaction);
      base.primary_own_or_rent = s(solicitud.primary_own_or_rent);
      base.mortgage_late_payments = s(solicitud.mortgage_late_payments);
      base.property_units = n(solicitud.property_units);
      // Campos derivados razonables
      base.property_value = base.property_value || n(solicitud.appraisal_value);
      base.ltv = n(solicitud.ltv_request);
      base.closing_costs = base.total_closing_cost_estimated || base.closing_cost_estimated;
      base.loan_type = s(solicitud.loan_type);
    } else if (tipo === 'fixflip' || tipo === 'construction') {
      // Campos base comunes en Fixflip/Construction
      base.loan_amount = n(solicitud.loan_amount);
      base.interest_rate = n(solicitud.interest_rate);
      base.loan_term = n(solicitud.loan_term);
      base.loan_type = s(solicitud.loan_type);
      base.loan_purpose = s(solicitud.loan_purpose);
      base.payment_type = s(solicitud.payment_type);
      base.loan_position = s(solicitud.loan_position);
      base.prepayment_terms = s(solicitud.prepayment_terms);
      
      // Campos específicos de borrower para Fixflip/Construction
      base.borrower_name = s(solicitud.borrower_name);
      base.guarantor_name = s(solicitud.guarantor_name);
      base.legal_status = s(solicitud.legal_status);
      base.residency_status = s(solicitud.legal_status);
      base.entity_name = s(solicitud.entity_name);
      base.issued_date = toISOOrNull(solicitud.issued_date);
      base.estimated_closing_date = toISOOrNull(solicitud.estimated_closing_date);
      
      // FICO Score específico para Fixflip/Construction
      const fixflipFicoValue = solicitud.fico || solicitud.estimated_fico_score || solicitud.fico_score;
      const fixflipEstimatedFicoValue = solicitud.estimated_fico_score || solicitud.fico || solicitud.fico_score;
      
      console.log(`[IntentionLetter] Mapeando FICO específico para ${tipo}:`, {
        solicitud_fico: solicitud.fico,
        solicitud_estimated_fico_score: solicitud.estimated_fico_score,
        solicitud_fico_score: solicitud.fico_score,
        fixflipFicoValue: fixflipFicoValue,
        fixflipEstimatedFicoValue: fixflipEstimatedFicoValue,
        base_fico: n(fixflipFicoValue),
        base_estimated_fico_score: n(fixflipEstimatedFicoValue)
      });
      
      base.fico = n(fixflipFicoValue);
      base.estimated_fico_score = n(fixflipEstimatedFicoValue);

      base.purchase_price = n(solicitud.purchase_price);
      base.renovation_cost = n(solicitud.renovation_cost);
      base.after_repair_value = n(solicitud.after_repair_value);
      base.ltv = n(solicitud.ltv);

      base.rehab_budget = n(solicitud.rehab_budget);
      base.total_project_cost = n(solicitud.total_project_cost);
      base.ltc = n(solicitud.ltc);
      base.construction_type = s(solicitud.construction_type);
      base.draw_schedule = s(solicitud.draw_schedule);
      base.inspection_frequency = s(solicitud.inspection_frequency);
      base.renovation_timeline = s(solicitud.renovation_timeline);
      base.rehab_timeline = s(solicitud.rehab_timeline);
      
      // Campos específicos de Fixflip que faltaban
      base.land_acquisition_cost = n(solicitud.land_acquisition_cost);
      base.construction_rehab_budget = n(solicitud.construction_rehab_budget);
      base.total_cost = n(solicitud.total_cost);
      base.estimated_after_completion_value = n(solicitud.estimated_after_completion_value);
      base.as_is_value = n(solicitud.as_is_value);
      base.original_acquisition_price = n(solicitud.original_acquisition_price);
      base.construction_holdback = n(solicitud.construction_holdback);
      base.initial_funding = n(solicitud.initial_funding);
      base.day1_monthly_interest_payment = n(solicitud.day1_monthly_interest_payment);
      base.interest_reserves = n(solicitud.interest_reserves);
      base.loan_to_as_is_value = n(solicitud.loan_to_as_is_value);
      base.loan_to_as_is_value_ltv = n(solicitud.loan_to_as_is_value_ltv);
      base.loan_to_cost_ltc = n(solicitud.loan_to_cost_ltc);
      base.loan_to_arv = n(solicitud.loan_to_arv);
      base.rehab_category = s(solicitud.rehab_category);
      base.min_credit_score = n(solicitud.min_credit_score);
      base.refundable_commitment_deposit = n(solicitud.refundable_commitment_deposit);
      base.estimated_closing_costs = n(solicitud.estimated_closing_costs);
      base.construction_budget_10_percent = n(solicitud.construction_budget_10_percent);
      base.six_months_payment_reserves = n(solicitud.six_months_payment_reserves);
      base.construction_budget_delta = n(solicitud.construction_budget_delta);
      base.down_payment = n(solicitud.down_payment);
      base.total_liquidity = n(solicitud.total_liquidity);
      
      // Fees específicos de Fixflip
      base.origination_fee = n(solicitud.origination_fee);
      base.underwriting_fee = n(solicitud.underwriting_fee);
      base.processing_fee = n(solicitud.processing_fee);
      base.servicing_fee = n(solicitud.servicing_fee);
      base.legal_fee = n(solicitud.legal_fee);
      base.appraisal_fee = n(solicitud.appraisal_fee);
      base.budget_review_fee = n(solicitud.budget_review_fee);
      base.broker_fee = n(solicitud.broker_fee);
      base.transaction_management_fee = n(solicitud.transaction_management_fee);
      
      // Loan details específicos de Fixflip
      base.total_loan_amount = n(solicitud.total_loan_amount);
      base.annual_interest_rate = n(solicitud.annual_interest_rate);
      base.requested_leverage = n(solicitud.requested_leverage);
      base.monthly_interest_payment = n(solicitud.monthly_interest_payment);
      base.prepayment_penalty = n(solicitud.prepayment_penalty);
      base.max_ltv = n(solicitud.max_ltv);
      base.max_ltc = n(solicitud.max_ltc);
      
      // Address Information para Fixflip
      base.street_address = s(solicitud.street_address);
      base.city = s(solicitud.city);
      base.state = s(solicitud.state);
      base.zip = s(solicitud.zip);
      base.lived_less_than_2_years = Boolean(solicitud.lived_less_than_2_years);
      base.previous_street_address = s(solicitud.previous_street_address);
      base.previous_city = s(solicitud.previous_city);
      base.previous_state = s(solicitud.previous_state);
      base.previous_zip = s(solicitud.previous_zip);
      
      // Property Information para Fixflip
      base.property_type = s(solicitud.property_type);
      base.property_address = s(solicitud.property_address);
      
      // Loan Information para Fixflip
      base.interest_rate_structure = s(solicitud.interest_rate_structure);
      base.closing_date = toISOOrNull(solicitud.closing_date);
      
      console.log(`[IntentionLetter] Mapeando campos específicos de Fixflip:`, {
        land_acquisition_cost: solicitud.land_acquisition_cost,
        construction_rehab_budget: solicitud.construction_rehab_budget,
        total_cost: solicitud.total_cost,
        estimated_after_completion_value: solicitud.estimated_after_completion_value,
        as_is_value: solicitud.as_is_value,
        total_loan_amount: solicitud.total_loan_amount,
        annual_interest_rate: solicitud.annual_interest_rate,
        fico_score: solicitud.fico_score
      });
      base.contractor_info = s(solicitud.contractor_info);
      
      base.monthly_payment = n(solicitud.monthly_payment);
      base.total_interest = n(solicitud.total_interest);
      base.total_loan_cost = n(solicitud.total_loan_cost);

      base.scope_of_work = s(solicitud.scope_of_work);
      base.permits_required = b(solicitud.permits_required);
      base.timeline = s(solicitud.timeline);
      base.appraisal_required = b(solicitud.appraisal_required);
      base.title_insurance = b(solicitud.title_insurance);
      base.borrower_experience = s(solicitud.borrower_experience);
      base.exit_strategy = s(solicitud.exit_strategy);
      base.purchase_type = s(solicitud.purchase_type);
      base.refinance_type = s(solicitud.refinance_type);
      base.cash_out_amount = n(solicitud.cash_out_amount);
      
      base.origination_fee = n(solicitud.origination_fee);
      base.underwriting_fee = n(solicitud.underwriting_fee);
      base.processing_fee = n(solicitud.processing_fee);
      base.legal_fee = n(solicitud.legal_fee);
      base.total_closing_costs = n(solicitud.total_closing_costs);
      
      base.insurance = n(solicitud.insurance);
      base.property_taxes = n(solicitud.property_taxes);
      base.utilities = n(solicitud.utilities);
      base.maintenance = n(solicitud.maintenance);
      base.cash_reserves = n(solicitud.cash_reserves);
      
      base.bank_statements_required = b(solicitud.bank_statements_required);
      base.proof_of_funds = s(solicitud.proof_of_funds);
      
      // Derivados razonables
      base.property_value = base.property_value || n(solicitud.property_value || solicitud.after_repair_value || solicitud.purchase_price);
      base.closing_costs = base.total_closing_costs;

      if (tipo === 'construction') {
        // Campos específicos de Construction
        base.construction_timeline = s(solicitud.construction_timeline);
        base.permits_status = s(solicitud.permits_status);
        base.construction_cost = n(solicitud.construction_cost);
        base.land_cost = n(solicitud.land_cost);
        
        // Campos adicionales de Construction
        base.land_acquisition_cost = n(solicitud.land_acquisition_cost);
        base.construction_rehab_budget = n(solicitud.construction_rehab_budget);
        base.total_cost = n(solicitud.total_cost);
        base.estimated_after_completion_value = n(solicitud.estimated_after_completion_value);
        base.as_is_value = n(solicitud.as_is_value);
        base.original_acquisition_price = n(solicitud.original_acquisition_price);
        base.construction_holdback = n(solicitud.construction_holdback);
        base.initial_funding = n(solicitud.initial_funding);
        base.day1_monthly_interest_payment = n(solicitud.day1_monthly_interest_payment);
        base.interest_reserves = n(solicitud.interest_reserves);
        base.loan_to_as_is_value = n(solicitud.loan_to_as_is_value);
        base.loan_to_as_is_value_ltv = n(solicitud.loan_to_as_is_value_ltv);
        base.loan_to_cost_ltc = n(solicitud.loan_to_cost_ltc);
        base.loan_to_arv = n(solicitud.loan_to_arv);
        base.rehab_category = s(solicitud.rehab_category);
        base.min_credit_score = n(solicitud.min_credit_score);
        base.refundable_commitment_deposit = n(solicitud.refundable_commitment_deposit);
        base.estimated_closing_costs = n(solicitud.estimated_closing_costs);
        base.construction_budget_10_percent = n(solicitud.construction_budget_10_percent);
        base.six_months_payment_reserves = n(solicitud.six_months_payment_reserves);
        base.construction_budget_delta = n(solicitud.construction_budget_delta);
        base.total_liquidity = n(solicitud.total_liquidity);
        
        // Fees específicos de Construction
        base.origination_fee = n(solicitud.origination_fee);
        base.underwriting_fee = n(solicitud.underwriting_fee);
        base.processing_fee = n(solicitud.processing_fee);
        base.servicing_fee = n(solicitud.servicing_fee);
        base.legal_fee = n(solicitud.legal_fee);
        base.appraisal_fee = n(solicitud.appraisal_fee);
        base.budget_review_fee = n(solicitud.budget_review_fee);
        base.broker_fee = n(solicitud.broker_fee);
        base.transaction_management_fee = n(solicitud.transaction_management_fee);
        
        // Loan details específicos de Construction
        base.total_loan_amount = n(solicitud.total_loan_amount);
        base.annual_interest_rate = n(solicitud.annual_interest_rate);
        base.requested_leverage = n(solicitud.requested_leverage);
        base.monthly_interest_payment = n(solicitud.monthly_interest_payment);
        base.prepayment_penalty = n(solicitud.prepayment_penalty);
        base.max_ltv = n(solicitud.max_ltv);
        base.max_ltc = n(solicitud.max_ltc);
        
        console.log(`[IntentionLetter] Mapeando campos específicos de Construction:`, {
          land_acquisition_cost: solicitud.land_acquisition_cost,
          construction_rehab_budget: solicitud.construction_rehab_budget,
          total_cost: solicitud.total_cost,
          estimated_after_completion_value: solicitud.estimated_after_completion_value,
          construction_holdback: solicitud.construction_holdback,
          total_loan_amount: solicitud.total_loan_amount,
          annual_interest_rate: solicitud.annual_interest_rate
        });
      }
    }

    return base;
  };

  const buildParamsByType = () => {
    const params = { skip: 0, limit: 1 };
    if (requestType === 'dscr') params.dscr_request_id = Number(requestId);
    if (requestType === 'fixflip') params.fixflip_request_id = Number(requestId);
    if (requestType === 'construction') params.construction_request_id = Number(requestId);
    return params;
  };

  const buildCreatePayload = () => buildPayloadFromSolicitud(requestType, requestId, solicitud, title, content);

  const loadIntentLetter = async () => {
    try {
      console.log('Cargando carta de intención:', { requestType, requestId });
      
      // 1) Consultar primero por tipo e ID de solicitud usando el nuevo endpoint
      if (requestType && requestId) {
        try {
      const byReq = await getIntentLettersByRequest(String(requestType), Number(requestId));
          console.log('Respuesta de getIntentLettersByRequest:', byReq);
      
      if (Array.isArray(byReq) && byReq.length > 0) {
        const found = byReq[0];
            console.log('Carta encontrada:', found);
            setIntentLetter(found);
            if (found?.title) setTitle(found.title);
            if (found?.content) setContent(found.content);
            return;
          } else {
            console.log('No se encontró carta de intención');
          }
        } catch (inner) {
          console.error('Error en getIntentLettersByRequest:', inner);
          // Si falla, continuamos con el método genérico
        }
      }

      // 2) Fallback: usar el listado genérico (mantener compatibilidad)
      const data = await getIntentLetters(buildParamsByType());
      if (Array.isArray(data) && data.length > 0) {
        const found = data[0];
        setIntentLetter(found);
        if (found?.title) setTitle(found.title);
        if (found?.content) setContent(found.content);
      } else if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
        const found = data.items[0];
        setIntentLetter(found);
        if (found?.title) setTitle(found.title);
        if (found?.content) setContent(found.content);
      } else {
        setIntentLetter(null);
      }
    } catch (e) {
      console.error('Error cargando carta de intención:', e);
    }
  };

  useEffect(() => {
    console.log('IntentionLetter useEffect:', { requestId, requestType, solicitud });
    
    if (requestId && requestType) {
      loadIntentLetter();
      const suggestedTitle = `Carta de Intención - ${String(requestType).toUpperCase()} #${requestId}`;
      const suggestedContent = `Estimado cliente,\n\nPor medio de la presente dejamos constancia de la intención de proceder con el estudio de su solicitud ${String(requestType).toUpperCase()} #${requestId}. Esta carta no constituye un compromiso final de financiamiento y está sujeta a verificación de documentos, evaluación de riesgos y aprobación final.\n\nAtentamente,\nReInvestar`;
      setTitle((prev) => prev || suggestedTitle);
      setContent((prev) => prev || suggestedContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, requestType]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      const payload = {
        ...formData,
        title: title || `Carta de Intención - ${String(requestType).toUpperCase()} #${requestId}`,
        content: content || `Carta de Intención generada para la solicitud ${String(requestType).toUpperCase()} #${requestId}.`,
        tipo: requestType,
        request_id: Number(requestId)
      };

      let response;
      if (intentLetter?.id) {
        // Actualizar carta existente (PUT)
        response = await updateIntentLetter(intentLetter.id, payload);
        setFeedback("Carta de intención actualizada exitosamente");
      } else {
        // Crear nueva carta
        response = await createIntentLetter(payload);
        setFeedback("Carta de intención generada exitosamente");
      }
      
      setIntentLetter(response);
      return response; // Retornar la respuesta para que el componente hijo pueda manejar el éxito
    } catch (error) {
      console.error('Error con la carta de intención:', error);
      const detail = error?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map(d => d?.msg || JSON.stringify(d)).join(' | ')
        : (typeof detail === 'string' ? detail : (error.message || 'Error al procesar la carta de intención'));
      setError(message);
      throw error; // Re-lanzar el error para que el componente hijo pueda manejarlo
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!window.confirm("¿Estás seguro de generar la carta de intención?")) {
      return;
    }
    
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      // Crear la carta automáticamente con los datos de la solicitud
      const payload = buildCreatePayload();
      console.log('Creando carta de intención automáticamente:', payload);
      
      const response = await createIntentLetter(payload);
      setIntentLetter(response);
      setFeedback("Carta de intención creada exitosamente");
      
      // Hacer scroll al formulario después de crear
      setTimeout(() => {
        handleFocusForm();
      }, 500);
      
    } catch (error) {
      console.error('Error creando carta de intención:', error);
      const detail = error?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map(d => d?.msg || JSON.stringify(d)).join(' | ')
        : detail || error?.message || 'Error desconocido';
      setError(`Error al crear la carta: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLetter = async () => {
    setDownloading(true);
    setError("");
    setFeedback("");

    try {
      // 1) Intentar generar/descargar desde el servicio oficial (PDF)
      const blob = await generateDocument(String(requestType), Number(requestId));
      if (blob) {
        const fileName = `Carta_Intencion_${String(requestType).toUpperCase()}_${requestId}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setFeedback("Descarga iniciada");
        return;
      }

      // 2) Fallback: si existe una URL de archivo en la carta, abrirla
      if (intentLetter?.file_url) {
        window.open(intentLetter.file_url, '_blank');
        setFeedback("Abriendo carta de intención...");
        return;
      }

      setFeedback("No hay archivo de carta de intención disponible.");
    } catch (error) {
      console.error('Error descargando carta de intención:', error);
      const detail = error?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map(d => d?.msg || JSON.stringify(d)).join(' | ')
        : (typeof detail === 'string' ? detail : (error.message || 'Error al descargar la carta de intención'));
      setError(message);
    } finally {
      setDownloading(false);
    }
  };

  const handleFocusForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async () => {
    if (!intentLetter?.id || !file) return;
    setLoading(true);
    setError("");
    setFeedback("");
    try {
      const updated = await uploadIntentLetterFile(intentLetter.id, file);
      setIntentLetter(updated);
      setFeedback("Archivo de carta de intención subido correctamente");
      setFile(null);
    } catch (e) {
      console.error('Error subiendo archivo de carta de intención:', e);
      const detail = e?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map(d => d?.msg || JSON.stringify(d)).join(' | ')
        : (typeof detail === 'string' ? detail : (e.message || 'Error al subir el archivo'));
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproved = async () => {
    if (!intentLetter?.id) return;
    setUpdatingStatus(true);
    setError("");
    setFeedback("");
    try {
      const next = await updateIntentLetterStatus(intentLetter.id, !intentLetter?.is_approved);
      setIntentLetter(next);
      setFeedback("Estado de aprobación actualizado");
    } catch (e) {
      console.error('Error actualizando estado de carta de intención:', e);
      const detail = e?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map(d => d?.msg || JSON.stringify(d)).join(' | ')
        : (typeof detail === 'string' ? detail : (e.message || 'Error al actualizar el estado'));
      setError(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Encabezado y Botones */}
      <div className="row">
        <div className="col-12 d-flex align-items-center justify-content-between mb-3">
          <h4 className="my_title_color fw-bold mb-0">Carta de Intención</h4>
          <div className="d-flex gap-2">
            {intentLetter ? (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadLetter}
                  disabled={downloading || loading}
                >
                      <i className={`fas ${downloading ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                      {downloading ? 'Descargando...' : 'Descargar Carta'}
                </button>
                
              </>
            ) : (
                  <button
                className="btn btn-primary"
                onClick={handleGenerateLetter}
                disabled={loading || downloading}
              >
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-file-alt'} me-2`}></i>
                {loading ? 'Creando...' : 'Crear Carta de Intención'}
                  </button>
                )}
          </div>
        </div>
              </div>

      {/* Mensaje informativo sobre el estado */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <i className="fas fa-info-circle me-2"></i>
            <div>
              <strong>Carta de Intención Disponible</strong>
              <br />
              {getStatusMessage()}
            </div>
          </div>
                </div>
                </div>

      {/* Formulario */}
      <div ref={formRef} className="row mt-3">
        <div className="col-12">
          {console.log('Estado del formulario:', { solicitud, requestType, intentLetter, loading })}
          {solicitud ? (
            requestType === 'dscr' ? (
              <DscrIntentionForm 
                requestId={Number(requestId)}
                initialData={intentLetter || solicitud || {}}
                onSubmit={handleSubmit}
                loading={loading}
                editable={!intentLetter || intentLetter.status !== 'APPROVED'}
                onUnsavedChangesChange={(hasChanges) => {
                  console.log('Cambios no guardados:', hasChanges);
                }}
              />
            ) : (
              requestType === 'construction' ? (
                <ConstructionIntentionForm
                  requestId={Number(requestId)}
                  initialData={intentLetter || solicitud || {}}
                  onFormChange={() => {}}
                  onSubmit={handleSubmit}
                  loading={loading}
                  editable={!intentLetter || intentLetter.status !== 'APPROVED'}
                  onUnsavedChangesChange={(hasChanges) => {
                    console.log('Cambios no guardados (Construction):', hasChanges);
                  }}
                />
              ) : (
                <FixflipConstructionForm
                  requestId={Number(requestId)}
                  initialData={intentLetter || solicitud || {}}
                  onFormChange={() => {}}
                  onSubmit={handleSubmit}
                  loading={loading}
                  type={String(requestType)}
                  editable={!intentLetter || intentLetter.status !== 'APPROVED'}
                  onUnsavedChangesChange={(hasChanges) => {
                    console.log('Cambios no guardados (Fixflip):', hasChanges);
                  }}
                />
              )
            )
          ) : (
            <div className="text-muted">Cargando datos de la solicitud...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntentionLetter;