import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Home.css';

// SVG Icons
const Icons = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l8-4v18"/>
      <path d="M19 21V11l-6-4"/>
      <path d="M9 9v.01"/>
      <path d="M9 12v.01"/>
      <path d="M9 15v.01"/>
      <path d="M9 18v.01"/>
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  )
};

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
            icon: Icons.shield,
            link: '/admin',
            color: 'sage'
          },
          {
            title: 'User Management',
            description: 'View and manage all platform users',
            icon: Icons.users,
            link: '/admin/users',
            color: 'stone'
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
            icon: Icons.building,
            link: '/entrepreneur/company',
            color: 'sage'
          },
          {
            title: 'Services',
            description: 'Manage your service offerings',
            icon: Icons.briefcase,
            link: '/entrepreneur/services',
            color: 'stone'
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
          icon: Icons.search,
          link: '/client/services',
          color: 'sage'
        },
        {
          title: 'My Bookings',
          description: 'View and manage your service bookings',
          icon: Icons.calendar,
          link: '/client/bookings',
          color: 'stone'
        }
      ]
    };
  };

  const content = getRoleBasedContent();

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="greeting-section">
          <p className="greeting-text">{getGreeting()}</p>
          <h1 className="greeting-name">{user?.email?.split('@')[0]}</h1>
        </div>
        <p className="header-description">{content.description}</p>
      </header>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              {Icons.activity}
            </div>
            <div className="stat-content">
              <span className="stat-value">0</span>
              <span className="stat-label">Activities</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              {Icons.check}
            </div>
            <div className="stat-content">
              <span className="stat-value">0</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              {Icons.clock}
            </div>
            <div className="stat-content">
              <span className="stat-value">0</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              {Icons.user}
            </div>
            <div className="stat-content">
              <span className="stat-value">{user?.role || 'User'}</span>
              <span className="stat-label">Role</span>
            </div>
          </div>
        </div>
      </section>

      <section className="actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-cards">
          {content.cards.map((card, index) => (
            <Link to={card.link} key={index} className={`action-card action-card--${card.color}`}>
              <div className="action-card-icon">
                {card.icon}
              </div>
              <div className="action-card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="action-card-arrow">
                {Icons.arrow}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="info-section">
        <div className="info-card">
          <div className="info-card-icon">
            {Icons.info}
          </div>
          <div className="info-card-content">
            <h3>Getting Started</h3>
            <p>Welcome to BizQuits. Here are some tips to get you started:</p>
            <ul>
              <li>Complete your profile to unlock all features</li>
              <li>Explore the available services in your area</li>
              <li>Connect with local entrepreneurs</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
