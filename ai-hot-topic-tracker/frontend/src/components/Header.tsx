import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🤖</span>
          <h1>AI Hot Topic Tracker</h1>
        </div>
        <div className="header-info">
          <span className="status-indicator"></span>
          <span>Connected</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
