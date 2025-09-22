import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../lib/AppContext';
import RainbowTitle from './RainbowTitle';
import './Header.css';

const Header: React.FC = () => {
  const { theme } = useAppContext();

  return (
    <header className={`header ${theme}`}>
      <div className="header-content">
        <Link to="/about" className="header-link">
          <div className="header-title">
            <RainbowTitle titleText="ArtifyMe" />
            <div className="art-icon">🎨</div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
