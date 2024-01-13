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

function Header() {

    return (
        <AppBar position="relative"  className="app-bar" style={{ backgroundColor: 'white' }}>
            <Toolbar>
                {/* Use NavLink for "activenty" to get the active styling */}
                <NavLink to="/main" className="navbar-link navbar-brand" activeClassName="active">
                    <Typography variant="h4" noWrap style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'darkorange' }}>
                        <span className="desktop-app-title">αctiventy</span>
                    </Typography>
                    <Typography variant="h1" noWrap style={{ fontWeight: 'bold', fontSize: '2.5rem', color: 'darkorange' }}>
                        <span className="mobile-app-title">α</span>
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
                        style={{ cursor: 'pointer', width: "130px", marginTop: "15px"}}/>
                    </span>
                </NavLink>

                <NavLink to="/events" className="nav-link nav-item" activeClassName="active">
                    Events
                </NavLink>
                <NavLink to="/activities" className="nav-link nav-item" activeClassName="active">
                    Activities
                </NavLink>
                {/*<NavLink
                    to="/"
                    className="nav-link"
                    activeClassName="active"
                    style={{ textDecoration: 'none', color: 'black', marginLeft: '40px' , fontSize: '1.6rem' }}
                >
                    Weekend Highlights
                </NavLink>*/}

                {/*<Box sx={{ flexGrow: 1 }} />*/}

                {/* Map NavLink */}
                {/*<NavLink to="/map"  className="navbar-link navbar-icons" activeClassName="active">
                    <IconButton edge="start" aria-label="menu" style={{ color: 'black' }}>
                        <PinDropOutlined />
                    </IconButton>
                </NavLink>*/}

                {/* Account Icon */}
                {/*<IconButton aria-label="account" style={{ color: 'black' }}>
                    <AccountCircle />
                </IconButton>*/}
            </Toolbar>
        </AppBar>
    );
}

export default Header;

// CSS in your stylesheet
