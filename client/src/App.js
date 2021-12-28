import "./App.css";
import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import AuthUserContext from "./store/auth-user-context";
import axios from "axios";

import Home from "./components/Home/Home";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Project from "./components/Project/Project";
import CreateProject from "./components/Dashboard/components/CreateProject/CreateProject";
import EditProject from "./components/Dashboard/components/EditProject/EditProject";

import WalletContext from "./store/wallet-context";

function App() {
  const authUserContext = useContext(AuthUserContext);
  const walletContext = useContext(WalletContext);

  function logout() {
    axios
      .get("/api/auth/logout")
      .then((res) => {
        console.log(res);
        authUserContext.setUser(null);
        authUserContext.setIsAuthenticated(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function connectWalletHandler() {
    walletContext.wallet.requestSignIn("second.amirsaran2.testnet", "Nearkick");
  }

  function disconnectWalletHandler() {
    walletContext.wallet.signOut();
    walletContext.setIsSignedIn(false);
  }

  return (
    <Router>
      <div>
        <header className="header">
          <h1>Nearkick</h1>
          <nav className="navigation-links">
            <ul>
              <li>
                <Link to="/">Projects</Link>
              </li>
              {authUserContext.isAuthenticated && (
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
              )}
              {authUserContext.isAuthenticated && (
                <li className="a" onClick={logout}>
                  Logout
                </li>
              )}
              {!authUserContext.isAuthenticated && (
                <li>
                  <Link to="/register">Register</Link>
                </li>
              )}
              {!authUserContext.isAuthenticated && (
                <li>
                  <Link to="/login">Login</Link>
                </li>
              )}
              {walletContext.wallet && walletContext.isSignedIn && (
                <li className="wallet-button" onClick={disconnectWalletHandler}>
                  Disconnect Wallet
                </li>
              )}
              {walletContext.wallet && !walletContext.isSignedIn && (
                <li className="wallet-button" onClick={connectWalletHandler}>
                  Connect Wallet
                </li>
              )}
            </ul>
          </nav>
        </header>
        <main>
          {authUserContext.loading && <p>Loading...</p>}
          {!authUserContext.loading && (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/project/:id" element={<Project />} />
              <Route
                path="/dashboard"
                element={
                  authUserContext.isAuthenticated ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/dashboard/create-project"
                element={
                  authUserContext.isAuthenticated ? (
                    <CreateProject />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/dashboard/edit-project/:id"
                element={
                  authUserContext.isAuthenticated ? (
                    <EditProject />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
