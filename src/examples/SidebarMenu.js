import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './SidebarMenu.css';

const SidebarMenu = ({ onMenuSelect, activeMenu }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'calendar', label: 'Team Calendar', icon: '📅' },
    { id: 'teams', label: 'Teams Channel', icon: '💬' },
    { id: 'planner', label: 'Planner Board', icon: '📋' },
    { id: 'onenote', label: 'OneNote', icon: '📝' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'focus', label: 'Areas of Focus', icon: '🎯' },
    { id: 'guidelines', label: 'Design Guidelines', icon: '📐' },
    { id: 'experts', label: 'Subject Matter Experts', icon: '👥' },
    { id: 'analytics', label: 'Operation Analytics', icon: '📊' },
    { id: 'recycle', label: 'Recycle Bin', icon: '🗑️' },
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'calendar', label: 'Team Calendar', icon: '📅' },
    { id: 'teams', label: 'Teams Channel', icon: '💬' },
    { id: 'planner', label: 'Planner Board', icon: '📋' },
    { id: 'onenote', label: 'OneNote', icon: '📝' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'focus', label: 'Areas of Focus', icon: '🎯' },
    { id: 'guidelines', label: 'Design Guidelines', icon: '📐' },
    { id: 'experts', label: 'Subject Matter Experts', icon: '👥' },
    { id: 'analytics', label: 'Operation Analytics', icon: '📊' },
    { id: 'recycle', label: 'Recycle Bin', icon: '🗑️' },
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'calendar', label: 'Team Calendar', icon: '📅' },
    { id: 'teams', label: 'Teams Channel', icon: '💬' },
    { id: 'planner', label: 'Planner Board', icon: '📋' },
    { id: 'onenote', label: 'OneNote', icon: '📝' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'focus', label: 'Areas of Focus', icon: '🎯' },
    { id: 'guidelines', label: 'Design Guidelines', icon: '📐' },
    { id: 'experts', label: 'Subject Matter Experts', icon: '👥' },
    { id: 'analytics', label: 'Operation Analytics', icon: '📊' },
    { id: 'recycle', label: 'Recycle Bin', icon: '🗑️' },
  ];

  const handleMenuClick = (menuId) => {
    if (onMenuSelect) {
      onMenuSelect(menuId);
    }
  };

  return (
    <div className={`sidebar-menu ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
          {!isCollapsed && <span>Project Team</span>}
          <button
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`toggle-icon ${isCollapsed ? 'collapsed' : ''}`}
            >
              {isCollapsed ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        </div>
        {!isCollapsed && (
          <button className="sidebar-settings" title="Settings">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
            </svg>
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <button className="sidebar-edit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>
      )}
    </div>
  );
};

SidebarMenu.propTypes = {
  onMenuSelect: PropTypes.func,
  activeMenu: PropTypes.string,
};

SidebarMenu.defaultProps = {
  onMenuSelect: () => {},
  activeMenu: 'home',
};

export default SidebarMenu;

