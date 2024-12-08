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
import {useTranslation} from "react-i18next";

function ActivitySubHeaderMobile() {
    const [open, setOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <List component="nav">
            <ListItem button onClick={handleClick}>
                <ListItemText primary={t('Activities')}  primaryTypographyProps={{ style: { fontSize: '1.2rem' } }}/>

            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItem button component={NavLink} to="/activities/nature">
                        <ListItemIcon>
                            <img src={nature} alt="Nature" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Nature')} style={{ marginLeft: '-16px' }}/>
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/museum">
                        <ListItemIcon>
                            <img src={museumIcon} alt="Museum" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Museum')} style={{ marginLeft: '-16px' }}/>
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/health">
                        <ListItemIcon>
                            <img src={wellness} alt="Health and Spa" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Health')} style={{ marginLeft: '-16px' }}/>
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/winter">
                        <ListItemIcon>
                            <img src={winter} alt="Winter" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Winter')} style={{ marginLeft: '-16px' }}/>
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/summer">
                        <ListItemIcon>
                            <img src={swimming} alt="Summer" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Summer')} style={{ marginLeft: '-16px' }} />
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/camping">
                        <ListItemIcon>
                            <img src={CampingIcon2} alt="Camping" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Camping')} style={{ marginLeft: '-16px' }}/>
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/park">
                        <ListItemIcon>
                            <img src={park} alt="Park" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Park')} style={{ marginLeft: '-16px' }}/>
                    </ListItem>
                    <ListItem button component={NavLink} to="/activities/national-park">
                        <ListItemIcon>
                            <img src={naturalPark} alt="National Park" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('National Park')} style={{ marginLeft: '-16px' }}/>
                    </ListItem>
                </List>
            </Collapse>
        </List>
    );
}

export default ActivitySubHeaderMobile;
