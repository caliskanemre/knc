import React, {useState} from 'react';
import "./ActivitySubHeader.css";
import {ListItemIcon, Menu, MenuItem} from "@mui/material";
import {NavLink} from "react-router-dom";
import CampingIcon2 from "./camping2.jpg"
import wellness from "./wellness.jpg"
import winter from "./winter.png"
import swimming from "./swim.png"
import park from "./park.png"
import nature from "./nature2.jpg"
import naturalPark from "./nationalPark3.png"
import museumIcon from "./img_1.png"

function ActivitySubHeader() {

    const [anchorEl, setAnchorEl] = useState(null);

    const handleMouseEnter = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMouseLeave = () => {
        setAnchorEl(null);
    };


    return (
        <div>
                 <NavLink
                     to="/activities"
                     className="nav-link"
                     activeClassName="active"
                     onMouseEnter={handleMouseEnter}
                     style={{ cursor: 'pointer', color: 'black', fontSize: '1.6rem', textDecoration: 'none' }}
                >
                    Activities
                </NavLink>
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleMouseLeave}
                    onMouseLeave={handleMouseLeave}
                >
                    <MenuItem onClick={handleMouseLeave} >
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={nature} alt="Nature" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/nature" className="nav-link" activeClassName="active">
                            Nature
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={museumIcon} alt="Museum" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/museum" className="nav-link" activeClassName="active">
                            Museum
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={wellness} alt="Health" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/health" className="nav-link" activeClassName="active">
                            Health
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={winter} alt="Winter" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/winter" className="nav-link" activeClassName="active">
                            Winter
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={swimming} alt="Summer" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/summer" className="nav-link" activeClassName="active">
                            Summer
                        </NavLink>
                    </MenuItem>
                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={CampingIcon2} alt="Camping" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/camping" className="nav-link" activeClassName="active">
                            Camping
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={park} alt="Park" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/park" className="nav-link" activeClassName="active">
                            Park
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={naturalPark} alt="National Park" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/national" className="nav-link" activeClassName="active">
                            National Park
                        </NavLink>
                    </MenuItem>

                </Menu>
        </div>
    );
}

export default ActivitySubHeader;

// CSS in your stylesheet
