import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createFixflip } from "../../../../../../Api/fixflip";
import { createRequestLink } from "../../../../../../Api/requestLink";
import { getClientById } from "../../../../../../Api/client";
import { sendTemplateEmail } from "../../../../../../Api/emailTemplate";

const URL_EXTERNAL_FORM = import.meta.env.VITE_URL_EXTERMAL_FORM;

const initialState = {
  property_type: "",
  property_address: "",
  property_city: "",
  property_state: "",
  property_zip: "",
  loan_amount: "",
  purchase_price: "",
  rehab_cost: "",
  arv: "",
  renovation_timeline: "",
  contractor_info: "",
  comments: ""
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
    const arvNum = form.arv === "" ? 0 : Number(form.arv);
    const purchaseNum = form.purchase_price === "" ? 0 : Number(form.purchase_price);
    if (arvNum > 0) return Number(((loanAmountNum / arvNum) * 100).toFixed(2));
    if (purchaseNum > 0) return Number(((loanAmountNum / purchaseNum) * 100).toFixed(2));
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
      const arvNum = form.arv === "" ? 0 : Number(form.arv);
      const purchaseNum = form.purchase_price === "" ? 0 : Number(form.purchase_price);
      const ltv = computeLtv();

      const dataToSend = {
        client_id: Number(client_id),
        property_type: form.property_type || "",
        property_address: form.property_address || "",
        property_city: form.property_city || "",
        property_state: form.property_state || "",
        property_zip_code: form.property_zip || "",
        loan_amount: loanAmountNum || 0,
        purchase_price: purchaseNum || 0,
        renovation_cost: form.rehab_cost === "" ? 0 : Number(form.rehab_cost),
        after_repair_value: arvNum || 0,
        property_value: arvNum || purchaseNum || 0,
        ltv,
        renovation_timeline: form.renovation_timeline || "",
        contractor_info: form.contractor_info || "",
        notes: form.comments || ""
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

      {/* Resto del formulario se mantiene igual */}
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
            name="property_zip"
            value={form.property_zip}
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
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-6">
          <label className="form-label my_title_color">Cronograma remodelación</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="renovation_timeline"
            value={form.renovation_timeline}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">Contratista</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="contractor_info"
            value={form.contractor_info}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-6">
          <label className="form-label my_title_color">LTV estimado</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            value={`${computeLtv()}%`}
            disabled
          />
        </div>
      </div>
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-6">
          <label className="form-label my_title_color">Costo de remodelación</label>
          <NumericFormat
            className={`form-control ${styles.input}`}
            name="rehab_cost"
            value={form.rehab_cost}
            onValueChange={({ value }) => handleNumberFormat("rehab_cost", value)}
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
          <label className="form-label my_title_color">ARV (valor después de remodelar)</label>
          <NumericFormat
            className={`form-control ${styles.input}`}
            name="arv"
            value={form.arv}
            onValueChange={({ value }) => handleNumberFormat("arv", value)}
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
      <div className="row gy-4 mb-2 mt-1">
        <div className="col-md-12">
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
        <div className="col-12 mt-4 d-flex flex-column align-items-center">
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