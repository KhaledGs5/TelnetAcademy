import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Home from './components/Home.jsx';
import ManageUsers from './components/handleusers/ManageUsers.jsx';
import ManageSessions from './components/manage/ManageSessions.jsx';
import SignIn from './components/Auth/SignIn.jsx';
import Verify from './components/Auth/Verify.jsx';
import AdminSettings from './components/handleusers/AdminSettings.jsx';
import Calendar from './components/Calendar.jsx';
import './index.css';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/manageusers" element={<ManageUsers />} />
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/managesessions" element={<ManageSessions />}/>
        <Route path="/account" element={<AdminSettings />}/>
        <Route path="/calendar" element={<Calendar />}/>
      </Routes>
    </Router>
  );
}

export default App;