import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import './login.css';
import starIcon from '../icon/star-2-svgrepo-com.svg';

// Theme Toggle Component
const ThemeToggle = () => {
  const [isDarkBlue, setIsDarkBlue] = useState(false);

  // Set initial theme to login-dark on component mount and sync the toggle state
  useEffect(() => {
    // Set the dark theme
    document.documentElement.classList.add('login-dark');
    document.documentElement.classList.remove('login-light');

    // Remove conflicting body classes
    document.body.classList.remove(
      "light-blue",
      "dark-blue",
      "light-purple",
      "dark-purple",
      "light-gradient",
      "dark-gradient"
    );

    // Ensure the toggle state matches the theme
    setIsDarkBlue(true);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;

    if (isDarkBlue) {
      root.classList.remove('login-dark');
      root.classList.add('login-light');
    } else {
      root.classList.remove('login-light');
      root.classList.add('login-dark');
    }

    setIsDarkBlue(!isDarkBlue);
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label="Toggle theme"
    >
      {isDarkBlue ? (
        <Sun className="theme-icon" size={20} />
      ) : (
        <Moon className="theme-icon" size={20} />
      )}
    </button>
  );
};

// Component to inject all styles (kept for any potential dynamic styles)
const LoginStyles = () => null;

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToForgotPassword?: () => void;
}

// Main Login Page Component
export default function LoginPage({ onLoginSuccess, onNavigateToSignup, onNavigateToForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed. Please check your credentials.');
      }

      // Store the JWT token
      localStorage.setItem('token', data.access_token);

      // Get user info
      const userResponse = await fetch('http://localhost:8000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      localStorage.setItem('user', JSON.stringify(userData));

      onLoginSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <LoginStyles />

      {/* Left Side: Branding & Info */}
      <div className="left-panel">
        <div className="animated-gradient-background" />
        <div className="left-panel-glass">
          <div className="left-panel-content">
            <div className="logo-container">
              <div className="h-16 w-16 rounded-lg flex items-center justify-center">
                <img src={starIcon} alt="Star Icon" className="h-16 w-16 text-white theme-star-icon" />
              </div>
              <p className="text-black font-bold" style={{ fontWeight: '500', fontSize: '45px', letterSpacing: '1px', color: 'var(--foreground)', fontFamily: 'Lato' }}>Spark<span className="text-black font-bold" style={{ fontWeight: '500', fontSize: '45px', color: '#ff1df0db', letterSpacing: '1px', marginLeft: '5px', fontFamily: 'Lato' }}>A</span><span className="text-black font-bold" style={{ fontWeight: '500', fontSize: '45px', color: '#007fd4ff', letterSpacing: '1px', fontFamily: 'Lato' }}>I</span></p>
            </div>
            <h2 className="subtitle">Discover. Learn. Achieve.</h2>
            <p className="description">
              Access intelligent learning tools to understand deeply, practice effectively, and master every topic.
            </p>
          </div>
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="right-panel">
        <div className="login-container">
          {/* Theme Toggle */}
          <div className="theme-toggle-container">
            <ThemeToggle />
          </div>

          {/* Mobile Header (hidden on large screens) */}
          <div className="mobile-header">
            <h2 className="mobile-subtitle">Welcome Back</h2>
          </div>

          <h3 className="login-header">Log In</h3>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="input-container">
                <span className="input-icon">
                  <Mail className="icon" />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group-spaced">
              <div className="label-container">
                <label
                  htmlFor="password"
                  className="form-label"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateToForgotPassword) {
                      onNavigateToForgotPassword();
                    }
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="input-container">
                <span className="input-icon">
                  <Lock className="icon" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input with-toggle"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="icon" />
                  ) : (
                    <Eye className="icon" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="signup-link">
            Don't have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateToSignup) {
                  onNavigateToSignup();
                } else {
                  alert('Sign up functionality not available');
                }
              }}
              style={{ color: 'var(--primary)' }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}