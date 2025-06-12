import React from 'react';
import logo from '../../assets/logo.png';


const Login = () => {
  return (
    <div className="d-flex justify-content-center align-items-center bg-dark text-center vh-100" style={{ backgroundColor: '#1d1b37' }}>
      <div className="bg-white p-4 rounded-4" style={{ width: '300px' }}>
        <img
          src={logo}
          alt="Logo"
          className="img-fluid mb-3"
        />
        <h5 className="mb-3 fw-bold">Iniciar Sesión</h5>
        <form>
          <div className="mb-3">
            <input type="text" className="form-control rounded-pill" placeholder="Ingresar Usuario" />
          </div>
          <div className="mb-2">
            <input type="password" className="form-control rounded-pill" placeholder="Ingresar Contraseña" />
          </div>
          <div className="mb-3">
            <small><a href="#">¿Olvidaste tu contraseña?</a></small>
          </div>
          <button type="submit" className="btn btn-secondary w-100 rounded-pill">Iniciar sesión</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
