import React, { useState, useEffect } from "react";
import styles from "../style.module.css";
import { NumericFormat } from "react-number-format";
import { createFixflip, updateFixflip } from "../../../../../../Api/fixflip";
import { getRequestLinks, createRequestLink, sendRequestLink } from "../../../../../../Api/requestLink";
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
  comments: ""
};

const FixflipForm = ({ client_id, goToDocumentsTab, solicitud, cliente, editable = true }) => {
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
        purchase_price: solicitud.purchase_price || "",
        rehab_cost: solicitud.rehab_cost || "",
        arv: solicitud.arv || "",
        comments: solicitud.comments || ""
      });
      setIsEditMode(false);
    }
    if (solicitud && solicitud.id) {
      let isMounted = true;
      
      getRequestLinks({ fixflip_request_id: solicitud.id })
        .then(links => {
          if (isMounted) {
            const link = Array.isArray(links) ? links.find(l => l.link_token) : null;
            if (link && link.link_token) {
              setExternalLink(`${URL_EXTERNAL_FORM}/fixflip/${link.link_token}`);
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
      // Convertir campos numéricos vacíos a null
      const dataToSend = {
        ...form,
        loan_amount: form.loan_amount === "" ? null : Number(form.loan_amount),
        purchase_price: form.purchase_price === "" ? null : Number(form.purchase_price),
        rehab_cost: form.rehab_cost === "" ? null : Number(form.rehab_cost),
        arv: form.arv === "" ? null : Number(form.arv)
      };
      await updateFixflip(solicitud.id, dataToSend);
      setFeedback("¡Solicitud actualizada exitosamente!");
      setIsEditMode(false);
    } catch (error) {
      setFeedback("Error al actualizar la solicitud. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    try {
      const dataToSend = {
        ...form,
        client_id: Number(client_id),
        loan_amount: form.loan_amount === "" ? null : Number(form.loan_amount),
        purchase_price: form.purchase_price === "" ? null : Number(form.purchase_price),
        rehab_cost: form.rehab_cost === "" ? null : Number(form.rehab_cost),
        arv: form.arv === "" ? null : Number(form.arv)
      };
      const response = await createFixflip(dataToSend);
      setFeedback("¡Fixflip creado exitosamente!");
      if (typeof goToDocumentsTab === 'function') {
        goToDocumentsTab(response.id, 'fixflip');
      }
    } catch (error) {
      setFeedback("Error al crear el Fixflip. Inténtalo de nuevo.");
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
        construction_request_id: 0,
        fixflip_request_id: solicitud.id
      });
      if (link && link.link_token) {
        setExternalLink(`${URL_EXTERNAL_FORM}/fixflip/${link.link_token}`);
      }
    } catch (e) {
      // Podrías mostrar un feedback aquí si lo deseas
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
          request_type: "Fixflip",
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
    <form className={`container-fluid ${styles.formBlock}`} onSubmit={solicitud ? handleUpdate : handleSubmit} style={{ maxWidth: '100%', margin: '0 auto', background: 'none', boxShadow: 'none', border: 'none' }}>
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
        <h4 className="my_title_color fw-bold mb-0" style={{ letterSpacing: 0.5 }}>Detalle de Solicitud Fixflip</h4>
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
            autoComplete="off"
            disabled={!editable && !isEditMode}
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
            disabled={!editable && !isEditMode}
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
            disabled={!editable && !isEditMode}
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
            disabled={!editable && !isEditMode}
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
            disabled={!editable && !isEditMode}
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
            disabled={!editable && !isEditMode}
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
            disabled={!editable && !isEditMode}
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
            disabled={!editable && !isEditMode}
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
            disabled={!editable && !isEditMode}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12 mt-4 d-flex flex-column align-items-center">
          {solicitud ? (
            isEditMode ? (
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
            )
          ) : (
            <button
              type="submit"
              className={`btn fw-bold text-white rounded-pill ${styles.button}`}
              style={{ minWidth: "220px", background: "#1B2559", fontSize: 18 }}
              disabled={loading}
            >
              {loading ? "CREANDO..." : "CREAR FIXFLIP"}
            </button>
          )}
        </div>
      </div>
      {feedback && (
        <div className={`mt-3 ${feedback.includes("exitosamente") ? "text-success" : "text-danger"} fw-semibold`}>
          {feedback}
        </div>
      )}
    </form>
  );
};

export default FixflipForm; 