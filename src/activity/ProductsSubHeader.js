import React, { useState } from 'react';
import "./css/ActivitySubHeader.css";
import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import { NavLink } from "react-router-dom";
import flower from "../images/flower.jpg";
import tamborine from "../images/tamborine.jpg";
import ornament from "../images/ornament.jpg";
import gift from "../images/gift.jpg";
import veil from "../images/veil.jpg";
import hennaSet from "../images/hennaset.jpg";
import souvenir from "../images/souvenir.jpg";
import handkerchief from "../images/mendil.jpg";
import { useTranslation } from "react-i18next";

function ProductsSubHeader() {
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
            >
                {t('Products')}
            </NavLink>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMouseLeave}
                onMouseLeave={handleMouseLeave}
                PaperProps={{
                    sx: {
                        border: '1px solid #8B0000',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        bgcolor: 'white',
                        '& .MuiMenuItem-root': {
                            color: 'black',
                            fontFamily: "'Lora', serif !important",
                            padding: '8px 16px',
                            '&:hover': {
                                bgcolor: '#f5f5f5',
                                color: '#8B0000',
                            },
                        },
                    },
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
                <MenuItem onClick={handleMouseLeave}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                        <img src={hennaSet} alt="Henna Set" style={{ width: '24px', height: '24px' }} />
                    </ListItemIcon>
                    <NavLink to="/products/hennaset" className="nav-link" activeClassName="active">
                        {t('HennaSet')}
                    </NavLink>
                </MenuItem>

                <MenuItem onClick={handleMouseLeave}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                        <img src={handkerchief} alt="Handkerchief" style={{ width: '24px', height: '24px' }} />
                    </ListItemIcon>
                    <NavLink to="/products/handkerchief" className="nav-link" activeClassName="active">
                        {t('Handkerchief')}
                    </NavLink>
                </MenuItem>

                <MenuItem onClick={handleMouseLeave}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                        <img src={tamborine} alt="Tambourine" style={{ width: '24px', height: '24px' }} />
                    </ListItemIcon>
                    <NavLink to="/products/tamborine" className="nav-link" activeClassName="active">
                        {t('Tambourine')}
                    </NavLink>
                </MenuItem>

                <MenuItem onClick={handleMouseLeave}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                        <img src={veil} alt="Veil" style={{ width: '24px', height: '24px' }} />
                    </ListItemIcon>
                    <NavLink to="/products/veil" className="nav-link" activeClassName="active">
                        {t('Veil')}
                    </NavLink>
                </MenuItem>

                <MenuItem onClick={handleMouseLeave}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                        <img src={gift} alt="Gift" style={{ width: '24px', height: '24px' }} />
                    </ListItemIcon>
                    <NavLink to="/products/gift" className="nav-link" activeClassName="active">
                        {t('Gift')}
                    </NavLink>
                </MenuItem>

                <MenuItem onClick={handleMouseLeave}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                        <img src={ornament} alt="Ornament" style={{ width: '24px', height: '24px' }} />
                    </ListItemIcon>
                    <NavLink to="/products/ornament" className="nav-link" activeClassName="active">
                        {t('Ornament')}
                    </NavLink>
                </MenuItem>

                <MenuItem onClick={handleMouseLeave}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
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

export default ProductsSubHeader;
