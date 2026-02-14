import React from 'react';
import { checkAuth } from './store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import LandingPage from './pages/LandingPage'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import SellerPage from './pages/seller/SellerPage';
import ProfilePage from './pages/user/ProfilePage';


function App() {

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state=>state.auth);
  
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // console.log(user)


  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <LandingPage /> : <Login />}></Route>
       
        <Route path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        ></Route>

        <Route path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        ></Route>

        <Route path='/become-seller'
          element={isAuthenticated && user.role === 'CUSTOMER' ? <SellerPage/>: <Navigate to='/'/>}
        ></Route>

        <Route path='/user/profile'
          element={isAuthenticated ? <ProfilePage/>: <Navigate to='/login' />}
        ></Route>
      </Routes>
    </Router>
  );
}

export default App
