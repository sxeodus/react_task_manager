import React, { useState } from 'react';
import api from '../api';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login: loginContext } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      console.log('Login successful:', res.data);
      
      await loginContext(res.data.token);
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const googleSuccess = async (res) => {
    const idToken = res.credential;
    try {
      const response = await api.post('/auth/googlelogin', { idToken });
      await loginContext(response.data.token);
      navigate('/tasks');
    } catch (error) {
      console.error(error);
      setError('Google Login Failed');
    }
  };

  const googleFailure = (error) => {
    console.error(error);
    setError('Google Login was unsuccessful. Try again later');
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required />
        <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required />
        <button type="submit">Login</button>
        <hr />
        <GoogleLogin
            onSuccess={googleSuccess}
            onError={googleFailure}
        />
      </form>
    </div>
  );
};

export default Login;