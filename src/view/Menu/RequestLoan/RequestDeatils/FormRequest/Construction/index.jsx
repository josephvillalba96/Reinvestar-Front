import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createConstruction, updateConstruction } from "../../../../../../Api/construction";
import { getRequestLinks, createRequestLink, sendRequestLink } from "../../../../../../Api/requestLink";
import { sendTemplateEmail } from "../../../../../../Api/emailTemplate";

const URL_EXTERNAL_FORM = import.meta.env.VITE_URL_EXTERMAL_FORM;

console.log('Construction - URL_EXTERNAL_FORM:', URL_EXTERNAL_FORM);

const initialState = {
  property_type: "",
  property_address: "",
  property_city: "",
  property_state: "",
  property_zip: "",
  loan_amount: "",
  property_value: "",
  construction_cost: "",
  land_cost: "",
  comments: ""
};

const ConstructionForm = ({ client_id, goToDocumentsTab, solicitud, cliente, editable = true }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [externalLink, setExternalLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (solicitud) {
      setForm({
        property_type: solicitud.property_type || "",
        property_address: solicitud.property_address || "",
        property_city: solicitud.property_city || "",
        property_state: solicitud.property_state || "",
        property_zip: solicitud.property_zip || "",
        loan_amount: solicitud.loan_amount || "",
        property_value: solicitud.property_value || "",
        construction_cost: solicitud.construction_cost || "",
        land_cost: solicitud.land_cost || "",
        comments: solicitud.comments || ""
      });
      setIsEditMode(false);
    }
    if (solicitud && solicitud.id) {
      let isMounted = true;
      
      getRequestLinks({ construction_request_id: solicitud.id })
        .then(links => {
          if (isMounted) {
            const link = Array.isArray(links) ? links.find(l => l.link_token) : null;
            if (link && link.link_token) {
              const fullLink = `${URL_EXTERNAL_FORM}/construction/${link.link_token}`;
              setExternalLink(fullLink);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberFormat = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    try {
      await updateConstruction(solicitud.id, form);
      setFeedback("¡Solicitud actualizada exitosamente!");
      setIsEditMode(false);
    } catch (error) {
      setFeedback("Error al actualizar la solicitud. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const handleGenerateLink = async () => {
    if (!solicitud || !solicitud.id) return;
    setGenerating(true);
    try {
      const link = await createRequestLink({
        valid_days: 30,
        dscr_request_id: 0,
        construction_request_id: solicitud.id,
        fixflip_request_id: 0
      });
      if (link && link.link_token) {
        const fullLink = `${URL_EXTERNAL_FORM}/construction/${link.link_token}`;
        setExternalLink(fullLink);
      }
    } catch (e) {
      console.error('Error generating link:', e);
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
          request_type: "Construction",
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

  return (
    <form className={`container-fluid ${styles.formBlock}`} onSubmit={handleUpdate} style={{ maxWidth: '100%', margin: '0 auto', background: 'none', boxShadow: 'none', border: 'none' }}>
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
            <div className="col-md-3">
              <label className="form-label my_title_color">ID</label>
              <input className={`form-control ${styles.input}`} value={cliente.id || ""} disabled />
            </div>
          </div>
        </div>
      )}
      <div className="d-flex align-items-center mb-4 gap-3">
        <h4 className="my_title_color fw-bold mb-0" style={{ letterSpacing: 0.5 }}>Detalle de Solicitud Construction</h4>
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
              className="btn btn-outline-primary btn-sm ms-2"
              onClick={handleSendLink}
              disabled={sending}
            >
              {sending ? "Enviando..." : "Enviar por Email"}
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
      {/* Formulario de solicitud Construction */}
      <div className="row gy-2 mb-2">
        <div className="col-md-6">
          <label className="form-label my_title_color">Tipo de propiedad</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
            required
            disabled={!editable && !isEditMode}
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
            required
            disabled={!editable && !isEditMode}
          />
        </div>
      </div>
      <div className="row gy-2 mb-2">
        <div className="col-md-4">
          <label className="form-label my_title_color">Ciudad</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="property_city"
            value={form.property_city}
            onChange={handleChange}
            required
            disabled={!editable && !isEditMode}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Estado</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="property_state"
            value={form.property_state}
            onChange={handleChange}
            required
            disabled={!editable && !isEditMode}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Código postal</label>
          <input
            type="text"
            className={`form-control ${styles.input}`}
            name="property_zip"
            value={form.property_zip}
            onChange={handleChange}
            required
            disabled={!editable && !isEditMode}
          />
        </div>
      </div>
      <div className="row gy-2 mb-2">
        <div className="col-md-4">
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
            required
            placeholder="$0.00"
            inputMode="decimal"
            disabled={!editable && !isEditMode}
          />
        </div>
        <div className="col-md-4">
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
            required
            placeholder="$0.00"
            inputMode="decimal"
            disabled={!editable && !isEditMode}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label my_title_color">Costo de construcción</label>
          <NumericFormat
            className={`form-control ${styles.input}`}
            name="construction_cost"
            value={form.construction_cost}
            onValueChange={({ value }) => handleNumberFormat("construction_cost", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            required
            placeholder="$0.00"
            inputMode="decimal"
            disabled={!editable && !isEditMode}
          />
        </div>
      </div>
      <div className="row gy-2 mb-2">
        <div className="col-md-6">
          <label className="form-label my_title_color">Costo del terreno</label>
          <NumericFormat
            className={`form-control ${styles.input}`}
            name="land_cost"
            value={form.land_cost}
            onValueChange={({ value }) => handleNumberFormat("land_cost", value)}
            thousandSeparator="," 
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            required
            placeholder="$0.00"
            inputMode="decimal"
            disabled={!editable && !isEditMode}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label my_title_color">Comentarios</label>
          <textarea
            className={`form-control ${styles.textarea}`}
            name="comments"
            value={form.comments}
            onChange={handleChange}
            rows={3}
            required
            disabled={!editable && !isEditMode}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12 mt-3 d-flex flex-column align-items-center">
          {isEditMode ? (
            <button
              type="submit"
              className={`btn fw-bold text-white rounded-pill ${styles.button}`}
              style={{ minWidth: "220px", background: "#1B2559", fontSize: 18 }}
              disabled={loading}
            >
              {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
            </button>
          ) : (
            <button
              type="button"
              className={`btn fw-bold text-white rounded-pill ${styles.button}`}
              style={{ minWidth: "220px", background: "#1B2559", fontSize: 18 }}
              onClick={() => setIsEditMode(true)}
            >
              EDITAR
            </button>
          )}
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

export default ConstructionForm; 