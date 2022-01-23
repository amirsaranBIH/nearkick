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
import { CONTRACT_ADDRESS } from "./config";

import WalletContext from "./store/wallet-context";
import LoadingContext from "./store/loading-context";

function App() {
  const walletContext = useContext(WalletContext);
  const loadingContext = useContext(LoadingContext);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);

  function connectWalletHandler() {
    walletContext.wallet
      .requestSignIn(CONTRACT_ADDRESS, "Nearkick")
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

  function onMobileDropdownToggleHandler() {
    setShowMobileDropdown(!showMobileDropdown);
  }

  return (
    <Router>
      <div>
        <header className="header">
          <nav className="navigation-links">
            <ul>
              <li>
                <Link to="/projects">Projects</Link>
              </li>
              <li>
                <Link to="/">
                  <img
                    className="brand-logo"
                    src="/logo.png"
                    alt="nearkick logo"
                  />
                </Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
            </ul>
          </nav>
          <div className="wallet-connect">
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
          </div>
          <div className="mobile-navigation">
            <div
              className="mobile-navigation-button"
              onClick={onMobileDropdownToggleHandler}
            >
              <span>MENU</span>
            </div>
            {showMobileDropdown && (
              <ul className="mobile-navigation-dropdown">
                <li>
                  <Link to="/projects">Projects</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
                {walletContext.wallet && walletContext.isSignedIn && (
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                )}
                {walletContext.wallet && walletContext.isSignedIn && (
                  <li onClick={disconnectWalletHandler}>
                    <span>Logout</span>
                  </li>
                )}
                {walletContext.wallet && !walletContext.isSignedIn && (
                  <li onClick={connectWalletHandler}>
                    <span>Connect Wallet</span>
                  </li>
                )}
              </ul>
            )}
          </div>
        </header>
        {loadingContext.loading && (
          <div className="loading">
            <div className="loading-bar"></div>
          </div>
        )}
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
