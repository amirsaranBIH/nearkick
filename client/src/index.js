import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { WalletContextProvider } from "./store/wallet-context";
import { LoadingContextProvider } from "./store/loading-context";
import { initWallet } from "./wallet";

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
