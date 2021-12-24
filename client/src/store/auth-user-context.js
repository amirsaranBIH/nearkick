import axios from "axios";
import { createContext, useEffect, useState } from "react";

const AuthUserContext = createContext({
  user: null,
  isAuthenticated: true,
  setUser: () => {},
  setIsAuthenticated: () => {},
  loading: true,
});

export function AuthUserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/auth/user")
      .then((res) => {
        if (res.status === 200 && res.data.status === "success") {
          setUser(res.data.data);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  }, []);

  const context = {
    user,
    isAuthenticated,
    setUser,
    setIsAuthenticated,
    loading,
  };

  return (
    <AuthUserContext.Provider value={context}>
      {children}
    </AuthUserContext.Provider>
  );
}

export default AuthUserContext;
