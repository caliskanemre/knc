import React, {useState} from 'react';
import "./css/ActivitySubHeader.css";
import {ListItemIcon, Menu, MenuItem} from "@mui/material";
import {NavLink} from "react-router-dom";
import CampingIcon2 from "../images/camping_summer2.jpg"
import wellness from "../images/wellness_green2.png"
import winter from "../images/winter_green.jpeg"
import swimming from "../images/summer_green3.jpg"
import park from "../images/park_green2.png"
import nature from "../images/nature2.jpg"
import naturalPark from "../images/park_green.jpg"
import museumIcon from "../images/green_museum.png"
import {useTranslation} from "react-i18next";

function ActivitySubHeader() {
    const { t, i18n } = useTranslation();
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
                     style={{ cursor: 'pointer', color: 'black', fontSize: '1.4rem', textDecoration: 'none' }}
                >
                     {t('Activities')}
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
                            {t('Kina seti')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={museumIcon} alt="Museum" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/museum" className="nav-link" activeClassName="active">
                            {t('Halay Mendili')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={wellness} alt="Health and Spa" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/health" className="nav-link" activeClassName="active">
                            {t('Tef')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={winter} alt="Winter" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/winter" className="nav-link" activeClassName="active">
                            {t('Damat ortusu')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={swimming} alt="Summer" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/summer" className="nav-link" activeClassName="active">
                            {t('Hediyelik esya')}
                        </NavLink>
                    </MenuItem>
                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={CampingIcon2} alt="Camping" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/camping" className="nav-link" activeClassName="active">
                            {t('Cicek')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={park} alt="Park" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/park" className="nav-link" activeClassName="active">
                            {t('Sus esyasi')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={naturalPark} alt="National Park" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/activities/national" className="nav-link" activeClassName="active">
                            {t('Kina Hatirasi')}
                        </NavLink>
                    </MenuItem>

                </Menu>
        </div>
    );
}

export default ActivitySubHeader;

// CSS in your stylesheet
