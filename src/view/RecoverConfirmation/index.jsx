import React from 'react';
import logo from '../../assets/logo.png';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecoverConfirmation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate a delay to mimic an API call or some processing
    const timer = setTimeout(() => {
      // Redirect to the home page after 2 seconds
      navigate('/login');
    }, 2000);

    // Cleanup the timer on component unmount
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="d-flex justify-content-center align-items-center bg-dark text-center vh-100" style={{ backgroundColor: '#1d1b37' }}>
      <div className="bg-white rounded-4 d-flex flex-column justify-content-space-between p-4" style={{ width: '17%', height: '55%' }}>
        <img
          src={logo}
          alt="Logo"
          width={220}
          className="img-fluid justify-content-center mt-4 mx-auto"
        />

        <div className="d-flex flex-column h-100 justify-content-center">
          <p className="fs-4 fw-bolder mt-5">Revisa tu correo</p>
          <p className="text-muted fs-6">
            Hemos enviado un enlace de recuperación a tu cuenta de correo electrónico.
          </p>
        </div>

        <a href="#" className="btn btn-secondary w-100 rounded-pill fw-bolder">
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default RecoverConfirmation;
