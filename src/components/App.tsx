import AppRoutes from "../routes";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "./Navbar";
import "../styles/App.css";
import "@fortawesome/fontawesome-free/css/all.css";

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