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
  editable = true,
  onUnsavedChangesChange
}) => {
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [intentLetter, setIntentLetter] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);

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
    
    // -----LOAN DETAILS ------
    loan_type: "",
    property_type: "",
    closing_date: "",
    interest_rate_structure: "",
    loan_term: 0,
    prepayment_penalty: 0,
    prepayment_penalty_type: "",
    max_ltv: 0,

    //--- LOAN CLOSING COST ESTIMATED ---
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
    appraisal_fee: 0,
    total_closing_cost: 0,

    //--- TYPE OF PROGRAM ---
    closing_cost_approx: 0,
    down_payment_percent: 0,
    dscr_requirement: 0, //DSCR  MUST BE 1%
    
    //--- LOAN SUMMARY ---
    appraisal_value: 0,
    annual_interest_rate: 0,
    rent_amount: 0,
    property_taxes: 0,
    property_insurance: 0,
    hoa_fees: 0,
    flood_insurance: 0,
    pay_off_amount: 0,
    loan_amount: 0,
    cash_out: 0,
    mortgage_payment_piti: 0,
    down_payment:0,

    
    // --- DSCR - PITI ---
    principal_interest: 0,
    property_taxes_estimated: 0,
    property_insurance_estimated: 0,
    flood_insurance_estimated: 0,
    hoa_estimated: 0,

    //--- MINIMUM BORROWER'S LIQUIDITY REQUIREMENTS ---
    down_payment_liquidity: 0,
    closing_cost_liquidity: 0,
    six_months_reserves: 0,
    other_liquidity: 0,
    total_liquidity: 0,
    
    // --- No pertenecen a la carta de intension de una solicitud dscr ---
    issued_date: "",
    client_submitted_at: "",
    origination_fee_percentage: "2.0",
    dscr_ratio: 0,
    dscr_required: false,
    radicado: "",
    status: "PENDING",
    client_submitted: false,
    client_form_completed: false,
    client_id: 0,
    user_id: 0,
    comments: "",
    rejection_reason: "",
    borrower_signed: false,
    guarantor_signed: false,
    property_address: "",
    property_city: "",
    property_state: "",
    property_zip: "",
    property_units: 0,
    type_of_program: "",
    type_of_transaction: "",
    primary_own_or_rent: "",
    mortgage_late_payments: ""
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
      const newFormData = { 
        ...initialData,
        // Asegurar que origination_fee_percentage se maneje correctamente
        origination_fee_percentage: initialData.origination_fee_percentage ? String(initialData.origination_fee_percentage) : "2.0"
      };
      setForm(prev => ({ ...prev, ...newFormData }));
      
      // Establecer los datos originales después de que se complete la carga y cálculos
      setTimeout(() => {
        setOriginalFormData({ ...newFormData });
        console.debug('[DscrIntentionForm] Datos originales establecidos desde initialData:', {
          originalFormDataKeys: Object.keys(newFormData).length,
          sampleFields: {
            borrower_name: newFormData.borrower_name,
            loan_amount: newFormData.loan_amount,
            origination_fee_percentage: newFormData.origination_fee_percentage
          }
        });
      }, 200);
      
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
            const newFormData = {
              ...dscrData,
              // Asegurar que origination_fee_percentage se maneje correctamente
              origination_fee_percentage: dscrData.origination_fee_percentage ? String(dscrData.origination_fee_percentage) : "2.0"
            };
            setForm(prev => ({ ...prev, ...newFormData }));
            
            // Establecer los datos originales después de cargar los datos de la API
            setTimeout(() => {
              setOriginalFormData({ ...newFormData });
              console.debug('[DscrIntentionForm] Datos originales establecidos desde API:', {
                originalFormDataKeys: Object.keys(newFormData).length,
                sampleFields: {
                  borrower_name: newFormData.borrower_name,
                  loan_amount: newFormData.loan_amount,
                  origination_fee_percentage: newFormData.origination_fee_percentage
                }
              });
            }, 200);
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

  // Establecer originalFormData después de que el formulario se estabilice completamente
  useEffect(() => {
    if (form && Object.keys(form).length > 0 && !originalFormData) {
      // Fallback: establecer datos originales si no se han establecido después de un tiempo
      setTimeout(() => {
        if (!originalFormData) {
          setOriginalFormData({ ...form });
          console.debug('[DscrIntentionForm] Datos originales establecidos como fallback:', {
            originalFormDataKeys: Object.keys(form).length,
            sampleFields: {
              borrower_name: form.borrower_name,
              loan_amount: form.loan_amount,
              origination_fee_percentage: form.origination_fee_percentage
            }
          });
        }
      }, 500);
    }
  }, [form, originalFormData]);

  // Detectar cambios no guardados
  useEffect(() => {
    if (originalFormData && Object.keys(originalFormData).length > 0) {
      // Función para normalizar valores antes de comparar
      const normalizeValue = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value;
        return String(value).trim();
      };

      // Comparar campos relevantes uno por uno
      const changedFields = [];
      const hasChanges = Object.keys(form).some(key => {
        const currentValue = normalizeValue(form[key]);
        const originalValue = normalizeValue(originalFormData[key]);
        const isChanged = currentValue !== originalValue;
        
        if (isChanged) {
          changedFields.push({
            field: key,
            current: currentValue,
            original: originalValue
          });
        }
        
        return isChanged;
      });

      console.debug('[DscrIntentionForm] Detección de cambios:', {
        hasChanges,
        changedFields: changedFields.slice(0, 5), // Mostrar solo los primeros 5 campos cambiados
        totalChangedFields: changedFields.length,
        formKeys: Object.keys(form).length,
        originalKeys: Object.keys(originalFormData).length
      });

      setHasUnsavedChanges(hasChanges);
      
      // Notificar al componente padre sobre el cambio de estado
      if (onUnsavedChangesChange) {
        onUnsavedChangesChange(hasChanges);
      }
    }
  }, [form, originalFormData, onUnsavedChangesChange]);

  // Prevenir salida con cambios no guardados
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
      }
    };

    const handlePopState = (e) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?');
        if (!confirmLeave) {
          e.preventDefault();
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberFormat = (name, value) => {
    console.debug('[DscrIntentionForm] handleNumberFormat:', { name, value, type: typeof value });
    
    if (name === 'origination_fee_percentage') {
      console.debug('[DscrIntentionForm] origination_fee_percentage changing:', {
        oldValue: form.origination_fee_percentage,
        oldValueType: typeof form.origination_fee_percentage,
        newValue: value,
        newValueType: typeof value
      });
      
      // Para origination_fee_percentage, mantener como string
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      // Para otros campos numéricos, convertir a número
      setForm(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
    }
  };

  // Recalcular monto de Origination Fee cuando cambia el porcentaje o el loan_amount
  useEffect(() => {
    const pct = Number(form.origination_fee_percentage || 0);
    const amount = Number(form.loan_amount || 0);
    const computed = (amount * pct) / 100;
    
    // Solo recalcular si el usuario no ha editado manualmente el origination_fee
    // y si el valor calculado es diferente al actual
    if (computed > 0 && Number(form.origination_fee) !== computed) {
      console.debug('[DscrIntentionForm] Recalculando origination_fee:', {
        percentage: pct,
        loanAmount: amount,
        computed: computed,
        current: form.origination_fee
      });
      setForm(prev => ({ ...prev, origination_fee: computed }));
    }
  }, [form.origination_fee_percentage, form.loan_amount]);

  // Recalcular Total Closing Cost cuando cambian los campos de closing costs
  useEffect(() => {
    const calculateTotalClosingCost = () => {
      const fields = [
        'origination_fee',
        'discount_points', 
        'underwriting_fee',
        'credit_report_fee',
        'processing_fee',
        'recording_fee',
        'legal_fee',
        'service_fee',
        'title_fees',
        'government_fees',
        'escrow_tax_insurance',
        'appraisal_fee'
      ];
      
      const total = fields.reduce((sum, field) => {
        return sum + Number(form[field] || 0);
      }, 0);
      
      return total;
    };
    
    const newTotal = calculateTotalClosingCost();
    
    if (Number(form.total_closing_cost) !== newTotal) {
      console.debug('[DscrIntentionForm] Recalculando total_closing_cost:', {
        newTotal: newTotal,
        current: form.total_closing_cost
      });
      setForm(prev => ({ ...prev, total_closing_cost: newTotal }));
    }
  }, [
    form.origination_fee,
    form.discount_points,
    form.underwriting_fee,
    form.credit_report_fee,
    form.processing_fee,
    form.recording_fee,
    form.legal_fee,
    form.service_fee,
    form.title_fees,
    form.government_fees,
    form.escrow_tax_insurance,
    form.appraisal_fee
  ]);

  // Recalcular Closing Cost Approx cuando cambian closing_cost_liquidity o loan_amount
  useEffect(() => {
    const closingCostLiquidity = Number(form.closing_cost_liquidity || 0);
    const loanAmount = Number(form.loan_amount || 0);
    
    let newClosingCostApprox = 0;
    if (loanAmount > 0) {
      // Calcular como porcentaje: (closing_cost_liquidity / loan_amount) * 100
      newClosingCostApprox = (closingCostLiquidity / loanAmount) * 100;
    }
    
    if (Number(form.closing_cost_approx) !== newClosingCostApprox) {
      console.debug('[DscrIntentionForm] Recalculando closing_cost_approx:', {
        closingCostLiquidity: closingCostLiquidity,
        loanAmount: loanAmount,
        newClosingCostApprox: newClosingCostApprox,
        current: form.closing_cost_approx
      });
      setForm(prev => ({ ...prev, closing_cost_approx: newClosingCostApprox }));
    }
  }, [form.closing_cost_liquidity, form.loan_amount]);

  const buildDataToSend = () => {
    console.debug('[DscrIntentionForm] buildDataToSend - origination_fee_percentage:', {
      formValue: form.origination_fee_percentage,
      type: typeof form.origination_fee_percentage,
      isInForm: 'origination_fee_percentage' in form
    });

    const payload = {
    // BORROWER INFORMATION
    borrower_name: form.borrower_name || "",
    legal_status: form.legal_status || "",
    property_address: form.property_address || "",
    issued_date: toISOOrNull(form.issued_date),
    fico: Number(form.fico || 0),
    estimated_fico_score: Number(form.estimated_fico_score || 0),
    residency_status: form.residency_status || "",
    subject_prop_under_llc: form.subject_prop_under_llc || "",

    // LOAN DETAILS
    loan_type: form.loan_type || "",
    property_type: form.property_type || "",
    closing_date: toISOOrNull(form.closing_date),
    interest_rate_structure: form.interest_rate_structure || "",
    loan_term: Number(form.loan_term || 0),
    prepayment_penalty: Number(form.prepayment_penalty || 0),
    prepayment_penalty_type: form.prepayment_penalty_type || "",
    max_ltv: Number(form.max_ltv || 0),

    // LOAN CLOSING COST ESTIMATED
    origination_fee: Number(form.origination_fee || 0),
    discount_points: Number(form.discount_points || 0),
    underwriting_fee: Number(form.underwriting_fee || 0),
    credit_report_fee: Number(form.credit_report_fee || 0),
    processing_fee: Number(form.processing_fee || 0),
    recording_fee: Number(form.recording_fee || 0),
    legal_fee: Number(form.legal_fee || 0),
    service_fee: Number(form.service_fee || 0),
    title_fees: Number(form.title_fees || 0),
    government_fees: Number(form.government_fees || 0),
    escrow_tax_insurance: Number(form.escrow_tax_insurance || 0),
    appraisal_fee: Number(form.appraisal_fee || 0),
    total_closing_cost: Number(form.total_closing_cost || 0),

    // TYPE OF PROGRAM
    closing_cost_approx: Number(form.closing_cost_approx || 0),
    down_payment_percent: Number(form.down_payment_percent || 0),
    dscr_requirement: Number(form.dscr_requirement || 0),
    dscr_required: Boolean(form.dscr_required),

    // LOAN SUMMARY
    appraisal_value: Number(form.appraisal_value || 0),
    annual_interest_rate: Number(form.annual_interest_rate || 0),
    rent_amount: Number(form.rent_amount || 0),
    property_taxes: Number(form.property_taxes || 0),
    property_insurance: Number(form.property_insurance || 0),
    hoa_fees: Number(form.hoa_fees || 0),
    flood_insurance: Number(form.flood_insurance || 0),
    pay_off_amount: Number(form.pay_off_amount || 0),
    loan_amount: Number(form.loan_amount || 0),
    cash_out: Number(form.cash_out || 0),
    mortgage_payment_piti: Number(form.mortgage_payment_piti || 0),
    down_payment: Number(form.down_payment || 0),

    // DSCR - PITI
    principal_interest: Number(form.principal_interest || 0),
    property_taxes_estimated: Number(form.property_taxes_estimated || 0),
    property_insurance_estimated: Number(form.property_insurance_estimated || 0),
    flood_insurance_estimated: Number(form.flood_insurance_estimated || 0),
    hoa_estimated: Number(form.hoa_estimated || 0),

    // MINIMUM BORROWER'S LIQUIDITY REQUIREMENTS
    down_payment_liquidity: Number(form.down_payment_liquidity || 0),
    closing_cost_liquidity: Number(form.closing_cost_liquidity || 0),
    six_months_reserves: Number(form.six_months_reserves || 0),
    other_liquidity: Number(form.other_liquidity || 0),
    total_liquidity: Number(form.total_liquidity || 0),

    // Campos adicionales requeridos por el API
    client_id: Number(form.client_id || 0),
    user_id: Number(form.user_id || 0),
    client_submitted: Boolean(form.client_submitted),
    client_form_completed: Boolean(form.client_form_completed),
    client_submitted_at: toISOOrNull(form.client_submitted_at),
    status: form.status || "PENDING",
    comments: form.comments || "",
    rejection_reason: form.rejection_reason || "",
    borrower_signed: Boolean(form.borrower_signed),
    guarantor_signed: Boolean(form.guarantor_signed),
    radicado: form.radicado || "",
    dscr_ratio: Number(form.dscr_ratio || 0),
    // dscr_required: Boolean(form.dscr_required),
          origination_fee_percentage: Number(form.origination_fee_percentage || 2.0),
    
    // Campos adicionales del formulario
    property_city: form.property_city || "",
    property_state: form.property_state || "",
    property_zip: form.property_zip || "",
    property_units: Number(form.property_units || 0),
    type_of_program: form.type_of_program || "",
    type_of_transaction: form.type_of_transaction || "",
    primary_own_or_rent: form.primary_own_or_rent || "",
    mortgage_late_payments: form.mortgage_late_payments || "",
          guarantor_name: form.guarantor_name || "",
      entity_name: form.entity_name || ""
    };

    console.debug('[DscrIntentionForm] buildDataToSend - payload origination_fee_percentage:', {
      payloadValue: payload.origination_fee_percentage,
      payloadType: typeof payload.origination_fee_percentage,
      isInPayload: 'origination_fee_percentage' in payload
    });

    return payload;
  };

  const handleCreateIntentLetter = async () => {
    if (onSubmit) {
      const dataToSend = buildDataToSend();
      try {
        const response = await onSubmit(dataToSend);
        console.debug('[DscrIntentionForm] Carta creada exitosamente:', response);
        
        // Si la creación fue exitosa, establecer los datos originales
        const updatedFormData = { ...form };
        setOriginalFormData(updatedFormData);
        setHasUnsavedChanges(false);
        
        console.debug('[DscrIntentionForm] Estado actualizado después de crear:', {
          hasUnsavedChanges: false,
          originalFormDataUpdated: true
        });
      } catch (error) {
        console.error('Error al crear carta:', error);
        // No resetear el estado si hubo error
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (onSubmit) {
      const dataToSend = buildDataToSend();
      
      console.debug('[DscrIntentionForm] handleSubmit - origination_fee_percentage:', {
        formValue: form.origination_fee_percentage,
        payloadValue: dataToSend.origination_fee_percentage,
        isInPayload: 'origination_fee_percentage' in dataToSend
      });

      try {
        const response = await onSubmit(dataToSend);
        console.debug('[DscrIntentionForm] Guardado exitoso:', response);
        
        // Si el envío fue exitoso, actualizar los datos originales
        const updatedFormData = { ...form };
        setOriginalFormData(updatedFormData);
        setHasUnsavedChanges(false);
        
        console.debug('[DscrIntentionForm] Estado actualizado después de guardar:', {
          hasUnsavedChanges: false,
          originalFormDataUpdated: true
        });
      } catch (error) {
        console.error('Error al guardar:', error);
        // No resetear el estado si hubo error
      }
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm('¿Estás seguro de que quieres descartar todos los cambios?')) {
      setForm(prev => ({ ...prev, ...originalFormData }));
      setHasUnsavedChanges(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* Indicador de cambios no guardados */}
      {hasUnsavedChanges && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between mb-3" role="alert">
          <div className="d-flex align-items-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <span>Tienes cambios sin guardar</span>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleDiscardChanges}
          >
            <i className="fas fa-undo me-1"></i>
            Descartar Cambios
          </button>
        </div>
      )}

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
                  <select
                    name="property_type"
                    className={`form-control ${styles.input}`}
                    value={form.property_type}
                    onChange={handleChange}
                    disabled={!editable}
                  >
                    <option value="">Seleccione...</option>
                    <option value="SFR - D">SFR - D</option>
                    <option value="2-4 UNITS">2-4 UNITS</option>
                    <option value="CONDO">CONDO</option>
                    <option value="PUD">PUD</option>
                  </select>
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
                  <select
                    name="interest_rate_structure"
                    className={`form-control ${styles.input}`}
                    value={form.interest_rate_structure}
                    onChange={handleChange}
                    disabled={!editable}
                  >
                    <option value="">Seleccione...</option>
                    <option value="FIXED">FIXED</option>
                    <option value="ARM">ARM</option>
                    <option value="INTEREST ONLY">INTEREST ONLY</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Loan Term</label>
                  <select
                    name="loan_term"
                    className={`form-control ${styles.input}`}
                    value={form.loan_term}
                    onChange={(e) => handleNumberFormat('loan_term', e.target.value)}
                    disabled={!editable}
                  >
                    <option value={0}>Seleccione...</option>
                    <option value={40}>40 años</option>
                    <option value={30}>30 años</option>
                    <option value={25}>25 años</option>
                    <option value={20}>20 años</option>
                    <option value={15}>15 años</option>
                    <option value={10}>10 años</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Prepayment Penalty</label>
                  <select
                    name="prepayment_penalty"
                    className={`form-control ${styles.input}`}
                    value={form.prepayment_penalty}
                    onChange={(e) => handleNumberFormat('prepayment_penalty', e.target.value)}
                    disabled={!editable}
                  >
                    <option value={0}>NOT APPLICABLE</option>
                    <option value={1}>1 YR</option>
                    <option value={2}>2 YR</option>
                    <option value={3}>3 YR</option>
                    <option value={4}>4 YR</option>
                    <option value={5}>5 YR</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Prepayment Penalty Type</label>
                  <select
                    name="prepayment_penalty_type"
                    className={`form-control ${styles.input}`}
                    value={form.prepayment_penalty_type}
                    onChange={handleChange}
                    disabled={!editable}
                  >
                    <option value="">Seleccione...</option>
                    <option value="NOT APPLICABLE">NOT APPLICABLE</option>
                    <option value="DECREASING">DECREASING</option>
                    <option value="FIXED">FIXED</option>
                  </select>
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
                    value={form.origination_fee_percentage}
                    onChange={(e) => handleNumberFormat('origination_fee_percentage', e.target.value)}
                    disabled={!editable}
                  >
                    <option value="2.5">Origination Fee 2,5%</option>
                    <option value="2.0">Origination Fee 2,0%</option>
                    <option value="1.5">Origination Fee 1,5%</option>
                    <option value="1.0">Origination Fee 1,0%</option>
                  </select>
                  {console.debug('[DscrIntentionForm] Select origination_fee_percentage:', {
                    formValue: form.origination_fee_percentage,
                    formValueType: typeof form.origination_fee_percentage,
                    options: ["2.5", "2.0", "1.5", "1.0"],
                    matches: ["2.5", "2.0", "1.5", "1.0"].includes(form.origination_fee_percentage)
                  })}
                  
                  {/* Resultado del Origination Fee */}
                  <div className="mt-1 px-2 d-flex flex-row gap-2">
                    <small className="text-muted d-block mb-1">
                      <strong>Origination Fee:</strong>
                    </small>
                    <small className="fw-bold">
                      ${Number(form.origination_fee || 0).toLocaleString()}
                    </small>
                  </div>
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
                    className={`form-control ${styles.input} bg-light`}
                    value={form.total_closing_cost}
                    onValueChange={(values) => handleNumberFormat('total_closing_cost', values.value)}
                    disabled={true}
                    thousandSeparator={true}
                    prefix="$"
                    readOnly
                  />
                  <small className="text-muted">
                    <i className="fas fa-calculator me-1"></i>
                    Calculado automáticamente
                  </small>
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
                  <label className="form-label fw-bold">Closing Cost Approx</label>
                  <NumericFormat
                    name="closing_cost_approx"
                    className={`form-control ${styles.input} bg-light`}
                    value={form.closing_cost_approx}
                    onValueChange={(values) => handleNumberFormat('closing_cost_approx', values.value)}
                    disabled={true}
                    decimalScale={2}
                    suffix="%"
                    readOnly
                  />
                  <small className="text-muted">
                    <i className="fas fa-calculator me-1"></i>
                    Calculado: (Closing Cost Liquidity ÷ Loan Amount) × 100
                  </small>
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
                <div className="col-md-6">
                  <label className="form-label fw-bold">DSCR Required</label>
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
                  <label className="form-label fw-bold">Appraisal value Expected</label>
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
                    name="down_payment"
                    className={`form-control ${styles.input}`}
                    value={form.down_payment}
                    onValueChange={(values) => handleNumberFormat('down_payment', values.value)}
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
                MINIMUM BORROWWER'S LIQUIDITY REQUIREMENTS 
              </h5>
            </div>
            <div className="col-12">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Down Payment Liquidity</label>
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
                  <label className="form-label fw-bold">Closing Cost Liquidity</label>
                  <NumericFormat
                    name="closing_cost_liquidity"
                    className={`form-control ${styles.input}`}
                    value={form.closing_cost_liquidity}
                    onValueChange={(values) => handleNumberFormat('closing_cost_liquidity', values.value)}
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
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="row">
            <div className="col-12 text-center">
              <button
                type="submit"
                className={`btn btn-lg px-5 ${hasUnsavedChanges ? 'btn-warning' : 'btn-primary'}`}
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
                    <i className={`fas ${hasUnsavedChanges ? 'fa-exclamation-triangle' : 'fa-save'} me-2`}></i>
                    {hasUnsavedChanges ? 'Guardar Cambios' : (Object.keys(initialData).length ? 'Actualizar' : 'Crear')} Carta de Intención
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