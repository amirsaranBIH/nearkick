import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthUserContextProvider } from "./store/auth-user-context";
import axios from "axios";
import { HOST } from "./config";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = HOST;

ReactDOM.render(
  <AuthUserContextProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AuthUserContextProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
