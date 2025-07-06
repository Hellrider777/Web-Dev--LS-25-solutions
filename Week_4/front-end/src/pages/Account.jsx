import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import './Account.css';

const Account = () => {
  const [user, setUser] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
    
    // Set mode based on URL
    if (location.pathname === '/register') {
      setIsLoginMode(false);
    } else {
      setIsLoginMode(true);
    }
  }, [location.pathname]);

  const checkAuthStatus = async () => {
    try {
      // Check localStorage first
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      }

      // Check with backend
              const response = await fetch('http://localhost:8000/api/current-user/', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
              await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const toggleMode = (loginMode) => {
    setIsLoginMode(loginMode);
    if (loginMode) {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  if (loading) {
    return (
      <div className="account-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // User is logged in - show profile
    return (
      <div className="account-page">
        <div className="account-profile">
          <div className="profile-header">
            <div className="profile-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="profile-info">
              <h2>Welcome back, {user.full_name || user.username}!</h2>
              <p className="username">@{user.username}</p>
              <p className="email">{user.email}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className="action-button primary"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-tachometer-alt"></i>
              View Dashboard
            </button>
            
            <button 
              className="action-button secondary"
              onClick={() => navigate('/upload')}
            >
              <i className="fas fa-upload"></i>
              Upload Video
            </button>
            
            <button 
              className="action-button danger"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              Sign Out
            </button>
          </div>

          <div className="account-stats">
            <h3>Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <i className="fas fa-video"></i>
                <span>Videos</span>
                <strong>0</strong>
              </div>
              <div className="stat-item">
                <i className="fas fa-eye"></i>
                <span>Views</span>
                <strong>0</strong>
              </div>
              <div className="stat-item">
                <i className="fas fa-heart"></i>
                <span>Likes</span>
                <strong>0</strong>
              </div>
              <div className="stat-item">
                <i className="fas fa-users"></i>
                <span>Subscribers</span>
                <strong>0</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is not logged in - show auth forms
  return (
    <div className="account-page">
      <div className="auth-toggle">
        <button 
          className={`toggle-btn ${isLoginMode ? 'active' : ''}`}
          onClick={() => toggleMode(true)}
        >
          Sign In
        </button>
        <button 
          className={`toggle-btn ${!isLoginMode ? 'active' : ''}`}
          onClick={() => toggleMode(false)}
        >
          Sign Up
        </button>
      </div>

      {isLoginMode ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Register onRegister={handleRegister} />
      )}
    </div>
  );
};

export default Account; 