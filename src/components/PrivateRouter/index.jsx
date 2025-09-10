import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { getMe } from "../../Api/user";

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getMe();
        console.log("Usuario autenticado:", userData);

        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (e) {
        console.error("Error al autenticar:", e);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Cargando autenticación...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir a procesadores a /requests si intentan acceder a /dashboard
  if (user?.roles?.[0] === "Procesador" && location.pathname === "/dashboard") {
    return <Navigate to="/requests" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
