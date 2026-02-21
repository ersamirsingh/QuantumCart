// import React from 'react';
// import { checkAuth } from './store/slices/authSlice';
// import { useDispatch, useSelector } from 'react-redux';
// import { useEffect } from 'react';
// import Login from './pages/Auth/Login';
// import Signup from './pages/Auth/Signup';
// import LandingPage from './pages/LandingPage'
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from 'react-router-dom';
// import SellerPage from './pages/seller/SellerPage';
// import ProfilePage from './pages/user/ProfilePage';
// import ProductDeletePage from './pages/Product/productDeletePage';
// import ProductAddPage from './pages/Product/ProductAddPage';
// import ProductViewPage from './pages/Product/ProductViewPage';
// import AllProductsPage from './pages/Product/AllProductPage';
// import ProductUpdatePage from './pages/Product/ProductUpdatePage';


// function App() {

//   const dispatch = useDispatch();
//   const { isAuthenticated, user } = useSelector(state=>state.auth);

//   useEffect(() => {
//     dispatch(checkAuth());
//   }, [dispatch]);

//   // console.log(user)


//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={isAuthenticated ? <LandingPage /> : <Login />}></Route>

//         <Route path="/login"
//           element={isAuthenticated ? <Navigate to="/" /> : <Login />}
//         ></Route>

//         <Route path="/signup"
//           element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
//         ></Route>

//         <Route path='/user/profile'
//           element={isAuthenticated ? <ProfilePage/>: <Navigate to='/login' />}
//         ></Route>

//         <Route path='/become-seller'
//           element={isAuthenticated && user.role === 'CUSTOMER' ? <SellerPage/>: <Navigate to='/'/>}
//         ></Route>

//         <Route 
//           path="/seller/products" 
//           element={isAuthenticated && user.role === 'SELLER' ? <AllProductsPage /> : <Navigate to="/" />} 
//         ></Route>

//         <Route
//           path='/product/:id'
//           element={isAuthenticated ? <ProductViewPage /> : <Navigate to='/' />}
//         ></Route>

//         <Route
//           path='/product/add'
//           element={isAuthenticated && user.role === 'SELLER' ? <ProductAddPage /> : <Navigate to='/' />}
//         ></Route>

//         <Route
//           path='/product/edit/:id'
//           element={isAuthenticated && user.role === 'SELLER' ? <ProductUpdatePage /> : <Navigate to='/' />}
//         ></Route>

//         <Route
//           path='/product/delete/:id'
//           element={isAuthenticated && user.role === 'SELLER' ? <ProductDeletePage /> : <Navigate to='/' />}
//         ></Route>

//       </Routes>
//     </Router>
//   );
// }

// export default App



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
import SellerPage from './pages/seller/SellerPage';
import AllProductsPage from './pages/Product/AllProductPage';
import ProductViewPage from './pages/Product/ProductViewPage';
import ProductAddPage from './pages/Product/ProductAddPage';
import ProductUpdatePage from './pages/Product/ProductUpdatePage';
import ProductDeletePage from './pages/Product/productDeletePage';
import CartPage from './pages/Cart/CartPage';
// import CheckoutPage from './pages/Cart/CheckoutPage';
// import OrdersPage from './pages/Orders/OrdersPage';
// import OrderDetailPage from './pages/Orders/OrderDetailPage';



// ─── Route Guard Components ───────────────────────────────────────────────────

const PrivateRoute = ({ children, isAuthenticated }) =>
  isAuthenticated ? children : <Navigate to="/login" replace />;

const RoleRoute = ({ children, isAuthenticated, user, role, fallback = '/' }) =>
  isAuthenticated && user?.role === role ? children : <Navigate to={fallback} replace />;

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
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role="SELLER">
              <AllProductsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/product/add"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role="SELLER">
              <ProductAddPage />
            </RoleRoute>
          }
        />
        <Route
          path="/product/edit/:id"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role="SELLER">
              <ProductUpdatePage />
            </RoleRoute>
          }
        />
        <Route
          path="/product/delete/:id"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role="SELLER">
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
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role="CUSTOMER" fallback="/login">
              <CartPage />
            </RoleRoute>
          }
        />
        {/* <Route
          path="/checkout"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role="CUSTOMER" fallback="/login">
              <CheckoutPage />
            </RoleRoute>
          }
        />

        {/* ── Orders ── */}
        {/* <Route
          path="/orders"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <OrdersPage />
            </PrivateRoute>
          }
        />
        <Route
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
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role="CUSTOMER">
              <SellerPage />
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
        <Route
          path="/seller/products"
          element={
            <RoleRoute isAuthenticated={isAuthenticated} user={user} role="SELLER">
              <AllProductsPage />
            </RoleRoute>
          }
        />

        {/* ── 404 Fallback ── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Router>
  );
}

export default App;