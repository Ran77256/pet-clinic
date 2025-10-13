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

      // očekujemo { message, role, user, ... }
      setMessage(`SUCCESS: ${response?.data?.message || 'Login successful'}`);

      const userRole = response?.data?.role;
      let userData = response?.data?.user;

      // Debug: Log the response data
      console.log('Login response:', response.data);
      console.log('User role:', userRole);
      console.log('User data:', userData);

      // Always fetch complete user data from /user endpoint using email  
      console.log('Fetching complete user data from /user endpoint with email:', email);
      try {
        const userResponse = await axios.get(`http://localhost:8080/api/user?email=${encodeURIComponent(email)}`);
        userData = userResponse.data;
        console.log('Successfully fetched complete user data:', userData);
        console.log('User ID from endpoint:', userData.id);
        console.log('User firstName from endpoint:', userData.firstName);
        console.log('User lastName from endpoint:', userData.lastName);
      } catch (userError) {
        console.error('Failed to fetch complete user data from /user endpoint:', userError);
        console.error('Error details:', userError.response?.data || userError.message);
        
        // Create minimal user object as fallback
        userData = {
          id: response.data.id || response.data.userId,
          firstName: response.data.firstName || 'Korisnik',
          lastName: response.data.lastName || '',
          email: email,
          role: userRole
        };
        console.log('Using fallback user object due to API error:', userData);
      }

      // Store user data in localStorage
      if (userData) {
        console.log('Storing user data in localStorage:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.error('No user data to store!');
      }
      
      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Navigate based on role, default to /user for regular users
      console.log('Determining navigation for role:', userRole);

      console.log('Role type:', typeof userRole);
      console.log('Role comparison with USER:', userRole === 'USER');

      
      if (userRole === 'WAREHOUSE_ADMIN') {
        console.log('Navigating to /orders');
        navigate('/orders');
      } else if (userRole === 'VETERINARIAN') {

        console.log('Navigating to /vet');
        navigate('/vet');
      } else if (userRole === 'PRICE_ADMIN') { 
        console.log('Navigating to /priceAdmin');
        navigate('/priceAdmin');
      } else if (userRole === 'ANIMALS_ADMIN') {
        console.log('Navigating to /animal-admin');
        navigate('/animal-admin');
      } else if (userRole === 'USER') {
        console.log('Explicitly navigating to /user for USER role');
        navigate('/user');
      }else if (userRole === 'STAFF_ADMIN') {
        console.log('Navigating to /staff-calendar');
        navigate('/staff-calendar');
       
      } else {
        // Default navigation for any other/unknown role
        console.log(`Unknown or null role "${userRole}", defaulting to /user`);


        navigate('/user');
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
