import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
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
import ClientServices from './pages/ClientServices';
import ClientBookings from './pages/ClientBookings';
import ClientOffers from './pages/ClientOffers';
import ClientChallenges from './pages/ClientChallenges';
import EntrepreneurChallenges from './pages/EntrepreneurChallenges';
import AdminModeration from './pages/AdminModeration';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import CompanyPublicProfile from './pages/CompanyPublicProfile';
import './App.css';

const AppLayout = () => {
  const { isAuthenticated } = useAuth();

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
        <Routes>

          {/* ✅ PUBLIC COMPANY PROFILE – MUST BE ABOVE * */}
          <Route path="/companies/:id" element={<CompanyPublicProfile />} />

          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute roles={['Admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['Admin']}><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/moderation" element={<PrivateRoute roles={['Admin']}><AdminModeration /></PrivateRoute>} />

          {/* Entrepreneur */}
          <Route path="/entrepreneur/company" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurCompany /></PrivateRoute>} />
          <Route path="/entrepreneur/services" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurServices /></PrivateRoute>} />
          <Route path="/entrepreneur/bookings" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurBookings /></PrivateRoute>} />
          <Route path="/entrepreneur/offers" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurOffers /></PrivateRoute>} />
          <Route path="/entrepreneur/challenges" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurChallenges /></PrivateRoute>} />

          {/* Client */}
          <Route path="/client/services" element={<PrivateRoute roles={['Client']}><ClientServices /></PrivateRoute>} />
          <Route path="/client/bookings" element={<PrivateRoute roles={['Client']}><ClientBookings /></PrivateRoute>} />
          <Route path="/client/offers" element={<PrivateRoute roles={['Client']}><ClientOffers /></PrivateRoute>} />
          <Route path="/client/challenges" element={<PrivateRoute roles={['Client']}><ClientChallenges /></PrivateRoute>} />

          {/* ⚠️ MUST BE LAST */}
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
