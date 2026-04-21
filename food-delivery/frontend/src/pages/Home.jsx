import { useNavigate } from "react-router-dom";
import "../styles/home.css";

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="home-page">
      <div className="home-card">
        <p className="home-badge">Integrated Food Delivery Platform</p>
        <h1 className="home-title">Welcome, {user?.name}</h1>

        <div className="home-info-box">
          <p className="home-info">
            <span>Email:</span> {user?.email}
          </p>
          <p className="home-info">
            <span>Role:</span> {user?.role}
          </p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;