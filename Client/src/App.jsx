import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';


import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './components/NotFoundPage.jsx';
import ProfilePage from './pages/user/ProfilePage';
import SellerProfile from './pages/Seller/SellerProfile.jsx';
import SellerAllProduct from './pages/Seller/SellerAllProduct.jsx';
import ProductViewPage from './pages/Seller/ProductViewPage.jsx';
import ProductAddPage from './pages/Seller/ProductAddPage.jsx';
import ProductUpdatePage from './pages/Seller/ProductUpdatePage.jsx';
import ProductDeletePage from './pages/Seller/ProductDeletePage.jsx';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Order/CheckoutPage.jsx';
import OrdersPage from './pages/Order/OrdersPage.jsx';
// import OrdersPage from './pages/Orders/OrdersPage';
// import OrderDetailPage from './pages/Orders/OrderDetailPage';




const PrivateRoute = ({ children, isAuthenticated }) =>
  isAuthenticated ? children : <Navigate to="/login" replace />;

const RoleRoute = ({ children, isAuthenticated, user, role, fallback = '/' }) =>
  isAuthenticated && user && role.includes(user.role) ? children : <Navigate to={fallback} replace />;

const GuestRoute = ({ children, isAuthenticated }) =>
  isAuthenticated ? <Navigate to="/" replace /> : children;



function App() {

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <GuestRoute isAuthenticated={isAuthenticated}>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute isAuthenticated={isAuthenticated}>
              <Signup />
            </GuestRoute>
          }
        />


        <Route
          path="/products"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <NotFoundPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/products"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role={["SELLER"]}>
              <SellerAllProduct />
            </RoleRoute>
          }
        />

        <Route
          path="/product/add"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role={["SELLER"]}>
              <ProductAddPage />
            </RoleRoute>
          }
        />
        <Route
          path="/product/edit/:id"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role={["SELLER"]}>
              <ProductUpdatePage />
            </RoleRoute>
          }
        />
        <Route
          path="/product/delete/:id"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role={["SELLER"]}>
              <ProductDeletePage />
            </RoleRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <ProductViewPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role={["CUSTOMER", "SELLER"]} fallback="/login">
              <CartPage />
            </RoleRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role={["CUSTOMER","SELLER"]} fallback="/login">
              <CheckoutPage />
            </RoleRoute>
          }
        />

        * ── Orders ──
        * <Route
          path="/orders"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <OrdersPage />
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/orders/:id"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <OrderDetailPage />
            </PrivateRoute>
          }
        />  */}

        {/* ── User Profile ── */}
        <Route
          path="/user/profile"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* ── Seller ── */}
        <Route
          path="/become-seller"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role={["CUSTOMER"]}>
              <SellerProfile />
            </RoleRoute>
          }
        />
        {/* <Route
          path="/seller/dashboard"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role="SELLER">
              <SellerDashboardPage />
            </RoleRoute>
          }
        /> */}

        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Router>
  );
}

export default App;