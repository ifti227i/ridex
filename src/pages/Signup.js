import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserService from '../Services/UserService';
import '../styles/Auth.css';

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validations, setValidations] = useState({
    fullName: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    phoneNumber: { isValid: false, message: '' },
    password: { isValid: false, message: '', strength: '' }
  });

  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return {
          isValid: value.trim().length >= 2,
          message: value.trim().length >= 2 ? '✓ Valid name' : 'Name is too short'
        };
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(value),
          message: emailRegex.test(value) ? '✓ Valid email' : 'Invalid email format'
        };
      case 'phoneNumber':
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return {
          isValid: phoneRegex.test(value),
          message: phoneRegex.test(value) ? '✓ Valid phone number' : 'Invalid phone number'
        };
      case 'password':
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        const mediumRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{6,})/;
        let strength = '';
        let isValid = false;
        let message = '';

        if (strongRegex.test(value)) {
          strength = 'strong';
          isValid = true;
          message = '✓ Strong password';
        } else if (mediumRegex.test(value)) {
          strength = 'medium';
          isValid = true;
          message = 'Password is moderate';
        } else if (value.length >= 6) {
          strength = 'weak';
          isValid = true;
          message = 'Password is weak';
        } else {
          strength = 'weak';
          message = 'Password is too weak';
        }
        return { isValid, message, strength };
      default:
        return { isValid: false, message: '' };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const validation = validateField(name, value);
    setValidations(prev => ({
      ...prev,
      [name]: validation
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!Object.values(validations).every(v => v.isValid)) {
      setError('Please fill all fields correctly');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await UserService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      });
      navigate('/login', {
        state: { message: 'Registration successful! Please login.' }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>Join RideShareX</h1>
          <p>Create an account to get started</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <span className="input-icon">👤</span>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <span className="input-icon">✉️</span>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <span className="input-icon">📱</span>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <span className="input-icon">🔒</span>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <span className="input-icon">🔒</span>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Creating Account
                <span className="spinner"></span>
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="social-login">
            <button type="button" className="social-button">
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
              />
              Sign up with Google
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
