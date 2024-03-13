import React, { useState } from 'react';
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';
import "./css/ActivitySubHeader.css";
import CampingIcon2 from "../images/camping_summer2.jpg";
import wellness from "../images/wellness_green2.png";
import winter from "../images/winter_green.jpeg";
import swimming from "../images/summer_green3.jpg";
import park from "../images/park_green2.png";
import nature from "../images/nature2.jpg";
import naturalPark from "../images/park_green.jpg";
import museumIcon from "../images/green_museum.png";

function ActivitySubHeaderMobile() {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <List component="nav">
            <ListItem button onClick={handleClick}>
                <ListItemText primary="Activities" />
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItem button component={NavLink} to="/activities/nature">
                        <ListItemIcon>
                            <img src={nature} alt="Nature" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary="Nature" />
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/museum">
                        <ListItemIcon>
                            <img src={museumIcon} alt="Museum" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary="Museum" />
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/health">
                        <ListItemIcon>
                            <img src={wellness} alt="Health and Spa" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary="Health & Spa" />
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/winter">
                        <ListItemIcon>
                            <img src={winter} alt="Winter" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary="Winter" />
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/summer">
                        <ListItemIcon>
                            <img src={swimming} alt="Summer" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary="Summer" />
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/camping">
                        <ListItemIcon>
                            <img src={CampingIcon2} alt="Camping" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary="Camping" />
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/park">
                        <ListItemIcon>
                            <img src={park} alt="Park" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary="Park Visits" />
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/national-park">
                        <ListItemIcon>
                            <img src={naturalPark} alt="National Park" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary="National Parks" />
                    </ListItem>
                </List>
            </Collapse>
        </List>
    );
}

export default ActivitySubHeaderMobile;
