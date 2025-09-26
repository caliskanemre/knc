/*
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';
import React, { useState } from 'react';
import "./css/ActivitySubHeader.css";

import tamborine from "../images/tamborine.jpg"
import ornament from "../images/ornament.jpg"
import gift from "../images/gift.jpg"
import veil from "../images/veil.jpg"
import hennaSet from "../images/hennaset.jpg"
import souvenir from "../images/souvenir.jpg"
import handkerchief from "../images/mendil.jpg"
import {useTranslation} from "react-i18next";

function ProductsSubHeaderMobile() {
    const [open, setOpen] = useState(true);
    const { t } = useTranslation();

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
                    <ListItem button component={NavLink} to="/products/hennaSet">
                        <ListItemIcon>
                            <img src={hennaSet} alt="hennaSet" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('HennaSet')}/>
                    </ListItem>
                    <ListItem button component={NavLink} to="/products/handkerchief">
                        <ListItemIcon>
                            <img src={handkerchief} alt="handkerchief" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Handkerchief')} />
                    </ListItem>
                    <ListItem button component={NavLink} to="/products/tamborine">
                        <ListItemIcon>
                            <img src={tamborine} alt="tamborine" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Tambourine')}/>
                    </ListItem>
                    <ListItem button component={NavLink} to="/products/ornament">
                        <ListItemIcon>
                            <img src={ornament} alt="Ornament" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Ornament')} />
                    </ListItem>
                    <ListItem button component={NavLink} to="/products/gift">
                        <ListItemIcon>
                            <img src={gift} alt="Gift" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Gift')} />
                    </ListItem>
                    <ListItem button component={NavLink} to="/products/veil">
                        <ListItemIcon>
                            <img src={veil} alt="Veil" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Veil')}/>
                    </ListItem>
                    <ListItem button component={NavLink} to="/products/souvenir">
                        <ListItemIcon>
                            <img src={souvenir} alt="Souvenir" style={{ width: '24px', height: '24px' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('Souvenir')} />
                    </ListItem>
                </List>
            </Collapse>
        </List>
    );
}

export default ProductsSubHeaderMobile;
*/
