import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./style.module.css";
import Back from "../../../../assets/back.svg";
import Edit from "../../../../assets/editIcon.svg";
import Notification from "../../../../components/Notification";
import Modal from "../../../../components/Popup";
import { isEqual } from "lodash";
import { getClientById, updateClient } from "../../../../Api/client"; 
import { getCompanies } from "../../../../Api/admin"; 


const DetailClient = () => {
  const navegate = useNavigate();
  const { id } = useParams(); 
  const [client, setClient] = useState(null);
  const [editform, setEditForm] = useState(true);
  const [currentData, setCurrentData] = useState(null);
  const [show, setShow] = useState(false); 
  const [modalShow, setModalShow] = useState(false); 
  const [message, setMessage] = useState(""); 
  const [error, setError] = useState(null); 
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleGetClient = async (id) => {
      try{
        const data = await getClientById(id); 
        setClient(data); 
        setCurrentData(data); // Inicializa currentData con los datos originales
      }catch(e){
        console.error({e});
      }
    }
    handleGetClient(id); 
  }, []);

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


  const handleNotification = () => {
     setShow(!show)

     setTimeout(()=>{
        setShow(false); 
     }, 1000)
  }

  const handleForm = (e) => {
    const { name, type, value, checked } = e.target;
    setClient({
      ...client,
      [name]: type === "checkbox" ? checked : value,
    });
    console.log(client); 
  };

  const handleCancelUpdate = () => {
     setClient(currentData);  //reversa a la data original
     setEditForm(!editform);
     setMessage("Se cancelo la actualizacion de datos"); 
     
     handleNotification(); 
  }

  const handleEnableForm = () => {
    setEditForm(!editform);
    setCurrentData({...client});
  };


  const handleModalEvent = () => {
    setModalShow(!modalShow); 

    setTimeout(() => {
        setModalShow(false)
    }, 3000);
  }

  const handleback = () => {

    const equalValues = isEqual(client, currentData); 

    if(!equalValues){
        handleModalEvent();
        return; 
    }

    navegate("/clients");
  };

  const handleSumit = async (e) => {
     e.preventDefault(); 
     setLoading(true);
     setError(null);
     setMessage("");
     try {
       // Mapeo de campos al formato esperado por la API
       const payload = {
         full_name: client.full_name,
         email: client.email,
         phone: client.phone,
         company_id: Number(client.company_id),
         address: client.address,
         purchase_or_refinancing: client.purchase_or_refinancing,
         has_a_mortgage: client.has_a_mortgage,
         has_delinquencies: client.has_delinquencies,
         pays_taxes: client.pays_taxes,
         current_hoa: client.current_hoa,
         subject_under_llc: client.subject_under_llc
       };
       const result = await updateClient(id, payload);
       setCurrentData({ ...client });
       setMessage("Datos actualizados exitosamente!");
       setEditForm(true);
       handleNotification();
     } catch (err) {
       setError("Error al actualizar el cliente. Intenta de nuevo.");
     }
     setLoading(false);
  }

  return (
    <>
      <div className={`${styles.container} p-5 internal_layout`}>
        {client ? (
          <div className="d-flex align-items-center mb-5">
            <button className="btn border-none" onClick={handleback}>
              <img src={Back} alt="back" width={35} />
            </button>
            <h2 className={`${styles.title} fw-bolder my_title_color`}>
              {`${editform ? "Detalle" : "Actualizar"} cliente - ${
                client.full_name
              }`}
            </h2>
            <button className="btn" onClick={handleEnableForm}>
              <img src={Edit} alt="edit-icon" width={20} />
            </button>
          </div>
        ) : (
          <div className="d-flex align-items-center mb-5">
            <button className="btn border-none" onClick={handleback}>
              <img src={Back} alt="back" width={35} />
            </button>
            <div className="d-flex gap-2 w-100">
              <h2 className={`${styles.title} fw-bolder my_title_color`}>
                {`Detalles cliente - `}
              </h2>
              <span className="placeholder col-4"></span>
            </div>
          </div>
        )}
        {client ? (
          <form className={styles.form} onSubmit={handleSumit}>
            <fieldset disabled={editform || loading} className="d-flex flex-column gap-3">
              <div className={styles.row}>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  name="full_name"
                  value={client.full_name}
                  onChange={handleForm}
                  className={styles.input}
                />
                {/* Select de empresa */}
                <select
                  name="company_id"
                  className={styles.input}
                  value={client.company_id || ""}
                  onChange={handleForm}
                  disabled={editform}
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
                  name="email"
                  value={client.email}
                  onChange={handleForm}
                  className={styles.input}
                />
                <input
                  type="tel"
                  placeholder="Número de teléfono"
                  name="phone"
                  value={client.phone}
                  onChange={handleForm}
                  className={styles.input}
                />
              </div>
              <div className={`${styles.row} mb-4`}>
                <input
                  type="text"
                  placeholder="Dirección de la propiedad"
                  name="address"
                  value={client.address}
                  onChange={handleForm}
                  className={`${styles.inputFull} me-4`}
                />
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="purchase_or_refinancing"
                    onChange={handleForm}
                    checked={client.purchase_or_refinancing}
                  />
                  <span>¿Compra o refinanciación?</span>
                </label>
              </div>
              <div className={`${styles.checkboxGroup} mb-4`}>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="has_a_mortgage"
                    onChange={handleForm}
                    checked={client.has_a_mortgage}
                  />{" "}
                  <span>¿Tiene hipoteca?</span>
                </label>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="has_delinquencies"
                    onChange={handleForm}
                    checked={client.has_delinquencies}
                  />{" "}
                  <span>¿Tiene morosidad?</span>
                </label>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="pays_taxes"
                    onChange={handleForm}
                    checked={client.pays_taxes}
                  />{" "}
                  <span>¿Paga impuestos?</span>
                </label>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="current_hoa"
                    onChange={handleForm}
                    checked={client.current_hoa}
                  />{" "}
                  <span>¿HOA vigente?</span>
                </label>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="subject_under_llc"
                    onChange={handleForm}
                    checked={client.subject_under_llc}
                  />{" "}
                  <span>¿Sujeto bajo LLC?</span>
                </label>
              </div>
              {editform || (
               <div className="d-flex gap-3">
                <button type="submit" className={`${styles.button} btn btn-success`}>
                  ACTUALIZAR
                </button>
                <button type="submit" className={`${styles.button} btn btn-danger`} onClick={handleCancelUpdate}>
                  CANCELAR
                </button>
               </div>
              )}
            </fieldset>
          </form>
        ) : (
          <form className={styles.form}>
            <div className={styles.row}>
              <span className="placeholder col-6 mb-3"></span>
              <span className="placeholder col-6 mb-3"></span>
            </div>
            <div className={styles.row}>
              <span className="placeholder col-6 mb-3"></span>
              <span className="placeholder col-6 mb-3"></span>
            </div>
            <div className={`${styles.row} mb-4`}>
              <span className="placeholder col-8 mb-3 me-4"></span>
              <span className="placeholder col-4 mb-3"></span>
            </div>
            <div className={`${styles.checkboxGroup} mb-4`}>
              <span className="placeholder col-4 mb-2 d-block"></span>
              <span className="placeholder col-4 mb-2 d-block"></span>
              <span className="placeholder col-4 mb-2 d-block"></span>
              <span className="placeholder col-4 mb-2 d-block"></span>
              <span className="placeholder col-4 mb-2 d-block"></span>
            </div>
            <div className="d-grid">
              <span className="placeholder col-6 mx-auto py-3"></span>
            </div>
          </form>
        )}
        <Notification show={show} message={message}/>
        <Modal show={modalShow} setShow={setModalShow} title={"¡Cambios sin Guardar!"}>
            Existen cambios sin guardar deseas salir.
        </Modal>
      </div>
    </>
  );
};

export default DetailClient;
