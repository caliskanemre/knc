import React, {useState} from 'react';
import "./css/ActivitySubHeader.css";
import {ListItemIcon, Menu, MenuItem} from "@mui/material";
import {NavLink} from "react-router-dom";
import flower from "../images/flower.jpg"
import tamborine from "../images/tamborine.jpg"
import ornament from "../images/ornament.jpg"
import gift from "../images/gift.jpg"
import veil from "../images/veil.jpg"
import hennaSet from "../images/hennaset.jpg"
import souvenir from "../images/souvenir.jpg"
import handkerchief from "../images/mendil.jpg"
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
                            <img src={hennaSet} alt="Nature" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/products/hennaset" className="nav-link" activeClassName="active">
                            {t('HennaSet')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={handkerchief} alt="handkerchief" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/products/handkerchief" className="nav-link" activeClassName="active">
                            {t('Handkerchief')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={tamborine} alt="tamborine" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/products/tamborine" className="nav-link" activeClassName="active">
                            {t('Tamborine')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={veil} alt="Veil" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/products/veil" className="nav-link" activeClassName="active">
                            {t('Veil')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={gift} alt="Gift" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/products/gift" className="nav-link" activeClassName="active">
                            {t('Gift')}
                        </NavLink>
                    </MenuItem>
                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={flower} alt="flower" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/products/flower" className="nav-link" activeClassName="active">
                            {t('Flower')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={ornament} alt="ornament" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/products/ornament" className="nav-link" activeClassName="active">
                            {t('Ornament')}
                        </NavLink>
                    </MenuItem>

                    <MenuItem onClick={handleMouseLeave}>
                        <ListItemIcon style={{ marginRight: '-40px' }}>
                            <img src={souvenir} alt="Souvenir" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <NavLink to="/products/souvenir" className="nav-link" activeClassName="active">
                            {t('Souvenir')}
                        </NavLink>
                    </MenuItem>

                </Menu>
        </div>
    );
}

export default ActivitySubHeader;

// CSS in your stylesheet
