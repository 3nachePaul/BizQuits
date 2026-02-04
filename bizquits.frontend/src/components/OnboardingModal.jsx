import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BiscuitMascot from './BiscuitMascot';
import './OnboardingModal.css';

// Icons for the onboarding slides
const Icons = {
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1"/>
      <path d="M12 8v13"/>
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
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
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  messageCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
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
  checkCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
      <path d="m12 5 7 7-7 7"/>
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  ),
};

// Worker/Client slides
const workerSlides = [
  {
    id: 'welcome',
    icon: 'rocket',
    title: 'Bine ai venit pe BizQuits! 🎉',
    subtitle: 'Găsește joburi temporare rapid și câștigă bani în plus',
    features: [
      { icon: 'briefcase', text: 'Joburi în HORECA, Evenimente, Figurație, Promoții' },
      { icon: 'calendar', text: 'Lucrezi când vrei - 1 zi, 1 weekend, 1 eveniment' },
      { icon: 'zap', text: 'Plată rapidă după fiecare job' },
    ],
    mascotMood: 'excited',
    gradient: 'primary',
  },
  {
    id: 'gamification',
    icon: 'trophy',
    title: 'Urcă în Nivel! 🚀',
    subtitle: 'Cu cât lucrezi mai mult, cu atât câștigi mai multe beneficii',
    features: [
      { icon: 'star', text: 'Acumulezi XP pentru fiecare job finalizat' },
      { icon: 'trophy', text: 'Deblochezi achievement-uri unice' },
      { icon: 'zap', text: 'Nivelul tău îți aduce bonusuri exclusive' },
    ],
    highlight: {
      type: 'xp-bar',
      current: 0,
      max: 100,
      level: 1,
    },
    mascotMood: 'proud',
    gradient: 'gold',
  },
  {
    id: 'challenges',
    icon: 'target',
    title: 'Completează Challenge-uri! 🎯',
    subtitle: 'Provocări săptămânale cu recompense mari',
    features: [
      { icon: 'checkCircle', text: 'Finalizează 3 joburi într-o săptămână → +500 XP' },
      { icon: 'star', text: 'Primește doar review-uri de 5 stele → Achievement special' },
      { icon: 'gift', text: 'Challenge-uri cu premii și bonusuri' },
    ],
    highlight: {
      type: 'challenge-preview',
      challenges: [
        { name: 'Prima Misiune', progress: 0, max: 1, xp: 100 },
        { name: 'Muncitor Dedicat', progress: 0, max: 5, xp: 300 },
      ],
    },
    mascotMood: 'excited',
    gradient: 'purple',
  },
  {
    id: 'offers',
    icon: 'gift',
    title: 'Oferte Exclusive! 🎁',
    subtitle: 'Companiile îți oferă bonusuri pentru munca ta',
    features: [
      { icon: 'gift', text: 'Reduceri la restaurante și magazine' },
      { icon: 'zap', text: 'Bonusuri pentru joburi în weekend' },
      { icon: 'star', text: 'Oferte speciale pentru top workers' },
    ],
    highlight: {
      type: 'offers-preview',
      offers: [
        { company: 'Hard Rock Cafe', discount: '20% la orice comandă' },
        { company: 'City Grill', discount: 'Masă gratuită în pauză' },
      ],
    },
    mascotMood: 'happy',
    gradient: 'green',
  },
  {
    id: 'start',
    icon: 'sparkles',
    title: 'Ești Gata? 💪',
    subtitle: 'Începe aventura ta pe BizQuits chiar acum!',
    features: [
      { icon: 'briefcase', text: 'Explorează joburile disponibile' },
      { icon: 'calendar', text: 'Aplică și așteaptă confirmarea' },
      { icon: 'messageCircle', text: 'Discută direct cu angajatorul' },
    ],
    cta: 'Hai să începem!',
    mascotMood: 'excited',
    gradient: 'rainbow',
  },
];

