import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { WalletContextProvider } from "./store/wallet-context";
import * as nearAPI from "near-api-js";
import {
  NETWORK_ID,
  CONTRACT_ADDRESS,
  NODE_URL,
  WALLET_URL,
  HELPER_URL,
  EXPLORER_URL,
} from "./config";
import { LoadingContextProvider } from "./store/loading-context";

async function initWallet() {
  const config = {
    networkId: NETWORK_ID,
    keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: NODE_URL,
    walletUrl: WALLET_URL,
    helperUrl: HELPER_URL,
    explorerUrl: EXPLORER_URL,
  };

  const near = await nearAPI.connect(config);
  const wallet = new nearAPI.WalletConnection(near, "nearkick");
  const account = wallet.account();
  const contract = new nearAPI.Contract(account, CONTRACT_ADDRESS, {
    viewMethods: [
      "get_project",
      "get_all_projects",
      "get_all_projects_by_owner",
    ],
    changeMethods: [
      "add_project",
      "update_project",
      "add_supporter_to_project",
      "cancel_project",
      "verify_supporter_on_project",
    ],
    sender: account,
  });

  return { wallet, contract };
}

initWallet().then((res) => {
  ReactDOM.render(
    <WalletContextProvider wallet={res.wallet} contract={res.contract}>
      <LoadingContextProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </LoadingContextProvider>
    </WalletContextProvider>,
    document.getElementById("root")
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
