import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import { NavLink, useNavigate } from 'react-router-dom';
import { login } from '../../Api/auth';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login({ email, password });
      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        navigate("/dashboard");
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (err) {
      setError("Credenciales incorrectas o error de red");
    }
    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-dark text-center vh-100" style={{ backgroundColor: '#1d1b37' }}>
      <div className="bg-white rounded-4 d-flex flex-column justify-content-space-between p-4">
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
          <form className='d-flex flex-column' onSubmit={handleSubmit}>
            <div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder="Ingresar Usuario"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control rounded-pill"
                  placeholder="Ingresar Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <NavLink to={'/recover-password'} style={{color: 'black'}}>
                  <small>¿Olvidaste tu contraseña?</small>
                </NavLink>
              </div>
              {error && <div className="alert alert-danger py-2">{error}</div>}
            </div>
            <button type="submit" className="btn btn-secondary w-100 rounded-pill fw-bolder" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
