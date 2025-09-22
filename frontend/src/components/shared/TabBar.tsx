import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../lib/AppContext';
import './TabBar.css';

const TabBar: React.FC = () => {
  const { theme } = useAppContext();

  const tabs = [
    {
      path: '/',
      icon: '🖼️',
      label: 'Gallery'
    },
    {
      path: '/create',
      icon: '✏️',
      label: 'Create'
    },
    {
      path: '/profile',
      icon: '👤',
      label: 'Profile'
    }
  ];

  return (
    <nav className={`tab-bar ${theme}`}>
      <div className="tab-bar-content">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => 
              `tab-item ${isActive ? 'active' : ''}`
            }
          >
            <div className="tab-icon">{tab.icon}</div>
            <span className="tab-label">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default TabBar;
