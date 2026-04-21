import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("ristro_token"));
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a stored token and decode it
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        });
      } catch {
        // Invalid token — clear it
        localStorage.removeItem("ristro_token");
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = (jwtToken) => {
    localStorage.setItem("ristro_token", jwtToken);
    setToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem("ristro_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
