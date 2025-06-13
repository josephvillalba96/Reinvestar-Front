import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const RecoverPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState({ email: '' });
   
    const handleChange = (e) => {
        setEmail({ [e.target.name]: e.target.value });
    }

    const handleSubmit = (e) => {
        e.preventDefault(); 
        // Aquí podrías agregar la lógica para enviar el correo de recuperación
        console.log('Correo enviado a:', email.email);
        
        setTimeout(() => {
            navigate('/recover-confirmation');
        }, 2000);
    }


  return (
    <div className="d-flex justify-content-center align-items-center bg-dark text-center vh-100" style={{ backgroundColor: '#1d1b37' }}>
      <div className="bg-white rounded-4 d-flex flex-column justify-content-space-between p-4" style={{ width: '17%', height:'55%' }}>
        <img
          src={logo}
          alt="Logo"
          width={220}
          className="img-fluid justify-content-center mt-4 mx-auto"
        />

        <div className='d-flex flex-column h-100'>
          <div className='text-start mt-5 mb-2'>
            <p className="fs-4 fw-bolder">Recuperar contraseña</p>
            <p className="text-muted fs-6">Ingresa tu correo para recibir instrucciones</p>
          </div>
          <form className='d-flex flex-column'>
            <div className="mb-3">
              <input
                type="email"
                name='email'
                value={email.email}
                onChange={handleChange}
                className="form-control rounded-pill"
                placeholder="Correo electrónico"
              />
            </div>
          </form>
        </div>

        <button 
            type="submit" 
            className="btn btn-secondary w-100 rounded-pill fw-bolder"
            onClick={handleSubmit}
        >    
          Enviar enlace
        </button>
      </div>
    </div>
  );
};

export default RecoverPassword;
