import React, { useEffect, useState } from "react";
import styles from "./style.module.css";
import Back from "../../../../assets/back.svg";
import { useNavigate, useParams } from "react-router-dom";
import { getCompanies } from "../../../../Api/admin";
import { createClient, updateClient, getClientById } from "../../../../Api/client";

const initialState = {
  nombre: "",
  empresa: "",
  correo: "",
  telefono: "",
  direccion: "",
  compraRefinanciacion: false,
  hipoteca: false,
  morosidad: false,
  impuestos: false,
  hoa: false,
  llc: false,
};

const CreateOrEditClient = () => {
  const navegate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies({ skip: 0, limit: 100 });
        setCompanies(data);
      } catch (e) {
        setCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (id) {
      setEditMode(true);
      setLoading(true);
      getClientById(id).then((data) => {
        setForm(data);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
        setFeedback("Error al cargar el cliente");
      });
    }
  }, [id]);

  const handleback = () => {
    navegate("/clients");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    
    // Validación básica de campos obligatorios
    if (!form.nombre || !form.correo || !form.empresa || !form.direccion) {
      setFeedback("Nombre, correo, empresa y dirección son obligatorios");
      setLoading(false);
      return;
    }

    // Validación de longitud mínima
    if (form.nombre.length < 3) {
      setFeedback("El nombre debe tener al menos 3 caracteres");
      setLoading(false);
      return;
    }

    if (form.direccion.length < 10) {
      setFeedback("La dirección debe tener al menos 10 caracteres");
      setLoading(false);
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.correo)) {
      setFeedback("El formato del correo electrónico no es válido");
      setLoading(false);
      return;
    }

    // Validación de teléfono (si se proporciona)
    if (form.telefono && form.telefono.length < 7) {
      setFeedback("El número de teléfono debe tener al menos 7 dígitos");
      setLoading(false);
      return;
    }

    // Mapeo de campos al formato esperado por la API
    const payload = {
      full_name: form.nombre.trim(),
      email: form.correo.trim().toLowerCase(),
      phone: form.telefono.trim(),
      company_id: Number(form.empresa),
      address: form.direccion.trim(),
      purchase_or_refinancing: form.compraRefinanciacion,
      has_a_mortgage: form.hipoteca,
      has_delinquencies: form.morosidad,
      pays_taxes: form.impuestos,
      current_hoa: form.hoa,
      subject_under_llc: form.llc
    };

    // Debug: mostrar payload en consola
    console.log("Payload a enviar:", payload);

    try {
      if (editMode) {
        // Actualizar cliente
        const response = await updateClient(id, payload);
        console.log("Respuesta de actualización:", response);
        setFeedback("¡Cliente actualizado exitosamente!");
        setTimeout(() => {
          navegate("/clients");
        }, 1500);
      } else {
        // Crear cliente
        const response = await createClient(payload);
        console.log("Respuesta de creación:", response);
        setFeedback("¡Cliente creado exitosamente!");
        setForm(initialState);
        setTimeout(() => {
          navegate("/clients");
        }, 1500);
      }
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      
      if (error.response?.data?.detail) {
        setFeedback(`Error: ${error.response.data.detail}`);
      } else if (error.response?.status === 422) {
        const validationErrors = error.response.data?.detail || [];
        const errorMessages = validationErrors.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
        setFeedback(`Error de validación: ${errorMessages}`);
      } else if (error.response?.status === 400) {
        setFeedback("Error en los datos enviados. Revisa la información.");
      } else if (error.response?.status === 401) {
        setFeedback("No autorizado. Verifica tu sesión.");
      } else if (error.response?.status === 500) {
        setFeedback("Error del servidor. Inténtalo más tarde.");
      } else {
        setFeedback("Error al guardar el cliente. Inténtalo de nuevo.");
      }
    }
    setLoading(false);
  };

  return (
    <div className={`${styles.container} p-5 internal_layout`}>
      <div className="d-flex align-items-center mb-5">
        <button className="btn border-none" onClick={handleback}>
          <img src={Back} alt="back" width={35} />
        </button>
        <h2 className={`${styles.title} fw-bolder my_title_color`}>
          {editMode ? "Actualizar cliente" : "Registrar cliente"}
        </h2>
      </div>
      {loading ? (
        <div>Cargando datos...</div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <input
              type="text"
              placeholder="Nombre del cliente"
              className={styles.input}
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            {/* --------------EMPRESAS--------------- */}
            <select
              name="empresa"
              id="options_companies"
              className={styles.input}
              value={form.empresa}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una empresa</option>
              {companies && companies.map(({ id, name }) => (
                <option value={id} key={id}>{name}</option>
              ))}
            </select>
          </div>
          <div className={styles.row}>
            <input
              type="email"
              placeholder="Correo electrónico"
              className={styles.input}
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              placeholder="Número de teléfono"
              className={styles.input}
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
            />
          </div>
          <div className={`${styles.row} mb-4`}>
            <input
              type="text"
              placeholder="Dirección de la propiedad"
              className={`${styles.inputFull} me-4`}
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              required
            />
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="compraRefinanciacion"
                checked={form.compraRefinanciacion}
                onChange={handleChange}
              />
              <span>¿Compra o refinanciación?</span>
            </label>
          </div>
          <div className={`${styles.checkboxGroup} mb-4`}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="hipoteca"
                checked={form.hipoteca}
                onChange={handleChange}
              />
              <span>¿Tiene hipoteca?</span>
            </label>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="morosidad"
                checked={form.morosidad}
                onChange={handleChange}
              />
              <span>¿Tiene morosidad?</span>
            </label>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="impuestos"
                checked={form.impuestos}
                onChange={handleChange}
              />
              <span>¿Paga impuestos?</span>
            </label>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="hoa"
                checked={form.hoa}
                onChange={handleChange}
              />
              <span>¿HOA vigente?</span>
            </label>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="llc"
                checked={form.llc}
                onChange={handleChange}
              />
              <span>¿Sujeto bajo LLC?</span>
            </label>
          </div>
          {feedback && (
            <div style={{ 
              color: feedback.includes("Error") ? 'red' : 'green', 
              marginBottom: 10,
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: feedback.includes("Error") ? '#ffe6e6' : '#e6ffe6'
            }}>
              {feedback}
            </div>
          )}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Guardando..." : (editMode ? "ACTUALIZAR" : "CREAR")}
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateOrEditClient;
