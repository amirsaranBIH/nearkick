import "./Header.css";
import { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getConfig } from "../../config";
import { useToasts } from "react-toast-notifications";
import WalletContext from "../../store/wallet-context";

function Header() {
  const location = useLocation();
  const { addToast } = useToasts();
  const walletContext = useContext(WalletContext);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);

  useEffect(() => {
    setShowDropdown(false);
    setShowMobileDropdown(false);
  }, [location]);

  function connectWalletHandler() {
    const config = getConfig(process.env.NODE_ENV);

    walletContext.wallet
      .requestSignIn(config.contractAddress, "Nearkick")
      .then((res) => {
        console.log(res);
      });
  }

  function disconnectWalletHandler() {
    walletContext.wallet.signOut();
    walletContext.setIsSignedIn(false);
    addToast("Successfully logged out of wallet", {
      appearance: "success",
      autoDismiss: true,
    });
  }

  function toggleDropdown() {
    setShowDropdown(!showDropdown);
  }

  function onMobileDropdownToggleHandler() {
    setShowMobileDropdown(!showMobileDropdown);
  }

  return (
    <header className="header">
      <nav className="navigation-links">
        <ul>
          <li>
            <Link to="/projects">Projects</Link>
          </li>
          <li>
            <Link to="/">
              <img className="brand-logo" src="/logo.png" alt="nearkick logo" />
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
                  <Link to="/dashboard">Dashboard</Link>
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
  );
}

export default Header;
