import {Button} from "@mui/material";

const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

const EventSearchButtons = ({handleNewSearch, updateFilteredEvents, setSearchQuery}) => {
    const getTodayDate = () => {
        // Implement the function or import it if defined elsewhere
        return new Date().toISOString().split('T')[0];
    };


    const handleButtonClick = (term) => {
            setSearchQuery(term);
            handleNewSearch(term);
    };

    const callFilter = (startDay, endDay) => {
        if (startDay && endDay) {
            const options = {
                page: 0,
                size: 20,
                start_date: startDay,
                end_date: endDay,
            };

            const fetchEvents = async () => {
                const urlParams = new URLSearchParams(options);

                const url = `${baseURL}/events/filter?${urlParams.toString()}`;

                try {
                    const response = await fetch(url, {
                        method: 'GET', // Use 'POST' if required by your backend
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        // If POST method: body: JSON.stringify({ location }),
                    });
                    const data = await response.json();
                    console.log('Filtered events:', data.content);
                    updateFilteredEvents(data.content); // Make sure this function is provided as a prop
                } catch (error) {
                    console.error('Error fetching filtered events:', error);
                }
            };
            fetchEvents();
        }
    }
};

export default EventSearchButtons;