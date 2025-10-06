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

      // backend vraća LoginResponse; očekujemo { message, role }
      const role = data?.role || "USER";
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
      <span className="bg-blob bg-blob-right" />
      <span className="bg-blob bg-blob-left" />

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
            <Link to="/login" className="link-strong">
              prijavite se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
