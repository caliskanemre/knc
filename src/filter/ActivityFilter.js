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
import React from "react";


export const ActivityFilter  = ({ openFilterDialog, handleCloseFilterDialog }) => {

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
                        label="Location"
                        // value={selectedLocation} // state to handle selected location
                        // onChange={handleLocationChange} // function to update selected location
                    >
                        {/* Map through your locations and return MenuItems */}
                        {/* {locations.map((location) => (
                    <MenuItem key={location.value} value={location.value}>
                        {location.label}
                    </MenuItem>
                ))} */}
                        <MenuItem value="location1">Location 1</MenuItem>
                        <MenuItem value="location2">Location 2</MenuItem>
                        {/* Add other locations here */}
                    </Select>
                </FormControl>

                {/* Filter by Nearby */}
                <FormControlLabel
                    control={
                        <Checkbox
                            // checked={isNearby} // state to handle 'nearby' checkbox
                            // onChange={handleNearbyChange} // function to update 'nearby' checkbox
                            name="nearby"
                        />
                    }
                    label="Nearby Activities"
                />

                {/* Additional filter options can be added here */}

            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseFilterDialog} color="primary">
                    Cancel
                </Button>
                <Button color="primary">
                    Apply Filters
                </Button>
            </DialogActions>
        </Dialog>

    )
}