import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import {NavLink} from 'react-router-dom';
import {AccountCircle, PinDropOutlined} from "@mui/icons-material";
import './Header.css';
import SearchImage from "../search/search.png"
import SearchMobileImage from "../search/searchMobile.png"
import ActivitySubHeader from "../activity/ActivitySubHeader";

function Header() {

    return (
        <AppBar position="relative" style={{ backgroundColor: 'white' }}>
            <Toolbar>
                {/* Use NavLink for "activenty" to get the active styling */}
                <NavLink to="/main" className="navbar-link navbar-brand" activeClassName="active">
                    <Typography variant="h4" noWrap style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'darkorange' }}>
                        <span className="desktop-app-title">αctiventy</span>
                    </Typography>
                    <Typography style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'darkorange', marginTop:'7px' }}>
                        <span className="mobile-app-title">αctiventy</span>
                    </Typography>
                </NavLink>
                <NavLink to="/search" className="nav-link" activeClassName="active">

                    <span className="search-desktop-image">
                        <img
                        src={SearchImage}
                        alt="Search events"
                        style={{ cursor: 'pointer' }}/>
                    </span>
                    <span className="search-mobile-image">
                        <img
                        src={SearchMobileImage}
                        alt="Search events"
                        style={{ cursor: 'pointer', width: "125px", marginTop: "15px"}}/>
                    </span>
                </NavLink>

                <NavLink to="/events" className="nav-link nav-item" activeClassName="active">
                    Events
                </NavLink>
                <div>
                    <ActivitySubHeader/>
                </div>
            </Toolbar>
        </AppBar>
    );
}

export default Header;

// CSS in your stylesheet
