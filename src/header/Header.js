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

function Header() {

    return (
        <AppBar position="relative"  className="app-bar" style={{ backgroundColor: 'white' }}>
            <Toolbar>
                {/* Use NavLink for "activenty" to get the active styling */}
                <NavLink to="/main" className="navbar-link navbar-brand" activeClassName="active">
                    <Typography variant="h4" noWrap style={{ fontWeight: 'bold', fontSize: '1.5rem',color: 'darkorange'  }}>
                        αctiventy
                    </Typography>
                </NavLink>

                <NavLink
                    to="/search"
                    className="nav-link"
                    activeClassName="active"
                >
                    <img
                        src={SearchImage}
                        alt="Search events"
                        style={{ cursor: 'pointer', marginLeft: '40px', width: '380px' }} // This changes the cursor to a pointer when hovering over the image
                    />
                </NavLink>

                <NavLink
                    to="/events"
                    className="nav-link"
                    activeClassName="active"
                    style={{ textDecoration: 'none', color: 'black', marginLeft: '40px', fontSize: '1.6rem'  }}
                >
                    Events
                </NavLink>
                <NavLink
                    to="/activities"
                    className="nav-link"
                    activeClassName="active"
                    style={{ textDecoration: 'none', color: 'black', marginLeft: '40px' , fontSize: '1.6rem' }}
                >
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
