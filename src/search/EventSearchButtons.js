import {Button} from "@mui/material";
import {useEffect, useState} from "react";
import {getTodayDate} from "@mui/x-date-pickers/internals";

const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

const EventSearchButtons = ({ updateFilteredEvents }) => {

    const getTodayDate = () => {
        // Implement the function or import it if defined elsewhere
        return new Date().toISOString().split('T')[0];
    };

    const getWeekendStartDay = () => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
        const daysUntilNextSaturday = (6 - dayOfWeek + 7) % 7 || 7; // If today is Saturday, use next Saturday

        const nextSaturday = new Date(now);
        nextSaturday.setDate(now.getDate() + daysUntilNextSaturday);

        return nextSaturday.toISOString().split('T')[0];
    };

    const getWeekendEndDay = () => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
        const daysUntilNextSunday = (7 - dayOfWeek + 7) % 7 || 7; // If today is Sunday, use next Sunday

        const nextSunday = new Date(now);
        nextSunday.setDate(now.getDate() + daysUntilNextSunday);

        return nextSunday.toISOString().split('T')[0];
    };

    const handleButtonClick = (term) => {
        if (term === 'Today') {
            const today = getTodayDate();
            callFilter(today, today)
        }
        else if(term === 'This weekend'){
            const startDay = getWeekendStartDay()
            const endDay = getWeekendEndDay()
            callFilter(startDay, endDay)
        }
    };

   const callFilter = (startDay,endDay) => {
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

    return (
        <div className="filters">
            <Button onClick={() => handleButtonClick('Today')}>Today</Button>
            <Button onClick={() => handleButtonClick('This weekend')}>This weekend</Button>
            <Button onClick={() => handleButtonClick('Music')}>Music</Button>
            <Button onClick={() => handleButtonClick('Food & Drink')}>Food & Drink </Button>
        </div>
    );
};

export default EventSearchButtons;