// Entrepreneur slides
const entrepreneurSlides = [
  {
    id: 'welcome',
    icon: 'building',
    title: 'Bine ai venit pe BizQuits! 🏢',
    subtitle: 'Găsește personal temporar rapid și ușor',
    features: [
      { icon: 'users', text: 'Acces la mii de lucrători verificați' },
      { icon: 'calendar', text: 'Personal pentru orice tip de eveniment' },
      { icon: 'checkCircle', text: 'Sistem de review-uri și rating' },
    ],
    mascotMood: 'excited',
    gradient: 'primary',
  },
  {
    id: 'services',
    icon: 'briefcase',
    title: 'Postează Joburi Rapid! 📋',
    subtitle: 'Creează anunțuri și primește aplicanți imediat',
    features: [
      { icon: 'zap', text: 'Postare în mai puțin de 2 minute' },
      { icon: 'users', text: 'Notificări instant către lucrători' },
      { icon: 'calendar', text: 'Flexibilitate totală pentru programare' },
    ],
    highlight: {
      type: 'service-preview',
      service: {
        title: 'Ospătar eveniment corporate',
        price: '80 RON/oră',
        applicants: 12,
      },
    },
    mascotMood: 'proud',
    gradient: 'blue',
  },
  {
    id: 'gamification',
    icon: 'trophy',
    title: 'Motivează Lucrătorii! 🏆',
    subtitle: 'Oferă challenge-uri și bonusuri pentru performanță',
    features: [
      { icon: 'target', text: 'Creează challenge-uri personalizate' },
      { icon: 'gift', text: 'Oferă discounturi și beneficii' },
      { icon: 'star', text: 'Atrage cei mai buni lucrători' },
    ],
    highlight: {
      type: 'challenge-create',
      example: {
        name: 'Weekend Warrior',
        reward: '+50 RON bonus',
        condition: 'Lucrează sâmbătă și duminică',
      },
    },
    mascotMood: 'excited',
    gradient: 'gold',
  },
  {
    id: 'communication',
    icon: 'messageCircle',
    title: 'Comunicare Directă! 💬',
    subtitle: 'Chat integrat cu toți aplicanții',
    features: [
      { icon: 'messageCircle', text: 'Mesaje instant cu lucrătorii' },
      { icon: 'checkCircle', text: 'Confirmări și actualizări în timp real' },
      { icon: 'zap', text: 'Notificări pentru mesaje importante' },
    ],
    mascotMood: 'happy',
    gradient: 'purple',
  },
  {
    id: 'start',
    icon: 'sparkles',
    title: 'Să Începem! 🚀',
    subtitle: 'Completează profilul companiei și postează primul job',
    features: [
      { icon: 'building', text: 'Adaugă detaliile companiei' },
      { icon: 'briefcase', text: 'Creează primul tău serviciu' },
      { icon: 'users', text: 'Primește primii aplicanți' },
    ],
    cta: 'Creează Profilul Companiei',
    mascotMood: 'excited',
    gradient: 'rainbow',
  },
];

