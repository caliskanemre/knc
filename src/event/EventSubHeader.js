import React, {useState} from 'react';
import {NavLink} from 'react-router-dom';
import "../activity/css/ActivitySubHeader.css";
import {Menu, MenuItem} from "@mui/material";

function EventSubHeader() {


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
                to="/events"
                className="nav-link"
                activeClassName="active"
                onMouseEnter={handleMouseEnter}
                style={{cursor: 'pointer', color: 'black', fontSize: '1.4rem', textDecoration: 'none'}}
            >
                Events
            </NavLink>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMouseLeave}
                onMouseLeave={handleMouseLeave}
            >
                <MenuItem onClick={handleMouseLeave}>
                    <NavLink to="/events/music" className="nav-link" activeClassName="active">
                        Music & Concert
                    </NavLink>
                </MenuItem>

            </Menu>
        </div>
    );
}

export default EventSubHeader;
