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
    const [cart, setCart] = useState([]);

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

    const fetchCart = async (authToken) => {
        try {
            const response = await axios.get(`${baseURL}/cart/${username}`, {
                headers: { Authorization: `Bearer ${authToken || token}` },
            });
            setCart(response.data || []);
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    };

    const toggleCartItem = async (itemId, isInCart, quantity = 1, price) => {
        try {
            if (isInCart) {
                // Remove from cart
                await axios.delete(`${baseURL}/cart/${username}/item/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // Add to cart
                const cartItem = { productId: itemId, quantity, price };
                await axios.post(`${baseURL}/cart/${username}`, cartItem, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchCart(); // Refresh the cart
        } catch (error) {
            console.error(`Error toggling cart item ${itemId}:`, error);
        }
    };


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

    const toggleFavorite = async (itemId, isFavorited, itemType, notificationType) => {


        try {
            // Toggle the favorite status in the backend
            if (isFavorited) {
                const url = `${baseURL}/users/favorites/${itemType}/${itemId}`;
                await axios.delete(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                const url = `${baseURL}/users/favorites/${itemType}/${itemId}/${notificationType}`;
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
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, token, setToken, username,cart, setUsername, favorites, toggleFavorite }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

