import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to InspireHub</h1>
      <p>Your platform for sharing and discovering new ideas.</p>
      <Link to="/login" className="btn btn-primary">Login</Link>
      <Link to="/register" className="btn btn-outline-primary ms-3">Register</Link>
    </div>
  );
};

export default HomePage;