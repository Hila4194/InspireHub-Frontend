import React from "react";
import AppRoutes from "./routes";
import AuthProvider from "./context/Authcontext";
import Navbar from "./components/Navbar";

const App = () => {
  console.log("App component is rendering!");

  return (
    <AuthProvider>
      <Navbar />
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;