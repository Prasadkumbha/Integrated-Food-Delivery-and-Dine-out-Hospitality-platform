import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import "../styles/auth.css";


function Login(){
    const [formData, setFormData] = useState({
        email:"",
        password: "",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...FormData, [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/auth/login", formData);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setMessage("Login successful");
            navigate("/");
        }catch(error){

            setMessage(error.response?.data?.message || "Login failed"); 
        }
    };
    return(
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleChange}>
                <h2>Login</h2>
                <input type="email" name="email" placeholder="Enter Email" value={formData.email}
                onChange={handleChange} required />
                <input type="password" name="password" placeholder="Enter password"
                value={formData.password} onChange={handleChange} required
                />
                <button type="submit" onSubmit={handleSubmit}>Login</button>
                {message && <p className="message">{message}</p>}
                <p>
                    Don't have an account? 
                    <Link to="/register">Register</Link>
                </p>
            </form>
        </div>
    );

}
export default Login;