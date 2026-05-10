import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { refreshToken } from "../helpers/api_helper"; 
import {jwtDecode} from "jwt-decode";
import { Loading } from "../components/Common/OtherElements/Loading";

const AuthProtected = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  

  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = Cookies.get("accessToken");
      console.log(accessToken)

      if (accessToken) {
        try {
          const { exp } = jwtDecode(accessToken);
          if (Date.now() >= exp * 1000) {
            const newAccessToken = await refreshToken();
            if (!newAccessToken) {
              throw new Error("Refresh token expired or invalid.");
            }
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Token expired or invalid:", error);
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          localStorage.setItem("redirectAfterLogin", window.location.pathname);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return <Loading/>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" />; 
  }

  return children;
};

export default AuthProtected;
