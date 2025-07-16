import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getMe } from "../../Api/user";

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getMe();
        console.log("Usuario autenticado:", user);

        if (user) {
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Error al autenticar:", e);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Cargando autenticación...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
