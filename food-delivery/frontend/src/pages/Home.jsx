import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () =>{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div style={{padding: "40px"}}>
            <h1>Integrated Food Delivery and Dine-out Platform</h1>
            <p>Welcome, {user?.name}</p>
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Home;