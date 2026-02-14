import React from 'react';
import { checkAuth } from './store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';


function App() {

  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state=>state.auth);
  console.log(isAuthenticated);
  
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

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
      </Routes>
    </Router>
  );
}

export default App
