import { useState, useEffect } from 'react';
import { gamificationApi } from '../services/api';
import { useToast } from '../components/Toast';
import './AchievementsGallery.css';

const Icons = {
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1"/>
      <path d="M12 8v13"/>
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
    </svg>
  ),
  coins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/>
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
      <path d="M7 6h1v4"/>
      <path d="m16.71 13.88.7.71-2.82 2.82"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  messageSquare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

const CATEGORY_CONFIG = {
  Bookings: { icon: Icons.calendar, color: 'var(--violet-500)', bgColor: 'var(--violet-50)' },
  Challenges: { icon: Icons.target, color: 'var(--pink-500)', bgColor: 'var(--pink-50)' },
  Reviews: { icon: Icons.messageSquare, color: 'var(--sky-500)', bgColor: 'var(--sky-50)' },
  General: { icon: Icons.star, color: 'var(--amber-500)', bgColor: 'var(--amber-50)' },
};

export default function AchievementsGallery() {
  const toast = useToast();
  const [achievements, setAchievements] = useState([]);
  const [gamificationInfo, setGamificationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [achievementsRes, infoRes] = await Promise.all([
          gamificationApi.getAllAchievements(),
          gamificationApi.getInfo()
        ]);
        setAchievements(achievementsRes.data);
        setGamificationInfo(infoRes.data);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        toast.error('Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = [...new Set(achievements.map(a => a.category))];
  
  const filteredAchievements = achievements.filter(a => {
    const statusMatch = filter === 'all' || 
      (filter === 'unlocked' && a.isUnlocked) || 
      (filter === 'locked' && !a.isUnlocked);
    const categoryMatch = categoryFilter === 'all' || a.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalXpFromAchievements = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + (a.xpReward || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="achievements-gallery-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="achievements-gallery-container">
      {/* Hero Header */}
      <div className="gallery-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            {Icons.trophy}
          </div>
          <div className="header-text">
            <h1>Achievements Gallery</h1>
            <p>Discover all the badges you can earn on your journey!</p>
          </div>
        </div>
        
        {/* Progress Summary */}
        <div className="progress-summary">
          <div className="summary-stat">
            <span className="stat-value">{unlockedCount}</span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-stat">
            <span className="stat-value">{achievements.length - unlockedCount}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-stat">
            <span className="stat-value">{totalXpFromAchievements}</span>
            <span className="stat-label">XP Earned</span>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      {gamificationInfo && (
        <div className="how-it-works-section">
          <div className="section-header">
            <span className="section-icon">{Icons.info}</span>
            <h2>How Gamification Works</h2>
          </div>
          
          <div className="info-cards-grid">
            {/* Earn XP Card */}
            <div className="info-card xp-card">
              <div className="info-card-header">
                <span className="info-card-icon">{Icons.zap}</span>
                <h3>Earn XP</h3>
              </div>
              <ul className="earn-list">
                {gamificationInfo.howToEarnXp.map((item, i) => (
                  <li key={i}>
                    <span className="earn-icon">{item.icon}</span>
                    <span className="earn-action">{item.action}</span>
                    <span className="earn-reward">+{item.xp} XP</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Earn Coins Card */}
            <div className="info-card coins-card">
              <div className="info-card-header">
                <span className="info-card-icon">{Icons.coins}</span>
                <h3>Earn Coins</h3>
              </div>
              <ul className="earn-list">
                {gamificationInfo.howToEarnCoins.map((item, i) => (
                  <li key={i}>
                    <span className="earn-icon">{item.icon}</span>
                    <span className="earn-action">{item.action}</span>
                    <span className="earn-reward coins">+{item.coins} 🪙</span>
                  </li>
                ))}
              </ul>
              <div className="coins-tip">
                <span className="tip-icon">{Icons.gift}</span>
                <span>Use coins to claim exclusive offers!</span>
              </div>
            </div>

            {/* Tips Card */}
            <div className="info-card tips-card">
              <div className="info-card-header">
                <span className="info-card-icon">{Icons.star}</span>
                <h3>Pro Tips</h3>
              </div>
              <ul className="tips-list">
                {gamificationInfo.tips.map((tip, i) => (
                  <li key={i}>
                    <span className="tip-bullet">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="gallery-filters">
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({achievements.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'unlocked' ? 'active' : ''}`}
              onClick={() => setFilter('unlocked')}
            >
              <span className="tab-icon">{Icons.check}</span>
              Unlocked ({unlockedCount})
            </button>
            <button 
              className={`filter-tab ${filter === 'locked' ? 'active' : ''}`}
              onClick={() => setFilter('locked')}
            >
              <span className="tab-icon">{Icons.lock}</span>
              Locked ({achievements.length - unlockedCount})
            </button>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Category:</span>
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              All
            </button>
            {categories.map(cat => {
              const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.General;
              return (
                <button 
                  key={cat}
                  className={`filter-tab ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                  style={{ '--category-color': config.color }}
                >
                  <span className="tab-icon">{config.icon}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {filteredAchievements.map((achievement) => {
          const config = CATEGORY_CONFIG[achievement.category] || CATEGORY_CONFIG.General;
          return (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'}`}
              style={{ '--category-color': config.color, '--category-bg': config.bgColor }}
            >
              <div className="achievement-badge">
                <span className="badge-emoji">{achievement.badgeIcon || '🏆'}</span>
                {achievement.isUnlocked && (
                  <span className="unlocked-check">{Icons.check}</span>
                )}
                {!achievement.isUnlocked && (
                  <span className="locked-overlay">{Icons.lock}</span>
                )}
              </div>
              
              <div className="achievement-info">
                <h3 className="achievement-name">{achievement.name}</h3>
                <p className="achievement-description">{achievement.description}</p>
                
                <div className="achievement-meta">
                  <span className="xp-reward">
                    <span className="xp-icon">{Icons.zap}</span>
                    +{achievement.xpReward} XP
                  </span>
                  <span className="category-tag" style={{ background: config.bgColor, color: config.color }}>
                    {achievement.category}
                  </span>
                </div>

                {achievement.isUnlocked && achievement.unlockedAt && (
                  <div className="unlocked-date">
                    Unlocked {formatDate(achievement.unlockedAt)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">{Icons.trophy}</div>
          <h3>No achievements found</h3>
          <p>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
