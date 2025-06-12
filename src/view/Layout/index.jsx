import Logo from "../../assets/logo.png";
import { NavLink, Outlet} from "react-router-dom";

const routes = [
  {
    section: "Menú",
    routers: [
      {
        id:1,
        link: "/dashboard",
        name: "Dashboard",
      },
      {
        id:2,
        link: "/requests",
        name: "Solicitudes",
      },
      {
        id:3,
        link: "/Clients",
        name: "Clientes",
      },
      {
        id:4,
        link: "/Products",
        name: "Productos",
      },
    ],
  },
  {
    section: "Users",
    routers: [
      {
        id:5,
        link: "/users",
        name: "Usuarios",
      },
      {
        id:6,
        link: "/sales",
        name: "Vendeores",
      },
      {
        id:7,
        link: "/process",
        name: "Procesadores",
      },
      {
        id:8,
        link: "/coordinators",
        name: "Coordinadores",
      },
    ],
  },
  {
    section: "Parametros",
    routers: [
      {
        id:9,
        link: "/parameters",
        name: "Parametros",
      },
    ],
  },
];


const Layout = ({ children }) => {
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
          {routes.map(({index, section, routers }) => {
            return (
              <>
                <div key={index} className="nav-section-title">{section}</div>
                {
                  routers.map(({id, link, name})=> {
                     return(
                       <NavLink key={id} to={link} className="nav-link">{name}</NavLink>
                     ); 
                  })
                }
              </>
            );
          })}
        </nav>

        <a href="#" className="nav-link logout">
          Cerrar sesión
        </a>
      </aside>

      {/* Main section */}
      <div className="flex-grow-1">
        <header className="header">
          <div className="user-info">
            <span>Hola, Neida</span>
            <img src="https://via.placeholder.com/32" alt="User avatar" />
          </div>
        </header>

        <main className="main-content">
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default Layout;
