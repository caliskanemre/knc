import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Ensure correct import

const AuthContext = createContext();
const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [username, setUsername] = useState('');
    const [favorites, setFavorites] = useState([]); // Initialize favorites state

    useEffect(() => {
        // Check for token and update username on component mount
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decoded = jwtDecode(storedToken);
            setToken(storedToken);
            setUsername(decoded.sub); // Make sure your token has a 'username' claim
            fetchFavorites(storedToken); // Fetch favorites upon login
            setIsLoggedIn(true);
        }
    }, [token, username]);


    const fetchFavorites = async (token) => {
        try {
            const response = await axios.get(`${baseURL}/users/favorites`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFavorites(response.data); // Update favorites state
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    const toggleFavorite = async (itemId, isFavorited, itemType) => {
        const url = `${baseURL}/users/favorites/${itemType}/${itemId}`;

        try {
            // Toggle the favorite status in the backend
            if (isFavorited) {
                await axios.delete(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await axios.post(url, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            // Refetch the favorites list to update the local state
            await fetchFavorites(); // Assuming fetchFavorites is a function that fetches the entire favorites list and updates the state

        } catch (error) {
            console.error(`Error toggling favorite ${itemType}:`, error);
        }
    };
    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, token, setToken, username, setUsername, favorites, toggleFavorite }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

