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
import TrainerRequest from './components/manage/TrainerRequest.jsx';
import TrainerCalls from './components/TrainerCalls.jsx';
import TrainerTraining from './components/TrainerTraining.jsx';
import TraineeSession from './components/TraineeSession.jsx';
import BecomeTrainer from './components/BecomeTrainer.jsx';
import ManageTrainings from './components/manage/ManageTrainings.jsx';
import TraineeTrainings from './components/TraineeTrainings.jsx';
import { getCookie } from './components/Cookies.jsx';
import TraineeRequest from './components/manage/TraineeRequest.jsx';
import { NavbarProvider } from './NavbarContext.js';
import './index.css';



function App() {
  const user = getCookie("User") || null;
  const signedIn = getCookie("SignedIn") || null;

  return (
    <NavbarProvider>
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
          {signedIn && !user.role && (
            <>
              <Route path="/manageusers" element={<ManageUsers />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
            </>
          )}

          {signedIn && user.role === 'manager' && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/managesessions" element={<ManageSessions />} />
              <Route path="/managetrainings" element={<ManageTrainings />} />
              <Route path="/requests" element={<Navigate to="/requests/trainer" replace />} />
              <Route path="/requests/trainee" element={<TraineeRequest />} />
              <Route path="/requests/trainer" element={<TrainerRequest />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
            </>
          )}

          {signedIn && user.role === 'trainer' && (
            <>
              <Route path="/trainertraining" element={<TrainerTraining />} />
              <Route path="/trainersession" element={<TrainerSession />} />
              <Route path="/trainercall" element={<TrainerCalls />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </>
          )}

          {signedIn && user.role === 'trainee' && (
            <>
              <Route path="/traineesession" element={<TraineeSession />} />
              <Route path="/enrolledtrainee" element={<TraineeTrainings />} />
              <Route path="/becometrainer" element={<BecomeTrainer />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </>
          )}
          
          {signedIn && user.role === "trainee_trainer" && (
            <>
              <Route path="/trainertraining" element={<TrainerTraining />} />
              <Route path="/trainersession" element={<TrainerSession />} />
              <Route path="/trainercall" element={<TrainerCalls />} />
              <Route path="/traineesession" element={<TraineeSession />} />
              <Route path="/enrolledtrainee" element={<TraineeTrainings />} />
              <Route path="/becometrainer" element={<BecomeTrainer />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </>
          )}

        </Routes>
      </Router>
    </NavbarProvider>
  );
}

export default App;