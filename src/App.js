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
import {CookieConsent} from "react-cookie-consent";


function App() {

    const handleAccept = () => {
        // Example: Update Google Analytics consent
        window.dataLayer = window.dataLayer || [];

        // Define a function to utilize window.dataLayer for pushing messages
        function gtag() {
            window.dataLayer.push(arguments);
        }

        // Update consent configuration for Google Analytics using gtag
        gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted',
            functionality_storage: 'granted',
            personalization_storage: 'granted',
            security_storage: 'granted',
        });

    };



    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Main/>}/>
                        <Route path="/events" element={<EventList/>}/>
                        <Route path="/activities" element={<ActivityList/>}/>
                        <Route path="/activities/:type" element={<ActivityList/>}/>
                        <Route path="/" element={<Main/>}/>
                        <Route path="/map" element={<Map/>}/>
                        <Route path="/events/:eventId/:eventName" element={<EventDetails/>} />
                        <Route path="/activities/detail/:id/:title" element={<ActivityDetails/>} />
                        <Route path="/search/" element={<SearchPage/>} />
                    </Routes>

                    <CookieConsent
                        onAccept={handleAccept}
                        location="bottom"
                        buttonText="Accept"
                        declineButtonText="Decline"
                        cookieName="activentyUserConsent"
                        style={{ background: "#2B373B" }}
                        buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
                        declineButtonStyle={{ fontSize: "13px" }}
                        expires={150}
                    >
                        This website uses cookies to enhance the user experience.{" "}
                    </CookieConsent>
                </div>
            </Router>
        </LocalizationProvider>
    );
}

export default App;
