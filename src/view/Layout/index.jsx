import Logo from "../../assets/logo.png";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "./style.module.css";

import Logout from "../../assets/Logout.svg";

// image- profile
import UserProfile from "../../assets/profil-simulate.png";


//icons
import DashboardIcon from "../../assets/dashboardIcon.svg";
import RequestIcon from "../../assets/dolarIcon.svg";
import UserIcon from "../../assets/User.svg";
import ProductIcon from "../../assets/ProductIcon.svg"; 
import UserAndDolar from "../../assets/UserAndDolar.svg";
import Settings from "../../assets/Settings.svg"; 
import { useEffect, useState } from "react";

const routes = [
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
    icon: RequestIcon,
  },
  {
    id: 3,
    link: "/clients",
    name: "Clientes",
    icon: UserIcon,
  },
  {
    id: 4,
    link: "/Products",
    name: "Productos",
    icon: ProductIcon,
  },
  {
    id: 10,
    section: "Usuarios",
    icon:  UserAndDolar,
    subRoutes: [
      {
        id: 5,
        link: "/users",
        name: "Sistema",
      },
      {
        id: 6,
        link: "/sellers",
        name: "Vendeores",
      },
      {
        id: 7,
        link: "/process",
        name: "Procesadores",
      },
      {
        id: 8,
        link: "/coordinators",
        name: "Coordinadores",
      },
    ],
  },
  {
    id: 9,
    link: "/parameters",
    name: "Parametros",
    icon: Settings, 
  },
];

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(""); 


  useEffect(() => {
    const userData = localStorage.getItem("user"); 
    setUser(JSON.parse(userData)); 
  }, [])

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };


  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="mb-5">
          {/* <h5>REINVEST<span className="brand-star">★</span>R</h5> */}
          <img src={Logo} alt="Reinvest-logo" width={180} />
          {/* <small className="text-muted">Créditos fiduciarios</small> */}
        </div>

        <nav className="flex-grow-1 mx-3">
          <div className={`${"nav-section-title"} mb-3`}>
            <p className="title_section">Menú</p>
          </div>
          {
            routes.map((route)=> {

               if(route.hasOwnProperty("subRoutes")){
                  return (
                    <>
                     <div className="nav-link">
                      <div className="text-decoration-none d-flex">
                        <img src={route.icon} alt={route.section} className="me-3" />
                        <span style={{ color: "black" }}>{route.section}</span>
                      </div>
                    </div>
                     <div className="sub-routes me-5">
                      {route.subRoutes.map((subRoute) => (
                        <NavLink
                          key={subRoute.id}
                          to={subRoute.link}
                          className={`${({ isActive }) =>
                            isActive ? styles.active : styles.inactive}  nav-link d-flex align-items-center`}
                        >
                          <span>{subRoute.name}</span>
                        </NavLink>
                      ))}
                     </div>
                    </>
                  ); 
               }
                return (
                    <NavLink
                      key={route.id}
                      to={route.link}
                      className={`${({ isActive }) =>
                        isActive ? styles.active : styles.inactive}  nav-link d-flex align-items-center`}
                    >
                      <img src={route.icon} alt={route.name} className="me-3" />
                      <span>{route.name}</span>
                    </NavLink>
                );
            })
          }
        </nav>

        <a
          href="#"
          className="nav-link d-flex justify-content-center align-items-center"
          onClick={handleLogout}
        >
          <img src={Logout} alt="" className="me-3" />
          <span>Cerrar sesión</span>
        </a>
      </aside>

      {/* Main section */}
      <div className="flex-grow-1">
        <header className={`${"header"} ${styles.header_border_none}`}>
          <div className="user-info">
            <span>Hola, {user.full_name}</span>
            <img src={UserProfile} alt="User avatar"/>
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
