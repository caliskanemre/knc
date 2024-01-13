import React from 'react';
import Toolbar from '@mui/material/Toolbar';
import {NavLink} from 'react-router-dom';
import AppBar from "@mui/material/AppBar";
import "./ActivitySubHeader.css";

function ActivitySubHeader() {

    return (
        <AppBar position="relative"  style={{ backgroundColor: '#f5f5f5', height: '40px' }}>
            <Toolbar className="scrollable-toolbar" >
                <NavLink to="/activities/nature"
                         className="nav-link"
                         activeClassName="active"
                         style={{ textDecoration: 'none', color: '#333333', marginLeft: '5px' , fontSize: '1.3rem' }}
                >
                    Nature
                </NavLink>
                <NavLink to="/activities/museum"
                         className="nav-link"
                         activeClassName="active"
                         style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                    Museum
                </NavLink>

                <NavLink
                    to="/activities/health"
                    className="nav-link"
                    activeClassName="active"
                    style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                    Wellness
                </NavLink>
                <NavLink
                    to="/activities/winter"
                    className="nav-link"
                    activeClassName="active"
                    style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                    Winter
                </NavLink>

                <NavLink to="/activities/summer"
                         className="nav-link"
                         activeClassName="active"
                         style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                    Summer
                </NavLink>

                <NavLink to="/activities/camping"
                         className="nav-link"
                         activeClassName="active"
                         style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                    Camping
                </NavLink>

                <NavLink to="/activities/park"
                         className="nav-link"
                         activeClassName="active"
                         style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px' , fontSize: '1.3rem' }}
                >
                    Park
                </NavLink>
                <NavLink
                    to="/activities/national"
                    className="nav-link"
                    activeClassName="active"
                    style={{ textDecoration: 'none', color: '#333333', marginLeft: '40px', fontSize: '1.3rem'  }}
                >
                    National park
                </NavLink>
            </Toolbar>
        </AppBar>
    );
}

export default ActivitySubHeader;

// CSS in your stylesheet
