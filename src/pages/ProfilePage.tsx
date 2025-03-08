import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/profile.css";

const Profile = () => {
  const { user } = useContext(AuthContext)!;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>
        {user ? (
          <>
            <h4 className="fw-bold">{user.username}</h4>
            <p className="text-muted">User ID: {user._id}</p>
          </>
        ) : (
          <p>No user data available.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;