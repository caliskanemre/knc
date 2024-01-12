import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import Axios from "axios";
import Header from "../header/Header";
import MapForActivity from "./MapForActivity";
import BackgroundGallery from "../BackgroundGallery";

const ActivityDetails = () => {
    const { id } = useParams();
    const [activity, setActivity] = useState(null);

    useEffect(() => {
        // Make an HTTP GET request to fetch events from the backend
        Axios.get(`https://activenty-bb26d9089082.herokuapp.com/activities/detail/${id}`)
            .then((response) => {
                setActivity(response.data);
            })
            .catch((error) => {
                console.error('Error fetching events:', error);
            });
    }, [id]); // Include eventId as a dependency in useEffect

    if (activity === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="event-details" style={{ textAlign: 'center', position: 'relative' }}>
            <Header/>

            {activity.photos.length > 0 && (
                <div style={{ position: 'relative' }}>
                    {/* Background overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '50%', // Cover 100% on mobile
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)', // Adjust opacity as needed
                            zIndex: 1, // Make sure it's above the images
                        }}

                    >

                    </div>
                    {/* Concatenate photo URLs into a single array */}
                    <BackgroundGallery images={activity.photos.map((photo) => photo.photo)} />
                </div>
            )}
            <div style={{ display: 'flex', margin: '20px 0' }}>
                <div style={{flex: 2,  display: 'inline-block', background: 'white', padding: '20px', borderRadius: '10px', marginLeft:'30px', marginRight:'30px',
                    marginTop: '20px', marginBottom: '20px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.8)' }}>
                    <h2>{activity.title}</h2>
                    <p>{activity.activity_description} </p>
                    <p>Location: {activity.activity_location}</p>
                    <p>Type: {activity.activity_type}</p>
                    <p>Open Time: {activity.activity_open_from}</p>
                    <p>Phone: {activity.activity_phone}</p>
                    <p>E-mail: {activity.activity_email}</p>
                    <p>Website: {activity.activity_website}</p>
                    <p>Price: {activity.activity_price}</p>
                </div>
                <div style={{flex: 1,  display: 'inline-block', background: 'white', padding: '20px', borderRadius: '10px', marginLeft:'30px', marginRight:'30px',
                    marginTop: '20px', marginBottom: '20px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.8)' }}>
                    <MapForActivity activity={activity} />
                </div>
            </div>
        </div>
    );
};

export default ActivityDetails;