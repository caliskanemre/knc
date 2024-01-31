import {
    Button, Checkbox,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel, MenuItem,
    Select, TextField
} from "@mui/material";
import React, {useState} from "react";
import { DatePicker } from '@mui/x-date-pickers';

const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';


export const EventFilter  = ({ openFilterDialog, handleCloseFilterDialog, type ,updateFilteredEvents, applyFilter }) => {

    const [selectedLocation, setSelectedLocation] = useState('');
    const [startDate, setStartDate] = useState(null); // State for start date
    const [endDate, setEndDate] = useState(null); // State for end date

    const handleLocationChange = (event) => {
        setSelectedLocation(event.target.value);
    };

    // Handle start date change
    const handleStartDateChange = (newValue) => {
        setStartDate(newValue);
    };

    // Handle end date change
    const handleEndDateChange = (newValue) => {
        setEndDate(newValue);
    };

    // Send request to backend with selected location as a filter
    const applyFilters = () => {
        applyFilter('location ', selectedLocation);

        if (startDate) applyFilter('startDate', startDate.toISOString().split('T')[0]);
        if (endDate) applyFilter('endDate', endDate.toISOString().split('T')[0]);
        // Assuming you have a function to make the backend call
        // replace `fetchFilteredActivities` with your actual function
        fetchFilteredActivities(selectedLocation, startDate, endDate);
        handleCloseFilterDialog(); // Close the dialog upon applying filters
    };

    const fetchFilteredActivities = (location, startDate, endDate) => {


        const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : '';
        const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';


        const urlParams = new URLSearchParams({
            page: 0,
            size: 20,
            ...(location && { location }),
            ...(type && { type }),
            ...(formattedStartDate && { start_date: formattedStartDate }),
            ...(formattedEndDate && { end_date: formattedEndDate }),
        });

        const url = `${baseURL}/events/filter?${urlParams.toString()}`;

        // Here, use the appropriate URL, HTTP method, and body to match your backend API
        fetch(url, {
            method: 'GET', // or 'POST', if required by your backend
            headers: {
                'Content-Type': 'application/json',
            },
            // If POST method: body: JSON.stringify({ location }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Filtered activities:', data.content);
                updateFilteredEvents(data.content);
                handleCloseFilterDialog();
            })
            .catch((error) => {
                console.error('Error fetching filtered activities:', error);
            });
    };

    return (
        <Dialog open={openFilterDialog} onClose={handleCloseFilterDialog}>
            <DialogTitle>Filter Activities</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Select filters to refine your activity search.
                </DialogContentText>


                <FormControl fullWidth margin="normal">
                    <InputLabel id="location-label">Location</InputLabel>
                    <Select
                        labelId="location-label"
                        id="location-select"
                        value={selectedLocation} // Set the value to the selectedLocation state
                        onChange={handleLocationChange} // Set onChange to use the handleLocationChange function
                        label="Location"
                    >
                        {/* Map through your locations and return MenuItems */}
                        <MenuItem value="Tallinn">Tallinn</MenuItem>
                        <MenuItem value="Tartu">Tartu</MenuItem>
                        <MenuItem value="Parnu">Parnu</MenuItem>
                        <MenuItem value="Narva">Narva</MenuItem>
                        <MenuItem value="Saaremaa">Saaremaa</MenuItem>
                        <MenuItem value="Hiiumaa">Hiiumaa</MenuItem>
                    </Select>


                </FormControl>


                <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />


                <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseFilterDialog} color="primary">
                    Cancel
                </Button>
                <Button onClick={applyFilters} color="primary">
                    Apply Filters
                </Button>
            </DialogActions>
        </Dialog>

    )
}