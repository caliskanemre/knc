import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import React, {useState} from "react";

const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';


export const ActivityFilter = ({
                                   openFilterDialog,
                                   handleCloseFilterDialog,
                                   type,
                                   updateFilteredActivities,
                                   applyFilter
                               }) => {

    const [selectedLocation, setSelectedLocation] = useState('');

    const handleLocationChange = (event) => {
        setSelectedLocation(event.target.value);
    };


    const applyFilters = () => {
        applyFilter('location ', selectedLocation);

        fetchFilteredActivities(selectedLocation);
        handleCloseFilterDialog(); // Close the dialog upon applying filters
    };

    const fetchFilteredActivities = (location) => {

        // Update the URL to include date range parameters
        const url = `${baseURL}/activities/location/${location}/${type}?page=0&size=20`;

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
                        {/* Add other locations here */}
                    </Select>

                </FormControl>
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