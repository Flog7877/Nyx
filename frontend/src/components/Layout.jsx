import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="layout-container">
            <Header onBurgerClick={handleToggleSidebar} />
            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isCollapsed}
            />
            <div className={`layout-main-content ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                <div className="page-container">
                    {children}
                </div>
            </div>

        </div>
    );
};

export default Layout;
