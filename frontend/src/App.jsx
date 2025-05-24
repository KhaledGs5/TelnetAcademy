import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Home from './components/Home.jsx';
import ManageUsers from './components/handleusers/ManageUsers.jsx';
import ManageSessions from './components/manage/ManageSessions.jsx';
import TrainerSession from './components/TrainerSession.jsx';
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
import FormBuilder from './components/manage/Feedbakcs.jsx';
import { NavbarProvider } from './NavbarContext.js';
import { ThemeProviderWrapper } from './themecontext.js';
import { UserProvider, useUser } from './UserContext';
import './index.css';
import AboutPage from "./components/About.jsx";

function AppRoutes() {
  const { user } = useUser();
  const signedIn = getCookie("SignedIn") || null;
  console.log(user);
  return (
    <Router>
      <Navbar />
      <Routes>
        {user?.role === "admin" && signedIn && user? (
          <Route path="/" element={<Navigate to="/manageusers" replace />} />
        ) :
        user?.role !== "admin" && signedIn && user ? (
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        ) : (
          <Route path="/" element={<Home />} />
        )}

        {signedIn && user?.role === 'admin' && (
          <>
            <Route path="/manageusers" element={<ManageUsers />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/about" element={<AboutPage />} />
          </>
        )}

        {signedIn && user?.role === 'manager' && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/managesessions" element={<ManageSessions />} />
            <Route path="/managetrainings" element={<ManageTrainings />} />
            <Route path="/requests" element={<Navigate to="/requests/trainer" replace />} />
            <Route path="/requests/trainee" element={<TraineeRequest />} />
            <Route path="/requests/trainer" element={<TrainerRequest />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/feedbacks" element={<FormBuilder />} />
            <Route path="/about" element={<AboutPage />} />
          </>
        )}

        {signedIn && user?.role === 'trainer' && (
          <>
            <Route path="/trainertraining" element={<TrainerTraining />} />
            <Route path="/trainersession" element={<TrainerSession />} />
            <Route path="/trainercall" element={<TrainerCalls />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/about" element={<AboutPage />} />
          </>
        )}

        {signedIn && user?.role === 'trainee' && (
          <>
            <Route path="/traineesession" element={<TraineeSession />} />
            <Route path="/enrolledtrainee" element={<TraineeTrainings />} />
            <Route path="/becometrainer" element={<BecomeTrainer />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/about" element={<AboutPage />} />
          </>
        )}

        {signedIn && user?.role === 'trainee_trainer' && (
          <>
            <Route path="/trainertraining" element={<TrainerTraining />} />
            <Route path="/trainersession" element={<TrainerSession />} />
            <Route path="/trainercall" element={<TrainerCalls />} />
            <Route path="/traineesession" element={<TraineeSession />} />
            <Route path="/enrolledtrainee" element={<TraineeTrainings />} />
            <Route path="/becometrainer" element={<BecomeTrainer />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/about" element={<AboutPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
function App() {
  return (
    <ThemeProviderWrapper>
      <NavbarProvider>
        <AppRoutes />
      </NavbarProvider>
    </ThemeProviderWrapper>
  );
}

export default App;
