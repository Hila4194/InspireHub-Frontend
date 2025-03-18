import { Link } from "react-router-dom";
import logo from "../assets/logo.webp";
import "../styles/home.css";

// This is the HomePage component that serves as the landing page for the application
const HomePage = () => {
  return (
    <div className="container text-center mt-5">
      <h1 className="homepage-title">Welcome to InspireHub!</h1>
      <img src={logo} alt="InspireHub Logo" className="homepage-logo" />
      <p className="homepage-subtext">A creative space to share, explore, and inspire new ideas :)</p>
      <p className="homepage-subtext">Try it now!</p>
      <div className="d-flex justify-content-center mt-3">
        <Link to="/login" className="homepage-buttons me-2">Login</Link>
        <Link to="/register" className="homepage-buttons">Register</Link>
      </div>
    </div>
  );
};

export default HomePage;