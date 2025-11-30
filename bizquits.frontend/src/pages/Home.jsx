import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const { user, isAdmin, isEntrepreneur, isClient } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBasedContent = () => {
    if (isAdmin) {
      return {
        title: 'Admin Dashboard',
        description: 'Manage users, approve entrepreneur accounts, and oversee the platform.',
        cards: [
          {
            title: 'Pending Approvals',
            description: 'Review and approve entrepreneur registrations',
            icon: '🛡️',
            link: '/admin',
            color: 'warning'
          },
          {
            title: 'User Management',
            description: 'View and manage all platform users',
            icon: '👥',
            link: '/admin/users',
            color: 'info'
          }
        ]
      };
    }
    
    if (isEntrepreneur) {
      return {
        title: 'Entrepreneur Dashboard',
        description: 'Manage your business profile and services.',
        cards: [
          {
            title: 'My Company',
            description: 'View and update your company information',
            icon: '🏢',
            link: '/entrepreneur/company',
            color: 'primary'
          },
          {
            title: 'Services',
            description: 'Manage your service offerings',
            icon: '💼',
            link: '/entrepreneur/services',
            color: 'success'
          }
        ]
      };
    }
    
    // Client
    return {
      title: 'Client Dashboard',
      description: 'Discover services and manage your bookings.',
      cards: [
        {
          title: 'Browse Services',
          description: 'Explore services from local entrepreneurs',
          icon: '🔍',
          link: '/client/services',
          color: 'primary'
        },
        {
          title: 'My Bookings',
          description: 'View and manage your service bookings',
          icon: '📅',
          link: '/client/bookings',
          color: 'info'
        }
      ]
    };
  };

  const content = getRoleBasedContent();

  return (
    <div className="home-container">
      <div className="page-header">
        <div className="welcome-section">
          <h1>{getGreeting()}, {user?.email?.split('@')[0]}! 👋</h1>
          <p>{content.description}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <div className={`stats-card-icon bg-primary-light`}>
            <span>📊</span>
          </div>
          <div className="stats-card-value">0</div>
          <div className="stats-card-label">Total Activities</div>
        </div>
        <div className="stats-card">
          <div className={`stats-card-icon bg-success-light`}>
            <span>✅</span>
          </div>
          <div className="stats-card-value">0</div>
          <div className="stats-card-label">Completed</div>
        </div>
        <div className="stats-card">
          <div className={`stats-card-icon bg-warning-light`}>
            <span>⏳</span>
          </div>
          <div className="stats-card-value">0</div>
          <div className="stats-card-label">Pending</div>
        </div>
        <div className="stats-card">
          <div className={`stats-card-icon bg-info-light`}>
            <span>⭐</span>
          </div>
          <div className="stats-card-value">{user?.role || 'User'}</div>
          <div className="stats-card-label">Your Role</div>
        </div>
      </div>

      <h2 className="section-title">Quick Actions</h2>
      <div className="action-cards-grid">
        {content.cards.map((card, index) => (
          <Link to={card.link} key={index} className="action-card">
            <div className={`action-card-icon bg-${card.color}-light`}>
              <span>{card.icon}</span>
            </div>
            <div className="action-card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
            <div className="action-card-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>🎯 Getting Started</h3>
          <p>Welcome to BizQuits! Here are some tips to get you started:</p>
          <ul>
            <li>Complete your profile to unlock all features</li>
            <li>Explore the available services in your area</li>
            <li>Connect with local entrepreneurs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
