import AppRoutes from "./routes";
import AuthProvider from "./context/Authcontext";
import Navbar from "./components/Navbar";
import "./styles/App.css";

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