import React, { useState } from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, Box, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { NavLink } from 'react-router-dom';
import { useTranslation } from "react-i18next";

// Import your images
import flower from "../images/flower.jpg";
import tamborine from "../images/tamborine.jpg";
import ornament from "../images/ornament.jpg";
import gift from "../images/gift.jpg";
import veil from "../images/veil.jpg";
import hennaSet from "../images/hennaset.jpg";
import souvenir from "../images/souvenir.jpg";
import handkerchief from "../images/mendil.jpg";

function ActivityMenu() {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);

    // Handlers to open/close menu
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box
            onMouseEnter={handleMenuOpen}
            onMouseLeave={handleMenuClose}
            sx={{ position: 'relative', display: 'inline-block' }}
        >
            {/* The "Activities" trigger, can be a button, text, or icon */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                }}
            >
                <Typography
                    sx={{
                        color: '#5D4037',
                        fontWeight: 'bold',
                        marginRight: '4px'
                    }}
                >
                    {t('Activities')}
                </Typography>
                <ArrowDropDownIcon sx={{ color: '#5D4037' }}/>
            </Box>

            {/* Menu - opens on hover */}
            <Menu
                id="activity-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                // The MenuListProps onMouseLeave ensures the menu closes if the user leaves the area
                MenuListProps={{
                    onMouseLeave: handleMenuClose,
                    style: {
                        padding: '0.5rem 0',
                        // You can customize styling here
                    }
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <MenuItem
                    component={NavLink}
                    to="/products/hennaSet"
                    onClick={handleMenuClose}
                >
                    <ListItemIcon>
                        <img
                            src={hennaSet}
                            alt="hennaSet"
                            style={{ width: '24px', height: '24px' }}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('Henna Set')} />
                </MenuItem>

                <MenuItem
                    component={NavLink}
                    to="/products/handkerchief"
                    onClick={handleMenuClose}
                >
                    <ListItemIcon>
                        <img
                            src={handkerchief}
                            alt="handkerchief"
                            style={{ width: '24px', height: '24px' }}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('Handkerchief')} />
                </MenuItem>

                <MenuItem
                    component={NavLink}
                    to="/products/tamborine"
                    onClick={handleMenuClose}
                >
                    <ListItemIcon>
                        <img
                            src={tamborine}
                            alt="tamborine"
                            style={{ width: '24px', height: '24px' }}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('Tamborine')} />
                </MenuItem>

                <MenuItem
                    component={NavLink}
                    to="/products/ornament"
                    onClick={handleMenuClose}
                >
                    <ListItemIcon>
                        <img
                            src={ornament}
                            alt="ornament"
                            style={{ width: '24px', height: '24px' }}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('Ornament')} />
                </MenuItem>

                <MenuItem
                    component={NavLink}
                    to="/products/gift"
                    onClick={handleMenuClose}
                >
                    <ListItemIcon>
                        <img
                            src={gift}
                            alt="gift"
                            style={{ width: '24px', height: '24px' }}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('Gift')} />
                </MenuItem>

                <MenuItem
                    component={NavLink}
                    to="/products/flower"
                    onClick={handleMenuClose}
                >
                    <ListItemIcon>
                        <img
                            src={flower}
                            alt="flower"
                            style={{ width: '24px', height: '24px' }}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('Flower')} />
                </MenuItem>

                <MenuItem
                    component={NavLink}
                    to="/products/veil"
                    onClick={handleMenuClose}
                >
                    <ListItemIcon>
                        <img
                            src={veil}
                            alt="veil"
                            style={{ width: '24px', height: '24px' }}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('Veil')} />
                </MenuItem>

                <MenuItem
                    component={NavLink}
                    to="/products/souvenir"
                    onClick={handleMenuClose}
                >
                    <ListItemIcon>
                        <img
                            src={souvenir}
                            alt="souvenir"
                            style={{ width: '24px', height: '24px' }}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t('Souvenir')} />
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default ActivityMenu;
