import React, { useState } from 'react';
import LogoLogin from '../../assets/LogoLogin.svg';
import backgroundImage from '../../assets/background/loginback.jpg';
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
    <div 
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}
    >
      {/* Overlay oscuro para mejorar legibilidad */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}
      ></div>
      
      {/* Formulario de recuperación centrado */}
      <div 
        className="bg-white rounded-4 p-4 shadow-lg"
        style={{
          maxWidth: '450px',
          zIndex: 2,
          position: 'relative'
        }}
      >
        {/* Logo REINVESTAR oficial */}
        <div className="text-center mb-4">
          <img
            src={LogoLogin}
            alt="REINVESTAR CAPITAL GROUP"
            className="img-fluid mb-3"
            style={{
              maxWidth: '180px',
              height: 'auto'
            }}
          />
        </div>

        {/* Título del formulario */}
        <div className="text-start mb-4">
          <h2 
            className="fw-bold"
            style={{ 
              fontSize: '1.3rem'
            }}
          >
            Recuperar contraseña
          </h2>
          <p className="text-muted fs-6 mb-0">
            Ingresa tu correo para recibir instrucciones
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              name='email'
              value={email.email}
              onChange={handleChange}
              className="form-control rounded-pill border-2"
              placeholder="Correo electrónico"
              required
              autoFocus
              style={{
                padding: '10px 18px',
                fontSize: '16px',
                borderColor: '#E0E0E0'
              }}
            />
          </div>

          {/* Botón de envío */}
          <button 
            type="submit" 
            className="btn w-100 rounded-pill fw-bold text-white mb-3"
            style={{
              backgroundColor: '#FFC862',
              border: 'none',
              padding: '12px 20px',
              fontSize: '16px',
              minHeight: '48px'
            }}
          >    
            Enviar enlace
          </button>

          {/* Enlace para volver al login */}
          <div className="text-center">
            <button 
              type="button"
              className="btn btn-link text-decoration-none"
              onClick={() => navigate('/login')}
              style={{
                color: '#000',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecoverPassword;