const OnboardingModal = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next');
  const [showConfetti, setShowConfetti] = useState(false);

  const slides = user?.role === 'Entrepreneur' ? entrepreneurSlides : workerSlides;
  const slide = slides[currentSlide];

  useEffect(() => {
    // Show confetti on last slide
    if (currentSlide === slides.length - 1) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, slides.length]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setSlideDirection('next');
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setSlideDirection('prev');
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsExiting(true);
    // Mark onboarding as complete in localStorage
    localStorage.setItem('bizquits_onboarding_complete', 'true');
    localStorage.setItem('bizquits_onboarding_date', new Date().toISOString());
    
    setTimeout(() => {
      onComplete?.();
    }, 500);
  };

  const handleDotClick = (index) => {
    setSlideDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
  };

  const gradientClasses = {
    primary: 'onboarding-gradient-primary',
    gold: 'onboarding-gradient-gold',
    purple: 'onboarding-gradient-purple',
    green: 'onboarding-gradient-green',
    blue: 'onboarding-gradient-blue',
    rainbow: 'onboarding-gradient-rainbow',
  };

  return (
    <div className={`onboarding-overlay ${isExiting ? 'exiting' : ''}`}>
      {/* Confetti */}
      {showConfetti && (
        <div className="onboarding-confetti">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="confetti-piece"
              style={{
                '--delay': `${Math.random() * 2}s`,
                '--x': `${Math.random() * 100}%`,
                '--rotation': `${Math.random() * 360}deg`,
                '--color': ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6'][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      <div className={`onboarding-modal ${gradientClasses[slide.gradient]}`}>
        {/* Progress bar */}
        <div className="onboarding-progress">
          <div 
            className="onboarding-progress-fill"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Skip button */}
        {currentSlide < slides.length - 1 && (
          <button className="onboarding-skip" onClick={handleSkip}>
            Sari peste
          </button>
        )}

        {/* Slide content */}
        <div className={`onboarding-content slide-${slideDirection}`} key={slide.id}>
          {/* Floating decorations */}
          <div className="onboarding-decorations">
            <div className="decoration decoration-1" />
            <div className="decoration decoration-2" />
            <div className="decoration decoration-3" />
          </div>

          {/* Icon with animation */}
          <div className="onboarding-icon-wrapper">
            <div className="onboarding-icon-bg" />
            <div className="onboarding-icon">
              {Icons[slide.icon]}
            </div>
          </div>

          {/* Title and subtitle */}
          <h2 className="onboarding-title">{slide.title}</h2>
          <p className="onboarding-subtitle">{slide.subtitle}</p>

          {/* Features list */}
          <div className="onboarding-features">
            {slide.features.map((feature, index) => (
              <div 
                key={index} 
                className="onboarding-feature"
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <div className="feature-icon">
                  {Icons[feature.icon]}
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Highlight section (special previews) */}
          {slide.highlight && (
            <div className="onboarding-highlight">
              {slide.highlight.type === 'xp-bar' && (
                <div className="highlight-xp">
                  <div className="xp-header">
                    <span className="xp-level">Level {slide.highlight.level}</span>
                    <span className="xp-text">{slide.highlight.current} / {slide.highlight.max} XP</span>
                  </div>
                  <div className="xp-bar">
                    <div className="xp-fill" style={{ width: '0%' }}>
                      <div className="xp-glow" />
                    </div>
                  </div>
                  <div className="xp-bonus">
                    <span className="xp-bonus-icon">✨</span>
                    <span>Primul job = +100 XP!</span>
                  </div>
                </div>
              )}

              {slide.highlight.type === 'challenge-preview' && (
                <div className="highlight-challenges">
                  {slide.highlight.challenges.map((challenge, i) => (
                    <div key={i} className="mini-challenge">
                      <div className="mini-challenge-header">
                        <span>{challenge.name}</span>
                        <span className="mini-xp">+{challenge.xp} XP</span>
                      </div>
                      <div className="mini-progress">
                        <div 
                          className="mini-progress-fill"
                          style={{ width: `${(challenge.progress / challenge.max) * 100}%` }}
                        />
                      </div>
                      <span className="mini-status">{challenge.progress}/{challenge.max}</span>
                    </div>
                  ))}
                </div>
              )}

              {slide.highlight.type === 'offers-preview' && (
                <div className="highlight-offers">
                  {slide.highlight.offers.map((offer, i) => (
                    <div key={i} className="mini-offer">
                      <div className="mini-offer-icon">🎁</div>
                      <div className="mini-offer-content">
                        <strong>{offer.company}</strong>
                        <span>{offer.discount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {slide.highlight.type === 'service-preview' && (
                <div className="highlight-service">
                  <div className="service-preview-card">
                    <h4>{slide.highlight.service.title}</h4>
                    <div className="service-preview-details">
                      <span className="service-price">{slide.highlight.service.price}</span>
                      <span className="service-applicants">
                        👥 {slide.highlight.service.applicants} aplicanți
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {slide.highlight.type === 'challenge-create' && (
                <div className="highlight-challenge-create">
                  <div className="challenge-create-card">
                    <div className="challenge-create-icon">🏆</div>
                    <div className="challenge-create-content">
                      <strong>{slide.highlight.example.name}</strong>
                      <span>{slide.highlight.example.condition}</span>
                      <span className="challenge-reward">{slide.highlight.example.reward}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mascot */}
          <div className={`onboarding-mascot mood-${slide.mascotMood}`}>
            <BiscuitMascot size="lg" animate />
          </div>
        </div>

        {/* Navigation */}
        <div className="onboarding-navigation">
          {/* Dots */}
          <div className="onboarding-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`onboarding-dot ${index === currentSlide ? 'active' : ''} ${index < currentSlide ? 'completed' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="onboarding-buttons">
            {currentSlide > 0 && (
              <button className="onboarding-btn onboarding-btn-secondary" onClick={handlePrev}>
                Înapoi
              </button>
            )}
            
            {currentSlide < slides.length - 1 ? (
              <button className="onboarding-btn onboarding-btn-primary" onClick={handleNext}>
                Continuă
                <span className="btn-icon">{Icons.arrowRight}</span>
              </button>
            ) : (
              <button className="onboarding-btn onboarding-btn-cta" onClick={handleComplete}>
                {slide.cta || 'Să începem!'}
                <span className="btn-icon">{Icons.sparkles}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
