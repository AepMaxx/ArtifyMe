import React, { useState, useEffect } from 'react';
import { useAppContext } from '../lib/AppContext';
import { getToken, removeToken, getTokenSubject, isTokenExpired } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme, setAuthenticated } = useAppContext();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      setUserEmail(getTokenSubject(token));
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    setAuthenticated(false);
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`profile-page ${theme}`}>
      <div className="profile-container">
        <h2 className="profile-title">Profile</h2>
        
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar">👤</div>
            <h3 className="profile-name">{userEmail}</h3>
            <p className="profile-email">{userEmail}</p>
          </div>

          <div className="profile-actions">
            <button className="action-btn theme-btn" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'} 
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            
            <button className="action-btn logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
