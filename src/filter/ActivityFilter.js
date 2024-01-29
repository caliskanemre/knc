import {
    Button, Checkbox,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel, MenuItem,
    Select
} from "@mui/material";
import React, {useState} from "react";
const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';


export const ActivityFilter  = ({ openFilterDialog, handleCloseFilterDialog, type ,updateFilteredActivities}) => {

    const [selectedLocation, setSelectedLocation] = useState('');

    // Handle location selection change
    const handleLocationChange = (event) => {
        setSelectedLocation(event.target.value);
    };

    // Send request to backend with selected location as a filter
    const applyFilters = () => {
        // Assuming you have a function to make the backend call
        // replace `fetchFilteredActivities` with your actual function
        fetchFilteredActivities(selectedLocation);
        handleCloseFilterDialog(); // Close the dialog upon applying filters
    };

    const fetchFilteredActivities = (location) => {
        // Here, use the appropriate URL, HTTP method, and body to match your backend API
        fetch(`${baseURL}/activities/location/${location}/${type}?page=0&size=20`, {
            method: 'GET', // or 'POST', if required by your backend
            headers: {
                'Content-Type': 'application/json',
            },
            // If POST method: body: JSON.stringify({ location }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Filtered activities:', data.content);
                updateFilteredActivities(data.content);
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

                {/* Filter by Location */}
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
                        <MenuItem value="Saaremaa">Saaremaa</MenuItem>
                        <MenuItem value="Hijumaa">Hijumaa</MenuItem>
                        {/* Add other locations here */}
                    </Select>
                </FormControl>

                {/* Additional filter options can be added here */}

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