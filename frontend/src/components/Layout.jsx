import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';
import useIsMobile from '../hooks/useIsMobile';

const Layout = ({ children }) => {
    const isMobile = useIsMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
            setIsCollapsed(false);
        } else {
            setIsSidebarOpen(true);
            setIsCollapsed(false);
        }
    }, [isMobile]);

    useEffect(() => {
        if (isMobile && isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobile, isSidebarOpen]);


    const handleToggleSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            setIsSidebarOpen(!isSidebarOpen);
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div className="layout-container">
            <Header onBurgerClick={handleToggleSidebar} />
            {isMobile && isSidebarOpen && (
                <div
                    className="mobile-sidebar-overlay"
                    onClick={handleToggleSidebar}
                />
            )}
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
