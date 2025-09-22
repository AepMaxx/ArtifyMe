import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './shared/Header';
import TabBar from './shared/TabBar';
import { useAppContext } from '../lib/AppContext';
import './Layout.css';

const Layout: React.FC = () => {
  const { theme } = useAppContext();

  return (
    <div className={`layout ${theme}`}>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
};

export default Layout;
