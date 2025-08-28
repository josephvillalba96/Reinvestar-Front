import Logo from "../../assets/LogoReinvestar.svg";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import styles from "./style.module.css";

// Importar íconos SVG
import DashboardIcon from "../../assets/sidebar_icons/Dashboard.svg";
import SolicitudesIcon from "../../assets/sidebar_icons/Solicitudes.svg";
import ClientesIcon from "../../assets/sidebar_icons/Clientes.svg";
import UsuariosIcon from "../../assets/sidebar_icons/Usuarios.svg";
import SistemaIcon from "../../assets/sidebar_icons/Sistema.svg";
import VendedoresIcon from "../../assets/sidebar_icons/Vendedores.svg";
import ProcesadoresIcon from "../../assets/sidebar_icons/Procesadores.svg";
import CoordinadoresIcon from "../../assets/sidebar_icons/Coordinadores.svg";
import ParametrosIcon from "../../assets/sidebar_icons/Parametros.svg";
import LogoutIcon from "../../assets/sidebar_icons/logout.svg";
import ProfileIcon from "../../assets/circle-user.svg";

// image- profile (removed - using Bootstrap icon instead)

// Mantener referencias antiguas por compatibilidad visual si hiciera falta
import { useEffect, useState } from "react";
import React from "react";

const mainRoutes = [
  {
    id: 1,
    link: "/dashboard",
    name: "Dashboard",
    icon: DashboardIcon,
  },
  {
    id: 2,
    link: "/requests",
    name: "Solicitudes",
    icon: SolicitudesIcon,
  },
  {
    id: 3,
    link: "/clients",
    name: "Clientes",
    icon: ClientesIcon,
  },
];

const userRoutes = [
  {
    id: 5,
    link: "/system",
    name: "Sistema",
    icon: SistemaIcon,
  },
  {
    id: 6,
    link: "/sellers",
    name: "Vendedores",
    icon: VendedoresIcon,
  },
  {
    id: 7,
    link: "/processors",
    name: "Procesadores",
    icon: ProcesadoresIcon,
  },
  {
    id: 8,
    link: "/coordinators",
    name: "Coordinadores",
    icon: CoordinadoresIcon,
  },
];

const otherRoutes = [
  {
    id: 9,
    link: "/parameters",
    name: "Parámetros",
    icon: ParametrosIcon,
  },
];

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    setUser(JSON.parse(userData));
  }, []);

  // Redirección automática para vendedores
  useEffect(() => {
    if (user && user.roles && user.roles[0] === "Vendedor") {
      if (location.pathname === "/" || location.pathname === "/dashboard") {
        navigate("/clients", { replace: true });
      }
    }
  }, [user, location, navigate]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Filtrado de menú según el rol
  let filteredMainRoutes = [];
  let filteredUserRoutes = [];
  let filteredOtherRoutes = [];
  
  if (user && user.roles) {
    const role = user.roles[0];
    // Por ahora mostramos todo el menú mientras se define la lógica de roles
    filteredMainRoutes = mainRoutes;
    filteredUserRoutes = userRoutes;
    filteredOtherRoutes = otherRoutes;
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="mb-4 d-flex justify-content-center">
          <img src={Logo} alt="Reinvest-logo" width={150} />
        </div>

        <nav className="flex-grow-1 mx-3" style={{ height: '71px' }}>
          {/* <div className={`${"nav-section-title"} mb-2`}>
            <p className="title_section" style={{color:'#9CA3AF'}}>Menú</p>
          </div> */}
          
          {/* Rutas principales */}
          {filteredMainRoutes.map((route) => (
            <NavLink
              key={route.id}
              to={route.link}
              className={({ isActive }) => `${isActive ? styles.active : styles.inactive} nav-link d-flex align-items-center`}
            >
              <img src={route.icon} alt={route.name} className="me-3 sidebar-icon" />
              <span>{route.name}</span>
            </NavLink>
          ))}

          {/* Sección de Usuarios */}
          <div className={`${"nav-section-title"} mb-2 mt-4`}>
            <p className="title_section" style={{color:'#9CA3AF'}}>Usuarios</p>
          </div>
          {filteredUserRoutes.map((route) => (
            <NavLink
              key={route.id}
              to={route.link}
              className={({ isActive }) => `${isActive ? styles.active : styles.inactive} nav-link d-flex align-items-center`}
            >
              <img src={route.icon} alt={route.name} className="me-3 sidebar-icon" />
              <span>{route.name}</span>
            </NavLink>
          ))}

          {/* Sección de Configuraciones */}
          <div className={`${"nav-section-title"} mb-2 mt-4`}>
            <p className="title_section" style={{color:'#9CA3AF'}}>Configuraciones</p>
          </div>
          {filteredOtherRoutes.map((route) => (
            <NavLink
              key={route.id}
              to={route.link}
              className={({ isActive }) => `${isActive ? styles.active : styles.inactive} nav-link d-flex align-items-center`}
            >
              <img src={route.icon} alt={route.name} className="me-3 sidebar-icon" />
              <span>{route.name}</span>
            </NavLink>
          ))}
        </nav>

        <a
          href="#"
          className="nav-link d-flex justify-content-center align-items-center logout"
          onClick={handleLogout}
        >
          <img src={LogoutIcon} alt="logout" className="me-3 sidebar-icon" />
          <span>Cerrar sesión</span>
        </a>
      </aside>

      {/* Main section */}
      <div className="flex-grow-1">
        <header className={`${"header"} ${styles.header_border_none}`}>
          <div className="user-info me-auto"></div>
          <div className={styles.header_buttons}>

            <div className="user-info ms-2">
              <span>Hola, {user.full_name}</span>
              <img src={ProfileIcon} alt="profile" width={20} />
            </div>
          </div>
        </header>

        <main className="main-content bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
