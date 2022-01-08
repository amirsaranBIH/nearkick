import { createContext, useState } from "react";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const WalletContext = createContext({
  wallet: null,
  contract: null,
  isSignedIn: false,
});

export function WalletContextProvider({ children, wallet, contract }) {
  const [isSignedIn, setIsSignedIn] = useState(wallet.isSignedIn());

  const context = {
    wallet,
    contract,
    isSignedIn,
    setIsSignedIn,
  };

  return (
    <WalletContext.Provider value={context}>{children}</WalletContext.Provider>
  );
}

export default WalletContext;
