import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./RegisterForm.css";

const API_URL = "http://localhost:8080/api/register";

function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const navigateByRole = (role) => {
    switch (role) {
      case "WAREHOUSE_ADMIN": return navigate("/orders");
      case "VETERINARIAN":    return navigate("/vet/dashboard");
      case "ANIMALS_ADMIN":   return navigate("/animals");
      case "PRICE_ADMIN":     return navigate("/price-list");
      case "MANAGER":         return navigate("/reports");
      // default i USER -> korisnička stranica
      default:                return navigate("/user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.firstName || !form.lastName || !form.email) {
      setMsg("Popunite sva obavezna polja.");
      return;
    }
    if (form.password.length < 6) {
      setMsg("Šifra mora imati najmanje 6 karaktera.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMsg("Šifre se ne poklapaju.");
      return;
    }

    setLoading(true);
    try {
      // šaljemo BEZ role – backend dodeljuje USER
      const { data } = await axios.post(API_URL, {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        password:  form.password,
        confirmPassword: form.confirmPassword,
      });

      // backend vraća LoginResponse; očekujemo { message, role, user }
      const role = data?.role || "USER";
      let userData = data?.user;

      // Debug: Log the response data
      console.log('Register response:', data);
      console.log('User role:', role);
      console.log('User data:', userData);

      // Always fetch complete user data from /user endpoint using email
      console.log('Fetching complete user data from /user endpoint with email:', form.email);
      try {
        const userResponse = await axios.get(`http://localhost:8080/api/user?email=${encodeURIComponent(form.email)}`);
        userData = userResponse.data;
        console.log('Successfully fetched complete user data:', userData);
        console.log('User ID from endpoint:', userData.id);
        console.log('User firstName from endpoint:', userData.firstName);
        console.log('User lastName from endpoint:', userData.lastName);
      } catch (userError) {
        console.error('Failed to fetch complete user data from /user endpoint:', userError);
        console.error('Error details:', userError.response?.data || userError.message);
        
        // Create user object from form data as fallback
        userData = {
          id: data.id || data.userId,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: role
        };
        console.log('Using fallback user object due to API error:', userData);
      }

      // Store user data in localStorage for UserDashboard
      if (userData) {
        console.log('Storing user data in localStorage:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.error('No user data to store from registration!');
      }
      
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      setMsg(data?.message || "Uspešna registracija.");
      navigateByRole(role);
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Registracija neuspešna.";
      setMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="brand-header">
        <p className="app-name">PetClinic</p>
        <p className="app-subtitle">Ambulanta za ljubimce</p>
      </div>

      <div className="register-card">
        <h1 className="register-title">Registruj se</h1>

        <form onSubmit={handleSubmit} className="register-form">
          <label className="field-label">Ime</label>
          <input
            className="text-input"
            type="text"
            name="firstName"
            placeholder="Vaše ime"
            value={form.firstName}
            onChange={onChange}
          />

          <label className="field-label">Prezime</label>
          <input
            className="text-input"
            type="text"
            name="lastName"
            placeholder="Vaše prezime"
            value={form.lastName}
            onChange={onChange}
          />

          <label className="field-label">Gmail</label>
          <input
            className="text-input"
            type="email"
            name="email"
            placeholder="tvoja.adresa@gmail.com"
            value={form.email}
            onChange={onChange}
          />

          <label className="field-label">Šifra</label>
          <input
            className="text-input"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={onChange}
          />

          <label className="field-label">Potvrdi šifru</label>
          <input
            className="text-input"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={onChange}
          />

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Registrujem..." : "Registruj se"}
          </button>

          {msg && <div className="form-message">{msg}</div>}

          <div className="divider" />
          <div className="below-text">
            <span>Ako imate već profil,</span>{" "}
            <Link to="/" className="link-strong">
              prijavite se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
