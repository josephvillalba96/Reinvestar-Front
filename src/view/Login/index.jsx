import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { login } from '../../Api/auth';
import { getMe } from '../../Api/user';
import backgroundImage from '../../assets/background/loginback.jpg';
import LogoLogin from '../../assets/LogoLogin.svg';

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
        // Obtener el usuario y su rol
        const user = await getMe();
        localStorage.setItem("user", JSON.stringify(user));
        
        // Redirigir según el rol
        if (user && user.roles && user.roles[0] === "Procesador") {
          navigate("/requests");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (err) {
      setError("Credenciales incorrectas o error de red");
    }
    setLoading(false);
  };

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
      
      {/* Formulario de login centrado */}
      <div 
        className="bg-white rounded-4 p-4 shadow-lg"
        style={{
          // width: '100%',
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
            Iniciar Sesión
          </h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control rounded-pill border-2"
              placeholder="Ingresar Usuario"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              style={{
                padding: '10px 18px',
                fontSize: '16px',
                borderColor: '#E0E0E0'
              }}
            />
          </div>
          
          <div className="mb-3">
            <input
              type="password"
              className="form-control rounded-pill border-2"
              placeholder="Ingresar Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                padding: '10px 18px',
                fontSize: '16px',
                borderColor: '#E0E0E0'
              }}
            />
          </div>

          {/* Enlace de contraseña olvidada */}
          <div className="text-center mb-4">
            <NavLink 
              to={'/recover-password'} 
              style={{
                color: '#000',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ¿Olvidaste tu contraseña?
            </NavLink>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="alert alert-danger py-2 mb-3 rounded-pill">
              {error}
            </div>
          )}

          {/* Botón de inicio de sesión */}
          <button 
            type="submit" 
            className="btn w-100 rounded-pill fw-bold text-white"
            disabled={loading}
            style={{
              backgroundColor: '#FFC862',
              border: 'none',
              padding: '12px 20px',
              fontSize: '16px',
              minHeight: '48px'
            }}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
