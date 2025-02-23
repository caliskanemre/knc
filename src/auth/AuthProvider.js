import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Ensure correct import

const AuthContext = createContext();
const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);

  // On component mount, check localStorage for a token
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setToken(storedToken);
        setUsername(decoded.sub); // Assumes the token contains a 'sub' claim for the username
        setIsLoggedIn(true);
        fetchFavorites(storedToken);
        fetchCart(storedToken);
      } catch (error) {
        console.error("Invalid token:", error);
        setToken('');
        setIsLoggedIn(false);
      }
    }
  }, []); // Run only once on mount

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

  const fetchFavorites = async (authToken) => {
    try {
      const response = await axios.get(`${baseURL}/users/favorites`, {
        headers: { Authorization: `Bearer ${authToken || token}` },
      });
      setFavorites(response.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
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
      fetchCart(token);
    } catch (error) {
      console.error(`Error toggling cart item ${itemId}:`, error);
    }
  };

  const toggleFavorite = async (itemId, isFavorited, itemType, notificationType) => {
    try {
      if (isFavorited) {
        const url = `${baseURL}/users/favorites/${itemType}/${itemId}`;
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const url = `${baseURL}/users/favorites/${itemType}/${itemId}/${notificationType}`;
        await axios.post(url, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      // Refresh the favorites list
      fetchFavorites(token);
    } catch (error) {
      console.error(`Error toggling favorite ${itemType}:`, error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      setIsLoggedIn,
      token,
      setToken,
      username,
      setUsername,
      favorites,
      toggleFavorite,
      cart,
      toggleCartItem,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
