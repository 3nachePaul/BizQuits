import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { Suspense, lazy, useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import OnboardingModal from './components/OnboardingModal';
import GuidedTour from './components/GuidedTour';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import EntrepreneurCompany from './pages/EntrepreneurCompany';
import EntrepreneurServices from './pages/EntrepreneurServices';
import EntrepreneurBookings from './pages/EntrepreneurBookings';
import EntrepreneurOffers from './pages/EntrepreneurOffers';
import EntrepreneurReports from './pages/EntrepreneurReports';
import EntrepreneurReviews from './pages/EntrepreneurReviews';
import ClientServices from './pages/ClientServices';
import ClientBookings from './pages/ClientBookings';
import ClientOffers from './pages/ClientOffers';
import ClientChallenges from './pages/ClientChallenges';
import EntrepreneurChallenges from './pages/EntrepreneurChallenges';
import AdminModeration from './pages/AdminModeration';
import AdminBugReportsPage from './pages/AdminBugReportsPage';
import AdminMonitoringPage from './pages/AdminMonitoringPage';
import BugReportPage from './pages/BugReportPage';
import AchievementsGallery from './pages/AchievementsGallery';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { userService } from './services/api';
import CompanyPublicProfile from './pages/CompanyPublicProfile';
import './App.css';

const ChatPage = lazy(() => import('./pages/ChatPage'));

const AppLayout = () => {
  const { isAuthenticated, isLoading, user: authUser } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);

  useEffect(() => {
    const checkTutorialStatus = async () => {
      // Only check for non-admin authenticated users
      if (!isAuthenticated || !authUser || authUser.role === 'Admin') {
        setTutorialChecked(true);
        return;
      }

      try {
        // Fetch user profile to check hasSeenTutorial from database
        const response = await userService.getProfile();
        const profile = response.data;
        
        // If user has never seen tutorial, show onboarding first
        if (!profile.hasSeenTutorial) {
          setTimeout(() => setShowOnboarding(true), 500);
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
      } finally {
        setTutorialChecked(true);
      }
    };

    checkTutorialStatus();
  }, [isAuthenticated, authUser]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // After onboarding, trigger the guided tour
    setTimeout(() => {
      setShowGuidedTour(true);
    }, 300);
  };

  const handleTourComplete = () => {
    setShowGuidedTour(false);
  };

  if (isLoading) {
    return (
      <div className="centered-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="centered-layout">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PUBLIC COMPANY PROFILE */}
          <Route path="/companies/:id" element={<CompanyPublicProfile />} />

          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="sidebar-layout">
      <Sidebar />
      <main className="main-content">
        {/* Onboarding Modal */}
        {showOnboarding && (
          <OnboardingModal onComplete={handleOnboardingComplete} />
        )}
        
        {/* Guided Tour */}
        {showGuidedTour && (
          <GuidedTour onComplete={handleTourComplete} />
        )}
        
        <Routes>

          {/*  PUBLIC COMPANY PROFILE – MUST BE ABOVE * */}
          <Route path="/companies/:id" element={<CompanyPublicProfile />} />

          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute roles={['Admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['Admin']}><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/moderation" element={<PrivateRoute roles={['Admin']}><AdminModeration /></PrivateRoute>} />
          <Route path="/admin/bugs" element={<PrivateRoute roles={['Admin']}><AdminBugReportsPage /></PrivateRoute>} />
          <Route path="/admin/monitoring" element={<PrivateRoute roles={['Admin']}><AdminMonitoringPage /></PrivateRoute>} />


          {/* Entrepreneur */}
          <Route path="/entrepreneur/company" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurCompany /></PrivateRoute>} />
          <Route path="/entrepreneur/services" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurServices /></PrivateRoute>} />
          <Route path="/entrepreneur/bookings" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurBookings /></PrivateRoute>} />
          <Route path="/entrepreneur/offers" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurOffers /></PrivateRoute>} />
          <Route path="/entrepreneur/challenges" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurChallenges /></PrivateRoute>} />
          <Route path="/entrepreneur/reviews" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurReviews /></PrivateRoute>} />
          <Route path="/entrepreneur/reports" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurReports /></PrivateRoute>} />

          {/* Chat (all authenticated users) */}
          <Route path="/chat" element={<PrivateRoute><Suspense fallback={<div>Loading chat...</div>}><ChatPage /></Suspense></PrivateRoute>} />

          {/* Bug Report (all authenticated users) */}
          <Route path="/bug-report" element={<PrivateRoute><BugReportPage /></PrivateRoute>} />

          {/* Client */}
          <Route path="/client/services" element={<PrivateRoute roles={['Client']}><ClientServices /></PrivateRoute>} />
          <Route path="/client/bookings" element={<PrivateRoute roles={['Client']}><ClientBookings /></PrivateRoute>} />
          <Route path="/client/offers" element={<PrivateRoute roles={['Client']}><ClientOffers /></PrivateRoute>} />
          <Route path="/client/challenges" element={<PrivateRoute roles={['Client']}><ClientChallenges /></PrivateRoute>} />
          <Route path="/client/achievements" element={<PrivateRoute roles={['Client']}><AchievementsGallery /></PrivateRoute>} />

          {/* ️ MUST BE LAST */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
