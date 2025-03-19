import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Homepage from "./pages/HomePage";
import MainFeedPage from "./pages/MainFeedPage";
import CommentsPage from "./pages/CommentsPage";

// This is the main App component that defines the routing for the application.
const App = () => {
  const { user } = useAuth();
  return (
      <Routes>
        <Route path="/" element={!user ? <Homepage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/comments/:postId" element={<CommentsPage />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/feed" element={<MainFeedPage />} />
      </Routes>
  );
};

export default App;