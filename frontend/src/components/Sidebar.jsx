import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../AuthContext';
import {
    TimerIcon1,
    SettingsIcon,
    HomeIcon,
    CategoriesIcon,
    StatisticsIcon,
    QuestionmarkIcon
} from '../assets/icons/icons';

const menuItems = [
    {
        label: 'Home',
        icon: <HomeIcon width="20px" />,
        path: '/',
        needsAuth: false,
    },
    {
        label: 'Timer',
        icon: <TimerIcon1 width="20px" />,
        path: '/timer',
        needsAuth: true,
    },
    {
        label: 'Kategorien',
        icon: <CategoriesIcon width="20px" />,
        path: '/categories',
        needsAuth: true,
    },
    {
        label: 'Statistiken',
        icon: <StatisticsIcon width="20px" />,
        path: '/statistics',
        needsAuth: true,
    },
    {
        label: 'Einstellungen',
        icon: <SettingsIcon width="20px" />,
        path: '/settings',
        needsAuth: false,
    },
    {
        label: 'Hilfe',
        icon: <QuestionmarkIcon width="20px" />,
        path: '/support',
        needsAuth: false,
    },
];

function Sidebar({ isOpen, isCollapsed }) {
    const { user } = useAuthContext();
    const visibleItems = menuItems.filter(item => {
        if (item.needsAuth && !user) return false;
        return true;
    });
    const sidebarClass = [
        'sidebar',
        isOpen ? 'sidebar-open' : '',
        isCollapsed ? 'sidebar-collapsed' : '',
    ].join(' ');

    return (
        <nav className={sidebarClass}>
            <ul className="sidebar-menu">
                {visibleItems.map((item) => (
                    <li key={item.label}>
                        <Link to={item.path} className="sidebar-link">
                            <div className="sidebar-icon">
                                {item.icon}
                            </div>
                            {!isCollapsed &&
                                <div className="sidebar-label-container">
                                    <span className="sidebar-text">{item.label}</span>
                                </div>
                            }
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Sidebar;
