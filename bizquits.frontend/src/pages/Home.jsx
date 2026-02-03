import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import BiscuitMascot from '../components/BiscuitMascot';
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
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 22V8a2 2 0 0 0-4 0"/>
      <path d="M14 22V8a2 2 0 0 1 4 0"/>
      <path d="M8 8h8"/>
      <path d="M8 12h8"/>
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1"/>
      <path d="M12 8v13"/>
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
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
          color: 'biscuit'
        },
        {
          title: 'My Bookings',
          description: 'View and manage your service bookings',
          icon: Icons.calendar,
          link: '/client/bookings',
          color: 'gold'
        }
      ]
    };
  };

  const content = getRoleBasedContent();

  return (
    <div className="home-container">
      {/* Hero Section with Mascot */}
      <header className="home-header">
        <div className="header-content">
          <div className="greeting-section">
            <span className="greeting-badge">
              <span className="badge-icon"></span>
              {getGreeting()}
            </span>
            <h1 className="greeting-name">{user?.email?.split('@')[0] || 'Friend'}</h1>
            <p className="header-description">{content.description}</p>
          </div>
          <div className="header-mascot">
            <BiscuitMascot size="lg" animate={true} />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="header-decorations">
          <div className="deco-coin coin-1"></div>
          <div className="deco-coin coin-2"></div>
          <div className="deco-coin coin-3"></div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card stat-card--activity">
            <div className="stat-icon">
              {Icons.activity}
            </div>
            <div className="stat-content">
              <span className="stat-value">0</span>
              <span className="stat-label">Active Quests</span>
            </div>
            <div className="stat-decoration" />
          </div>
          <div className="stat-card stat-card--completed">
            <div className="stat-icon">
              {Icons.check}
            </div>
            <div className="stat-content">
              <span className="stat-value">0</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-decoration" />
          </div>
          <div className="stat-card stat-card--pending">
            <div className="stat-icon">
              {Icons.clock}
            </div>
            <div className="stat-content">
              <span className="stat-value">0</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-decoration" />
          </div>
          <div className="stat-card stat-card--role">
            <div className="stat-icon">
              {Icons.trophy}
            </div>
            <div className="stat-content">
              <span className="stat-value stat-value--role">{user?.role || 'User'}</span>
              <span className="stat-label">Your Role</span>
            </div>
            <div className="stat-decoration" />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="actions-section">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
          <p className="section-subtitle">Jump right into your tasks</p>
        </div>
        <div className="action-cards">
          {content.cards.map((card, index) => (
            <Link to={card.link} key={index} className={`action-card action-card--${card.color}`}>
              <div className="action-card-glow" />
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

      {/* Rewards/Tips Section */}
      <section className="rewards-section">
        <div className="rewards-card">
          <div className="rewards-icon">
            {Icons.gift}
          </div>
          <div className="rewards-content">
            <h3>Welcome to BizQuits!</h3>
            <p>Complete quests, earn rewards, and connect with local businesses. Here's how to get started:</p>
            <ul className="rewards-list">
              <li>
                <span className="list-icon">{Icons.check}</span>
                Complete your profile to unlock all features
              </li>
              <li>
                <span className="list-icon">{Icons.star}</span>
                Explore available quests in your area
              </li>
              <li>
                <span className="list-icon">{Icons.trophy}</span>
                Earn badges and rewards for completed quests
              </li>
            </ul>
          </div>
          <div className="rewards-mascot">
            <BiscuitMascot size="md" animate={true} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
