import { useState }from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import "../styles/auth.css";




function Register(){

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer",
        phone: "",
        address: "",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const res = await API.post("/auth/register", formData);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setMessage("Registration successfully");
            navigate("/");
        } catch (error){
            setMessage(error.response?.data?.message || "Registration failed");
        }
    };
    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h2>Register</h2>
                <input type="text"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange} required
                />
                <input type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                 />

                 <input type="password" name="password"
                 placeholder="Enter Password"
                 value={formData.password}
                 onChange={handleChange}
                 required
                />
                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="customer">Customer</option>
                    <option value="restaurant_owner">Restaurant Owner</option>
                    <option value="courier">Courier</option>
                </select>

                <input type="text"
                name="phone"
                placeholder="Enter phone"
                value={formData.phone}
                onChange={handleChange}
                 />

                 <input type="text"
                 name="address"
                 placeholder="Enter address"
                 value={formData.address}
                 onChange={handleChange}
                  />

                  <button type="submit">Register</button>

                  {message && <p className="message">{message}</p>}

                  <p>Already have an account <Link to="/login">Login</Link></p>
            </form>
        </div>
    );
}
export default Register;