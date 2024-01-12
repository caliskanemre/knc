import React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import EventIcon from '@mui/icons-material/Event';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

function Footer({ dataType, handleSwitchData }) {
    return (
        <BottomNavigation
            value={dataType}
            onChange={(event, newValue) => {
                handleSwitchData(newValue);
            }}
        >
            <BottomNavigationAction label="Events" value="events" icon={<EventIcon />} />
            <BottomNavigationAction label="Activities" value="activities" icon={<DirectionsWalkIcon />} />
        </BottomNavigation>
    );
}

export default Footer;
