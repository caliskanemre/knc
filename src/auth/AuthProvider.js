// AuthProvider.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''));
  const [username, setUsername] = useState(''); // Renamed from email to username
  const [favorites, setFavorites] = useState({ favoriteEvents: [], favoriteActivities: [] });
  const [cart, setCart] = useState([]);

  // On component mount, check localStorage for a token
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const userEmail = decoded.sub;
        setToken(storedToken);
        setUsername(userEmail); // Store email in username
        setIsLoggedIn(true);
        fetchFavorites(storedToken, userEmail);
        fetchCart(storedToken, userEmail);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token'); // Clear invalid token
        setToken('');
        setUsername('');
        setIsLoggedIn(false);
      }
    }
  }, []);

  const fetchCart = async (authToken, userEmail) => {
    try {
      const email = userEmail || username;
      if (!email) return;

      const response = await axios.get(`${baseURL}/cart/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${authToken || token}` },
      });
      setCart(response.data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error.response?.data || error.message);
    }
  };

  const fetchFavorites = async (authToken, userEmail) => {
    try {
      const email = userEmail || username;
      if (!email) return;

      const response = await axios.get(`${baseURL}/users/${encodeURIComponent(email)}/favorites`, {
        headers: { Authorization: `Bearer ${authToken || token}` },
      });
      // Normalize favorites shape to { favoriteEvents: [], favoriteActivities: [] }
      const data = response.data;
      let normalized;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        normalized = {
          favoriteEvents: Array.isArray(data) ? data : [],
          favoriteActivities: [],
        };
      } else {
        normalized = {
          favoriteEvents: Array.isArray(data.favoriteEvents) ? data.favoriteEvents : [],
          favoriteActivities: Array.isArray(data.favoriteActivities) ? data.favoriteActivities : [],
        };
      }
      setFavorites(normalized);
    } catch (error) {
      console.error('Error fetching favorites:', error.response?.data || error.message);
    }
  };

  const toggleCartItem = async (itemId, isInCart, quantity = 1, price) => {
    try {
      const email = username;
      if (!email) return;

      if (isInCart) {
        // Remove from cart using encoded email
        await axios.delete(`${baseURL}/cart/${encodeURIComponent(email)}/item/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Add to cart using encoded email
        const cartItem = { productId: itemId, quantity, price };
        await axios.post(`${baseURL}/cart/${encodeURIComponent(email)}`, cartItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchCart(token, email);
    } catch (error) {
      console.error(`Error toggling cart item ${itemId}:`, error.response?.data || error.message);
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
        const nt = notificationType || 'NONE';
        const url = `${baseURL}/users/favorites/${itemType}/${itemId}/${nt}`;
        await axios.post(url, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      // Refresh the favorites list
      fetchFavorites(token);
    } catch (error) {
      console.error(`Error toggling favorite ${itemType}:`, error.response?.data || error.message);
    }
  };

  return (
      <AuthContext.Provider
          value={{
            isLoggedIn,
            setIsLoggedIn,
            token,
            setToken,
            username, // Renamed from email to username
            setUsername, // Renamed from setEmail to setUsername
            favorites,
            toggleFavorite,
            cart,
            toggleCartItem,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
