import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { WalletContextProvider } from "./store/wallet-context";
import * as nearAPI from "near-api-js";

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
    account,
    "dev-1641636391860-77373132231441",
    {
      viewMethods: ["get_project", "get_all_projects"],
      changeMethods: [
        "add_project",
        "update_project",
        "add_supporter_to_project",
        "cancel_project",
      ],
      sender: account,
    }
  );

  return { wallet, contract };
}

initWallet().then((res) => {
  ReactDOM.render(
    <WalletContextProvider wallet={res.wallet} contract={res.contract}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </WalletContextProvider>,
    document.getElementById("root")
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
