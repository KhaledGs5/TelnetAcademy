import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Home from './components/Home.jsx';
import ManageUsers from './components/handleusers/ManageUsers.jsx';
import ManageSessions from './components/manage/ManageSessions.jsx';
import TrainerSession from './components/TrainerSession.jsx';
import SignIn from './components/Auth/SignIn.jsx';
import Verify from './components/Auth/Verify.jsx';
import Profile from './components/Profile.jsx';
import Calendar from './components/Calendar.jsx';
import { getCookie } from './components/Cookies.jsx';
import './index.css';


function App() {
  const user = getCookie("User") || null;
  const signedIn = getCookie("SignedIn") || null;

  return (
    <Router>
      <Navbar />
      <Routes>
        {user && signedIn ? (
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        ) : (
          <Route path="/" element={<Home />} />
        )}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verify" element={<Verify />} />
        {signedIn && (
          <>
            <Route path="/manageusers" element={<ManageUsers />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/managesessions" element={<ManageSessions />} />
            <Route path="/trainersession" element={<TrainerSession />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/calendar" element={<Calendar />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;