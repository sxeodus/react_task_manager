import React, { useState } from 'react';
import api from '../api';
import useAuth from '../hooks/useAuth';

const Register = () => {
  const { register: registerContext } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    matchPassword: '',
  });
  const [error, setError] = useState('');

  const { firstName, lastName, username, email, password, matchPassword } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== matchPassword) {
      setError('Passwords do not match');
    } else {
      try {
        const res = await api.post('/auth/register', formData);
        console.log('Registration successful:', res.data);
        
        registerContext(res.data.token);
        window.location.href = '/tasks';
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <input type="text" name="firstName" value={firstName} onChange={onChange} placeholder="First Name" required />
        <input type="text" name="lastName" value={lastName} onChange={onChange} placeholder="Last Name" required />
        <input type="text" name="username" value={username} onChange={onChange} placeholder="Username" required />
        <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required />
        <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required />
        <input type="password" name="matchPassword" value={matchPassword} onChange={onChange} placeholder="Confirm Password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;