import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { toast, Bounce } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("mf_theme") === "dark",
  );

  useEffect(() => {
    // Handle unauthorized responses globally
    api.onUnauthorized = () => {
      logout();
    };

    const isTokenExpired = (token) => {
      if (!token) return true;
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );

        const { exp } = JSON.parse(jsonPayload);
        return Date.now() >= exp * 1000;
      } catch (e) {
        return true;
      }
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem("mf_access");
      if (token) {
        if (isTokenExpired(token)) {
          logout();
        } else {
          try {
            const response = await api.getProfile();
            setCurrentUser(response.data);
          } catch (error) {
            console.error("Profile fetch failed:", error);
            logout();
          }
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("mf_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("mf_theme", "light");
    }
  }, [darkMode]);

  const register = async (userData) => {
    try {
      const response = await api.register({
        full_name: userData.name,
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });
      toast.success("Registration successful!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);

      localStorage.setItem("mf_access", response.access);
      localStorage.setItem("mf_refresh", response.refresh);
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      setCurrentUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      toast.error("Login failed!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("mf_access");
    localStorage.removeItem("mf_refresh");
    setCurrentUser(null);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        darkMode,
        toggleDarkMode,
        login,
        logout,
        register,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
