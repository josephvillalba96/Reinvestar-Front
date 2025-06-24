import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import Back from "../../../../assets/back.svg";
import Edit from "../../../../assets/editIcon.svg";
import Notification from "../../../../components/Notification";
import Modal from "../../../../components/Popup";
import { isEqual } from "lodash";


const dataClient = {
  fullName: "Josep Enrique Villalba Osorio",
  empresa: "Reinvestar",
  email: "jhosephvillalba@gamil.com",
  phone: "300-215-5188",
  direccion: "Cra 1b 44 03",
  tiene_hipoteca: true,
  tiene_morosidad: false,
  paga_impuestos: true,
  hoa_vigente: false,
  sujeto_bajo_llc: true,
  compra_o_refianciacion: true,
};

const DetailClient = () => {
  const navegate = useNavigate();
  const [client, setClient] = useState(null);
  const [editform, setEditForm] = useState(true);
  const [currentData, setCurrentData] = useState(null);
  const [show, setShow] = useState(false); 
  const [modalShow, setModalShow] = useState(false); 
  const [message, setMessage] = useState(""); 
  const [error, setError] = useState(null); 


  useEffect(() => {
    const timer = setTimeout(() => {
      setClient(dataClient);
    }, 1000);

    return () => clearTimeout(timer); // Limpieza correcta
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

  const handleSumit = (e) => {
     e.preventDefault(); 
     setTimeout(() => {

     }, 3000);
     
     setCurrentData(client); 
     setMessage("Datos actualizados exitosamente!"); 
     setEditForm(!editform); 
     handleNotification(); 
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
                client.fullName
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
            <fieldset disabled={editform} className="d-flex flex-column gap-3">
              <div className={styles.row}>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  name="fullName"
                  value={client.fullName}
                  onChange={handleForm}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="Nombre de la empresa"
                  name="empresa"
                  value={client.empresa}
                  onChange={handleForm}
                  className={styles.input}
                />
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
                  name="direccion"
                  value={client.direccion}
                  onChange={handleForm}
                  className={`${styles.inputFull} me-4`}
                />
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="compra_o_refianciacion"
                    onChange={handleForm}
                    checked={client.compra_o_refianciacion}
                  />
                  <span>¿Compra o refinanciación?</span>
                </label>
              </div>
              <div className={`${styles.checkboxGroup} mb-4`}>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="tiene_hipoteca"
                    onChange={handleForm}
                    checked={client.tiene_hipoteca}
                  />{" "}
                  <span>¿Tiene hipoteca?</span>
                </label>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="tiene_morosidad"
                    onChange={handleForm}
                    checked={client.tiene_morosidad}
                  />{" "}
                  <span>¿Tiene morosidad?</span>
                </label>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="paga_impuestos"
                    onChange={handleForm}
                    checked={client.paga_impuestos}
                  />{" "}
                  <span>¿Paga impuestos?</span>
                </label>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="hoa_vigente"
                    onChange={handleForm}
                    checked={client.hoa_vigente}
                  />{" "}
                  <span>¿HOA vigente?</span>
                </label>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="sujeto_bajo_llc"
                    onChange={handleForm}
                    checked={client.sujeto_bajo_llc}
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
