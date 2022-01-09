import "./App.css";
import { useState, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import Home from "./components/Home/Home";
import Projects from "./components/Projects/Projects";
import About from "./components/About/About";
import Dashboard from "./components/Dashboard/Dashboard";
import Project from "./components/Project/Project";
import CreateProject from "./components/Dashboard/components/CreateProject/CreateProject";
import EditProject from "./components/Dashboard/components/EditProject/EditProject";

import WalletContext from "./store/wallet-context";

function App() {
  const walletContext = useContext(WalletContext);

  const [showDropdown, setShowDropdown] = useState(false);

  function connectWalletHandler() {
    walletContext.wallet
      .requestSignIn("second.amirsaran2.testnet", "Nearkick")
      .then((res) => {
        console.log(res);
      });
  }

  function disconnectWalletHandler() {
    walletContext.wallet.signOut();
    walletContext.setIsSignedIn(false);
    toggleDropdown();
  }

  function toggleDropdown() {
    setShowDropdown(!showDropdown);
  }

  return (
    <Router>
      <div>
        <header className="header">
          <h1>
            <Link to="/">NEARKICK</Link>
          </h1>
          <nav className="navigation-links">
            <ul>
              <li>
                <Link to="/projects">Projects</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              {walletContext.wallet && walletContext.isSignedIn && (
                <li className="wallet-button">
                  <span onClick={toggleDropdown}>
                    {walletContext.wallet.getAccountId()}
                  </span>
                  {showDropdown && (
                    <ul className="wallet-button-dropdown">
                      <li>
                        <Link onClick={toggleDropdown} to="/dashboard">
                          Dashboard
                        </Link>
                      </li>
                      <li onClick={disconnectWalletHandler}>Logout</li>
                    </ul>
                  )}
                </li>
              )}
              {walletContext.wallet && !walletContext.isSignedIn && (
                <li className="wallet-button">
                  <span onClick={connectWalletHandler}>Connect Wallet</span>
                </li>
              )}
            </ul>
          </nav>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<About />} />
            <Route path="/project/:id" element={<Project />} />
            <Route
              path="/dashboard"
              element={
                walletContext.isSignedIn ? <Dashboard /> : <Navigate to="/" />
              }
            />
            <Route
              path="/dashboard/create-project"
              element={
                walletContext.isSignedIn ? (
                  <CreateProject />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/dashboard/edit-project/:id"
              element={
                walletContext.isSignedIn ? <EditProject /> : <Navigate to="/" />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
