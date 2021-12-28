import { createContext, useEffect, useState } from "react";
import * as nearAPI from "near-api-js";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const WalletContext = createContext({
  wallet: null,
  contract: null,
  isSignedIn: false,
});

export function WalletContextProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [contract, setContract] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  async function initWallet() {
    const config = {
      networkId: "testnet",
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://wallet.testnet.near.org",
      helperUrl: "https://helper.testnet.near.org",
      explorerUrl: "https://explorer.testnet.near.org",
    };

    const near = await nearAPI.connect(config);
    const wallet = new nearAPI.WalletConnection(near, "nearkick");
    const account = wallet.account();
    const contract = new nearAPI.Contract(
      account, // the account object that is connecting
      "second.amirsaran2.testnet",
      {
        // name of contract you're connecting to
        viewMethods: ["get_num"], // view methods do not change state but usually return a value
        changeMethods: ["increment", "decrement", "reset"], // change methods modify state
        sender: account, // account object to initialize and sign transactions.
      }
    );

    setWallet(wallet);
    setContract(contract);
    setIsSignedIn(wallet.isSignedIn());
  }

  useEffect(() => {
    initWallet();
  }, []);

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
