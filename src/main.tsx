import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./styles/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// This is the main entry point of the React application.
// It renders the App component wrapped with necessary providers and routers.
// The GoogleOAuthProvider is used for Google authentication.
// The AuthProvider is used for managing authentication state.
// The BrowserRouter is used for routing within the application.
// The application is styled using Bootstrap and custom CSS.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="333364458194-m8in91upuvirbsveakb13j5o3ssb6kdk.apps.googleusercontent.com">
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);