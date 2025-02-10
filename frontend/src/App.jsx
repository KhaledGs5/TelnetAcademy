import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Home from './components/Home.jsx';
import './index.css';



function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />}/>
      </Routes>
    </Router>
  );
}

export default App;