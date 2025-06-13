import React from 'react';
import logo from '../../assets/logo.png';
import { NavLink } from 'react-router-dom';


const Login = () => {
  return (
    <div className="d-flex justify-content-center align-items-center bg-dark text-center vh-100" style={{ backgroundColor: '#1d1b37' }}>
      <div className="bg-white rounded-4 d-flex flex-column justify-content-space-between p-4" style={{ width: '17%', height:'55%'}}>
        <img
          src={logo}
          alt="Logo"
          width={220}
          className="img-fluid justify-content-center mt-4 mx-auto"
        />

        <div className='d-flex flex-column h-100'>
          <div className='text-start mt-5 mb-1'>
            <p className="fs-3 fw-bolder">Iniciar Sesión</p>
          </div>
          <form className='d-flex flex-column'>
            <div>
              <div className="mb-3">
                <input type="text" className="form-control rounded-pill" placeholder="Ingresar Usuario" />
              </div>
              <div className="mb-3">
                <input type="password" className="form-control rounded-pill" placeholder="Ingresar Contraseña" />
              </div>
              <div className="mb-3">
                <NavLink to={'/recover-password'} style={{color: 'black'}}>
                  <small>¿Olvidaste tu contraseña?</small>
                </NavLink>
              </div>
            </div>
          </form>
        </div>

        <button type="submit" className="btn btn-secondary w-100 rounded-pill fw-bolder">
          Iniciar sesión
        </button>
      </div>
    </div>
  );
};

export default Login;
