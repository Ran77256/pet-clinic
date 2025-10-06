import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginForm.css';

const API_URL = 'http://localhost:8080/api/login';

const LoginForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Logging in...');

    try {
      const response = await axios.post(API_URL, { email, password });

      // očekujemo { message, role, ... }
      setMessage(`SUCCESS: ${response?.data?.message || 'Login successful'}`);

      const userRole = response?.data?.role;

      if (userRole === 'WAREHOUSE_ADMIN') {
        navigate('/orders');
      } else if (userRole === 'VETERINARIAN') {
        // TODO: prilagodi rutu po potrebi
        navigate('/vet/dashboard');
      } else {
        setMessage(`SUCCESS: Login successful, but role ${userRole} is not mapped.`);
      }
    } catch (error) {
      if (error.response) {
        setMessage(`ERROR: ${error.response.data?.message || error.response.data}`);
      } else {
        setMessage('ERROR: Cannot connect to server. Is the backend running on port 8080?');
      }
      console.error('Login error', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="autentifikacija-wrapper">
      <div className="vector-bg-group"></div>

      <div className="brand-header">
        <div className="doggo-icon" />
        <p className="pet-clinic-title">PetClinic</p>
        <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
      </div>

      <div className="auth-box">
        <h2 className="prijava-title">Prijava</h2>

        <label className="input-label">Email</label>
        <div className="input-group">
          <input
            type="email"
            placeholder="tvoja.adresa@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <label className="input-label">Šifra</label>
        <div className="input-group">
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn-login" type="submit">Prijavi se</button>

        {message && (
          <p
            style={{
              marginTop: '15px',
              textAlign: 'center',
              color: message.startsWith('SUCCESS') ? 'green' : 'red',
            }}
          >
            {message}
          </p>
        )}

        <hr className="separator" />

        {/* 👉 Registracija link */}
        <div className="register-group">
          <span className="nema-profil">Nemaš profil?</span>
          <button
            type="button"
            className="registruj-se-link"
            onClick={() => navigate('/register')}
          >
            Registruj se
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
