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
import ClientServices from './pages/ClientServices';
import ClientBookings from './pages/ClientBookings';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <div className="centered-layout">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute roles={['Admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['Admin']}><AdminUsers /></PrivateRoute>} />
          
          {/* Entrepreneur Routes */}
          <Route path="/entrepreneur/company" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurCompany /></PrivateRoute>} />
          <Route path="/entrepreneur/services" element={<PrivateRoute roles={['Entrepreneur']}><EntrepreneurServices /></PrivateRoute>} />
          
          {/* Client Routes */}
          <Route path="/client/services" element={<PrivateRoute roles={['Client']}><ClientServices /></PrivateRoute>} />
          <Route path="/client/bookings" element={<PrivateRoute roles={['Client']}><ClientBookings /></PrivateRoute>} />
          
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
