import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
<<<<<<< HEAD
import Homepage from "./pages/HomePage";

const App = () => {
  const { user } = useAuth();

  return (
      <Routes>
        <Route path="/" element={!user ? <Homepage /> : <Navigate to="/dashboard" />} />
=======

const App = () => {
  const { user } = useAuth();

  return (
      <Routes>
>>>>>>> 76100c792c5c2d6ee073d87518e1cd1032132f05
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
  );
};

export default App;