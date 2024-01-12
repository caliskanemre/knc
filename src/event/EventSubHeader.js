import React from 'react';
import Toolbar from '@mui/material/Toolbar';
import {NavLink} from 'react-router-dom';
import AppBar from "@mui/material/AppBar";
import "../activity/ActivitySubHeader.css";

function EventSubHeader() {

    return (
        <AppBar position="relative"  style={{ backgroundColor: '#f5f5f5', height: '40px' }}>
            <Toolbar style={{ alignItems: 'flex-start', paddingTop: '5px' }}>
                <NavLink to="events/music"
                         className="nav-link"
                         activeClassName="active"
                         style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                    Music
                </NavLink>

                <NavLink to="events/business"
                         className="nav-link"
                         activeClassName="active"
                         style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                    Business
                </NavLink>

                <NavLink
                    to="events/food-drink"
                    className="nav-link"
                    activeClassName="active"
                    style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px', fontSize: '1.3rem'  }}
                >
                    Food & Drink
                </NavLink>
                <NavLink
                    to="events/performance"
                    className="nav-link"
                    activeClassName="active"
                    style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                    Performance & Visual Arts
                </NavLink>
                <NavLink
                    to="events/sport"
                    className="nav-link"
                    activeClassName="active"
                    style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                   Sports
                </NavLink>

                <NavLink to="events/charity"
                         className="nav-link"
                         activeClassName="active"
                         style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                    Charity & Causes
                </NavLink>
            </Toolbar>
        </AppBar>
    );
}

export default EventSubHeader;

// CSS in your stylesheet
