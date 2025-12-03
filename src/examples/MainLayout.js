import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import SidebarMenu from './SidebarMenu';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarRef = useRef(null);

  const handleMenuSelect = (menuId) => {
    setActiveMenu(menuId);
    console.log('Menu selected:', menuId);
  };

  // Detect sidebar collapse state
  useEffect(() => {
    const checkSidebarState = () => {
      if (sidebarRef.current) {
        const sidebarElement = sidebarRef.current.querySelector('.sidebar-menu');
        if (sidebarElement) {
          const isCollapsed = sidebarElement.classList.contains('collapsed');
          setIsSidebarCollapsed(isCollapsed);
        }
      }
    };

    // Use MutationObserver to watch for class changes
    const observer = new MutationObserver(checkSidebarState);
    if (sidebarRef.current) {
      const sidebarElement = sidebarRef.current.querySelector('.sidebar-menu');
      if (sidebarElement) {
        observer.observe(sidebarElement, {
          attributes: true,
          attributeFilter: ['class'],
        });
      }
    }

    // Initial check
    checkSidebarState();

    // Also check periodically as fallback
    const interval = setInterval(checkSidebarState, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="main-layout">
      <div ref={sidebarRef}>
        <SidebarMenu onMenuSelect={handleMenuSelect} activeMenu={activeMenu} />
      </div>
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ height: '100vh', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
