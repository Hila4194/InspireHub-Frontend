import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
//import { BrowserRouter } from "react-router-dom";
//import { AuthProvider } from "./context/AuthContext";
import "./styles/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")!).render(
 
  <GoogleOAuthProvider clientId="333364458194-m8in91upuvirbsveakb13j5o3ssb6kdk.apps.googleusercontent.com">
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
);