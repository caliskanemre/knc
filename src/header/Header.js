import React, {useEffect, useState} from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {NavLink, useNavigate} from 'react-router-dom';
import './Header.css';
import SearchImage from "../search/search.png"
import ActivitySubHeader from "../activity/ActivitySubHeader";
import { Helmet } from 'react-helmet';
function Header() {

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();

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
                    <link rel="canonical" href="http://www.activenty.com" />
                </Helmet>
            <AppBar position="relative" style={{ backgroundColor: 'white' }}>
                <Toolbar className={isMobile ? 'toolbar-mobile' : ''}>
                    {/* Use NavLink for "activenty" to get the active styling */}
                    <div onClick={() => handleNavigation('/main')} style={{ cursor: 'pointer', display: 'flex', flexGrow: isMobile ? 1 : 0 }}>
                        <Typography variant="h4" noWrap style={{ fontWeight: 'bold', fontSize: '2rem', color: 'darkorange', marginTop: '7px' }}>
                           {/* <span className={isMobile ? "large-letter-mobile" : "large-letter-desktop"}>α</span>*/}
                            <span className={isMobile ? "mobile-app-title" : "desktop-app-title"}>αctiventy</span>
                        </Typography>
                    </div>
                    <NavLink to="/search" className="nav-link" activeClassName="active">

                        <span className="search-desktop-image">
                            <img
                            src={SearchImage}
                            alt="Search events"
                            style={{ cursor: 'pointer' }}/>
                        </span>
                        <span className="search-mobile-image">
                            <i className="fas fa-search"></i>
                        </span>
                    </NavLink>

                    <NavLink to="/events" className="nav-link nav-item-mobile-hidden" activeClassName="active">
                        Events
                    </NavLink>
                    <div className="nav-item-mobile-hidden">
                        <ActivitySubHeader/>
                    </div>
                </Toolbar>

                <Box className="sub-header">
                    <NavLink to="/events" className="nav-link nav-item" activeClassName="active">
                        Events
                    </NavLink>
                    <div>
                        <ActivitySubHeader/>
                    </div>
                </Box>
            </AppBar>
        </>
    );
}

export default Header;

// CSS in your stylesheet
