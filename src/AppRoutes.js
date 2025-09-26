/*
// Shared routes for both client (BrowserRouter) and server (StaticRouter)
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Main from './Main';
import ProductList from './activity/ProductList';
import ProductDetails from './activity/ProductDetails';
import SearchPage from './search/SearchPage';
import AboutUs from './links/AboutUs';
import PrivacyPolicy from './links/PrivacyPolicy';
import ContactUs from './links/ContactUs';
import ResetPassword from './login/ResetPassword';
import Cart from './cart/Cart';
import Payment from './cart/Payment';
import PaymentFailure from './cart/PaymentFailure';
import PaymentSuccess from './cart/PaymentSuccess';
import ArticlesPage from './activity/ArticlesPage';
import ArticleDetailPage from './activity/ArticleDetailPage';
import Login from './login/Login';
import Register from './login/Register';
import Favorites from './user/Favorites';
import MyOrders from './user/MyOrders';
import ShippingPolicy from './links/ShippingPolicy';
import ReturnPolicy from './links/ReturnPolicy';
import SalesAgreement from './links/SalesAggrement';

export default function AppRoutes() {
  return (
    <Routes>
      {/!* Main Routes *!/}
      <Route path=":lang/" element={<Main />} />
      <Route path=":lang/products" element={<ProductList />} />
      <Route path=":lang/products/:type" element={<ProductList />} />
      <Route path=":lang/products/detail/:id/:title" element={<ProductDetails />} />
      <Route path=":lang/products/detail/:id" element={<ProductDetails />} />
      <Route path=":lang/search" element={<SearchPage />} />

      {/!* Legal Pages *!/}
      <Route path=":lang/about-us" element={<AboutUs />} />
      <Route path=":lang/privacy-policy" element={<PrivacyPolicy />} />
      <Route path=":lang/shipping-policy" element={<ShippingPolicy />} />
      <Route path=":lang/return-policy" element={<ReturnPolicy />} />
      <Route path=":lang/sales-agreement" element={<SalesAgreement />} />
      <Route path=":lang/contact-us" element={<ContactUs />} />

      {/!* User Routes *!/}
      <Route path=":lang/login" element={<Login />} />
      <Route path=":lang/users/favorites" element={<Favorites />} />
      <Route path=":lang/my-orders" element={<MyOrders />} />
      <Route path=":lang/register" element={<Register />} />
      <Route path=":lang/reset-password" element={<ResetPassword />} />

      {/!* Cart and Payment Routes *!/}
      <Route path=":lang/cart" element={<Cart />} />
      <Route path=":lang/payment" element={<Payment />} />
      <Route path=":lang/payment-success" element={<PaymentSuccess />} />
      <Route path=":lang/payment-failure" element={<PaymentFailure />} />

      {/!* Articles *!/}
      <Route path=":lang/articles" element={<ArticlesPage />} />
      <Route path=":lang/articles/:id" element={<ArticleDetailPage />} />
    </Routes>
  );
}
*/
