import React, {useEffect, useState} from 'react';
import Main from "./Main";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import EventList from "./event/EventList";
import ActivityList from "./activity/ActivityList";
import Map from "./header/Map";
import EventDetails from "./event/EventDetails";
import ActivityDetails from "./activity/ActivityDetails";
import SearchPage from "./search/SearchPage";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFnsV3";


function App() {

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Main/>}/>
                        <Route path="/events" element={<EventList/>}/>
                        <Route path="/activities" element={<ActivityList/>}/>
                        <Route path="/activities/:type" element={<ActivityList/>}/>
                        <Route path="/main" element={<Main/>}/>
                        <Route path="/map" element={<Map/>}/>
                        <Route path="/events/:eventName" element={<EventDetails/>} />
                        <Route path="/activities/detail/:id" element={<ActivityDetails/>} />
                        <Route path="/search/" element={<SearchPage/>} />
                    </Routes>
                </div>
            </Router>
        </LocalizationProvider>
    );
}

export default App;
