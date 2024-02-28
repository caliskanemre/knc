import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import SearchImage from "../search/search.png";
import ActivitySubHeader from "../activity/ActivitySubHeader";
import { Helmet } from 'react-helmet';

function Header() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();
    const keywords = "event, activity, tallinn, concert, museums, nearest, spa";

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <>
            <Helmet>
                <title>Activenty - Discover Local Events and Activities</title>
                <meta name="description" content="Discover local events and activities with Activenty! Explore concerts, outdoor adventures, and cultural experiences. Start your next adventure today." />
                <meta name="keywords" content={keywords} />
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
            </Helmet>
            <AppBar position="relative" style={{ backgroundColor: 'white' }}>
                <Toolbar className={isMobile ? 'toolbar-mobile' : ''}>
                    <Typography variant="h1" component="h1" style={{ cursor: 'pointer', color: 'darkorange', fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 'bold' }} onClick={() => handleNavigation('/')}>
                        αctiventy
                    </Typography>
                    <NavLink to="/search" className="nav-link" activeClassName="active">
                        <span className="search-desktop-image">
                            <img src={SearchImage} alt="Search events" style={{ cursor: 'pointer' }} />
                        </span>
                        <span className="search-mobile-image">
                            <i className="fas fa-search"></i>
                        </span>
                    </NavLink>
                    <NavLink to="/events" className="nav-link nav-item-mobile-hidden" activeClassName="active">
                        Events
                    </NavLink>
                    <div className="nav-item-mobile-hidden">
                        <ActivitySubHeader />
                    </div>
                    <NavLink to="/ideal-for" className="nav-link nav-item-mobile-hidden" activeClassName="active">
                        AI Assistant
                    </NavLink>
                </Toolbar>
                <Box className="sub-header">
                    <NavLink to="/events" className="nav-link nav-item" activeClassName="active">
                        Events
                    </NavLink>
                    <div>
                        <ActivitySubHeader />
                    </div>
                    <NavLink to="/ideal-for" className="nav-link nav-item" activeClassName="active">
                        AI Assistant
                    </NavLink>
                </Box>
            </AppBar>
        </>
    );
}

export default Header;
