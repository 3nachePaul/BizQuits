import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import BiscuitMascot from './BiscuitMascot';
import './GuidedTour.css';

// Icons
const Icons = {
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  ),
  arrowLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
};

// Tour steps for Client role
export const clientTourSteps = [
  // Page: Browse Services
  {
    id: 'services-intro',
    page: '/client/services',
    title: '🔍 Găsește Joburi',
    content: 'Aici găsești toate joburile temporare disponibile. Poți filtra după categorie și căuta exact ce îți trebuie.',
    target: null, // Full page intro
    position: 'center',
    highlight: false,
  },
  {
    id: 'services-categories',
    page: '/client/services',
    title: '📂 Categorii de Joburi',
    content: 'Folosește aceste filtre pentru a găsi joburi în domeniul tău: HORECA, Evenimente, Figurație sau Promoții.',
    target: '[data-tour="categories"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'services-card',
    page: '/client/services',
    title: '💼 Carduri de Servicii',
    content: 'Fiecare card arată detalii despre job: ce trebuie să faci, unde, când și cât câștigi. Click pe "Aplică" pentru a te înscrie!',
    target: '[data-tour="service-card"]',
    position: 'right',
    highlight: true,
  },
  {
    id: 'services-apply',
    page: '/client/services',
    title: '✅ Cum Aplici',
    content: 'Apasă pe butonul "Aplică" sau "Book Now", alege data dorită și trimite cererea. Angajatorul va primi notificare instant!',
    target: '[data-tour="apply-button"]',
    position: 'top',
    highlight: true,
  },
  
  // Page: My Bookings
  {
    id: 'bookings-intro',
    page: '/client/bookings',
    title: '📋 Rezervările Tale',
    content: 'Aici vezi toate joburile la care ai aplicat. Poți urmări statusul fiecărei cereri.',
    target: null,
    position: 'center',
    highlight: false,
  },
  {
    id: 'bookings-status',
    page: '/client/bookings',
    title: '🔄 Statusuri',
    content: '• Pending = Așteaptă confirmare\n• Confirmed = Ești acceptat!\n• Completed = Job finalizat (+XP!)\n• Cancelled = Anulat',
    target: '[data-tour="booking-status"]',
    position: 'left',
    highlight: true,
  },
  {
    id: 'bookings-chat',
    page: '/client/bookings',
    title: '💬 Comunică cu Angajatorul',
    content: 'Poți deschide chat-ul pentru a discuta detalii despre job direct cu angajatorul.',
    target: '[data-tour="chat-button"]',
    position: 'top',
    highlight: true,
  },

  // Page: Special Offers
  {
    id: 'offers-intro',
    page: '/client/offers',
    title: '🎁 Oferte Speciale',
    content: 'Companiile îți oferă reduceri și bonusuri! Aici le găsești pe toate.',
    target: null,
    position: 'center',
    highlight: false,
  },
  {
    id: 'offers-card',
    page: '/client/offers',
    title: '🏷️ Tipuri de Oferte',
    content: 'Poți primi: reduceri la produse, mese gratuite, bonusuri în bani, sau puncte extra!',
    target: '[data-tour="offer-card"]',
    position: 'right',
    highlight: true,
  },
  {
    id: 'offers-claim',
    page: '/client/offers',
    title: '🎯 Cum Folosești o Ofertă',
    content: 'Apasă "Claim Offer" pentru a revendica oferta. Va fi salvată și o poți arăta la angajator când e cazul.',
    target: '[data-tour="claim-button"]',
    position: 'top',
    highlight: true,
  },

  // Page: Challenges
  {
    id: 'challenges-intro',
    page: '/client/challenges',
    title: '🏆 Challenge-uri',
    content: 'Provocări săptămânale care îți aduc XP și recompense extra! Completează-le pentru a urca în nivel mai rapid.',
    target: null,
    position: 'center',
    highlight: false,
  },
  {
    id: 'challenges-card',
    page: '/client/challenges',
    title: '🎯 Cum Funcționează',
    content: 'Fiecare challenge are o țintă (ex: finalizează 3 joburi). Progresul se actualizează automat când îndeplinești condițiile!',
    target: '[data-tour="challenge-card"]',
    position: 'right',
    highlight: true,
  },
  {
    id: 'challenges-join',
    page: '/client/challenges',
    title: '🚀 Înscrie-te!',
    content: 'Apasă "Join Challenge" pentru a participa. Unele challenge-uri pot cere și dovezi foto când termini.',
    target: '[data-tour="join-button"]',
    position: 'top',
    highlight: true,
  },
  {
    id: 'challenges-progress',
    page: '/client/challenges',
    title: '📊 Urmărește Progresul',
    content: 'Bara de progres îți arată cât mai ai de făcut. Când ajungi la 100%, primești automat recompensa!',
    target: '[data-tour="progress-bar"]',
    position: 'bottom',
    highlight: true,
  },

  // Final
  {
    id: 'tour-complete',
    page: '/client/challenges',
    title: '🎉 Gata! Ești Pregătit!',
    content: 'Acum știi tot ce trebuie! Începe să explorezi joburile disponibile și să câștigi XP. Succes! 💪',
    target: null,
    position: 'center',
    highlight: false,
    isFinal: true,
  },
];

// Tour steps for Entrepreneur role
export const entrepreneurTourSteps = [
  {
    id: 'company-intro',
    page: '/entrepreneur/company',
    title: '🏢 Profilul Companiei',
    content: 'Completează aici informațiile despre compania ta. Un profil complet atrage mai mulți aplicanți!',
    target: null,
    position: 'center',
    highlight: false,
  },
  {
    id: 'services-create',
    page: '/entrepreneur/services',
    title: '➕ Creează Servicii',
    content: 'Postează joburi temporare: descrie munca, setează prețul și programul. Aplicanții vor veni imediat!',
    target: '[data-tour="create-service"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'bookings-manage',
    page: '/entrepreneur/bookings',
    title: '📋 Gestionează Cereri',
    content: 'Aici vezi cine a aplicat la joburile tale. Acceptă sau refuză cererile și comunică cu lucrătorii.',
    target: null,
    position: 'center',
    highlight: false,
  },
  {
    id: 'offers-create',
    page: '/entrepreneur/offers',
    title: '🎁 Creează Oferte',
    content: 'Oferă bonusuri lucrătorilor: reduceri, mese gratuite sau bonusuri în bani. Îi motivezi și îi fidelizezi!',
    target: '[data-tour="create-offer"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'challenges-create',
    page: '/entrepreneur/challenges',
    title: '🏆 Creează Challenge-uri',
    content: 'Motivează-ți lucrătorii cu provocări! Oferă recompense pentru performanță și vei atrage cei mai buni.',
    target: '[data-tour="create-challenge"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'entrepreneur-complete',
    page: '/entrepreneur/challenges',
    title: '🎉 Ești Pregătit!',
    content: 'Acum poți să postezi joburi și să găsești personal temporar rapid! Succes! 🚀',
    target: null,
    position: 'center',
    highlight: false,
    isFinal: true,
  },
];

const GuidedTour = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightStyle, setHighlightStyle] = useState({});
  const [sidebarHighlightStyle, setSidebarHighlightStyle] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tooltipRef = useRef(null);
  const currentTargetRef = useRef(null);
  const previousTargetRef = useRef(null);

  const steps = user?.role === 'Entrepreneur' ? entrepreneurTourSteps : clientTourSteps;
  const currentStep = steps[currentStepIndex];

  // Navigate to step's page if needed
  useEffect(() => {
    if (!isActive || !currentStep) return;
    
    if (location.pathname !== currentStep.page) {
      navigate(currentStep.page);
    }
  }, [currentStepIndex, currentStep, location.pathname, navigate, isActive]);

  // Position tooltip based on target element
  const positionTooltip = useCallback(() => {
    if (!currentStep || !isActive) return;

    const tooltip = tooltipRef.current;
    if (!tooltip) return;

    // Remove highlight class from previous target
    if (previousTargetRef.current) {
      previousTargetRef.current.classList.remove('tour-target-highlighted');
    }

    // Find and highlight sidebar nav item for current page
    const sidebarLink = document.querySelector(`a[href="${currentStep.page}"]`);
    if (sidebarLink) {
      const sidebarRect = sidebarLink.getBoundingClientRect();
      setSidebarHighlightStyle({
        top: sidebarRect.top - 4,
        left: sidebarRect.left - 4,
        width: sidebarRect.width + 8,
        height: sidebarRect.height + 8,
      });
      // Add class to make sidebar link visible
      sidebarLink.classList.add('tour-target-highlighted');
    } else {
      setSidebarHighlightStyle({});
    }

    if (!currentStep.target || currentStep.position === 'center') {
      // Center in viewport
      setTooltipPosition({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      setHighlightStyle({});
      currentTargetRef.current = null;
      return;
    }

    // Find target element
    const targetEl = document.querySelector(currentStep.target);
    if (!targetEl) {
      // If target not found, center it
      setTooltipPosition({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      setHighlightStyle({});
      currentTargetRef.current = null;
      return;
    }

    currentTargetRef.current = targetEl;
    previousTargetRef.current = targetEl;

    // Add class to make target visible above backdrop
    targetEl.classList.add('tour-target-highlighted');

    // Scroll target element into view smoothly
    targetEl.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });

    // Wait for scroll to complete, then position elements
    setTimeout(() => {
      const targetRect = targetEl.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const padding = 20;
      const highlightPadding = 12;

      // Update highlight position with smooth transition
      if (currentStep.highlight) {
        setHighlightStyle({
          top: targetRect.top - highlightPadding,
          left: targetRect.left - highlightPadding,
          width: targetRect.width + highlightPadding * 2,
          height: targetRect.height + highlightPadding * 2,
        });
      }

      let top, left, transform = '';

      switch (currentStep.position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - padding;
          left = targetRect.left + targetRect.width / 2;
          transform = 'translateX(-50%)';
          break;
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + targetRect.width / 2;
          transform = 'translateX(-50%)';
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2;
          left = targetRect.left - tooltipRect.width - padding;
          transform = 'translateY(-50%)';
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2;
          left = targetRect.right + padding;
          transform = 'translateY(-50%)';
          break;
        default:
          top = targetRect.bottom + padding;
          left = targetRect.left + targetRect.width / 2;
          transform = 'translateX(-50%)';
      }

      // Keep tooltip in viewport
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = targetRect.bottom + padding; // Flip to bottom if too high
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = targetRect.top - tooltipRect.height - padding; // Flip to top if too low
      }

      setTooltipPosition({ top: `${top}px`, left: `${left}px`, transform });
    }, 350); // Wait for scroll animation
  }, [currentStep, isActive]);

  // Cleanup function to remove highlight classes
  const cleanupHighlights = useCallback(() => {
    document.querySelectorAll('.tour-target-highlighted').forEach(el => {
      el.classList.remove('tour-target-highlighted');
    });
  }, []);

  // Position on step change or page load
  useEffect(() => {
    if (!isActive) return;

    // Wait for page to render
    const timer = setTimeout(() => {
      positionTooltip();
    }, 300);

    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip);
    };
  }, [positionTooltip, isActive, location.pathname]);

  // Cleanup highlights when component unmounts
  useEffect(() => {
    return () => {
      cleanupHighlights();
    };
  }, [cleanupHighlights]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setIsTransitioning(true);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setIsAnimating(false);
        setTimeout(() => setIsTransitioning(false), 400);
      }, 300);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setIsTransitioning(true);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev - 1);
        setIsAnimating(false);
        setTimeout(() => setIsTransitioning(false), 400);
      }, 300);
    }
  };

  const handleComplete = async () => {
    setShowConfetti(true);
    
    // Mark tutorial as complete in database
    try {
      await userService.completeTutorial();
    } catch (error) {
      console.error('Error marking tutorial complete:', error);
    }
    
    // Also keep localStorage for faster checks
    localStorage.setItem('bizquits_tour_complete', 'true');
    localStorage.setItem('bizquits_tour_date', new Date().toISOString());
    
    setTimeout(() => {
      cleanupHighlights();
      setShowConfetti(false);
      setIsActive(false);
      onComplete?.();
    }, 2000);
  };

  const handleSkip = async () => {
    // Mark tutorial as complete even when skipped
    try {
      await userService.completeTutorial();
    } catch (error) {
      console.error('Error marking tutorial complete:', error);
    }
    
    cleanupHighlights();
    localStorage.setItem('bizquits_tour_skipped', 'true');
    setIsActive(false);
    onSkip?.();
    onComplete?.();
  };

  if (!isActive || !currentStep) return null;

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className={`guided-tour-overlay ${isTransitioning ? 'transitioning' : ''}`}>
      {/* Backdrop with cutout */}
      <div className="guided-tour-backdrop" />

      {/* Highlight box around target element */}
      {currentStep.highlight && currentStep.target && highlightStyle.width && (
        <div 
          className="guided-tour-highlight"
          style={{
            top: `${highlightStyle.top}px`,
            left: `${highlightStyle.left}px`,
            width: `${highlightStyle.width}px`,
            height: `${highlightStyle.height}px`,
          }}
        />
      )}

      {/* Highlight box around sidebar navigation item */}
      {sidebarHighlightStyle.width && (
        <div 
          className="guided-tour-highlight sidebar-highlight"
          style={{
            top: `${sidebarHighlightStyle.top}px`,
            left: `${sidebarHighlightStyle.left}px`,
            width: `${sidebarHighlightStyle.width}px`,
            height: `${sidebarHighlightStyle.height}px`,
          }}
        />
      )}

      {/* Confetti */}
      {showConfetti && (
        <div className="tour-confetti">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="confetti-piece"
              style={{
                '--delay': `${Math.random() * 1}s`,
                '--x': `${Math.random() * 100}%`,
                '--rotation': `${Math.random() * 360}deg`,
                '--color': ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6'][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className={`guided-tour-tooltip ${isAnimating ? 'animating' : ''} ${currentStep.isFinal ? 'final' : ''}`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: tooltipPosition.transform,
        }}
      >
        {/* Skip button */}
        {!currentStep.isFinal && (
          <button className="tour-skip-btn" onClick={handleSkip}>
            {Icons.x}
          </button>
        )}

        {/* Progress bar */}
        <div className="tour-progress">
          <div className="tour-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Content */}
        <div className="tour-content">
          {/* Mascot */}
          <div className="tour-mascot">
            <BiscuitMascot size="sm" animate />
          </div>

          <div className="tour-text">
            <h3 className="tour-title">{currentStep.title}</h3>
            <p className="tour-description">{currentStep.content}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="tour-navigation">
          <div className="tour-step-indicator">
            {currentStepIndex + 1} / {steps.length}
          </div>
          
          <div className="tour-buttons">
            {currentStepIndex > 0 && (
              <button className="tour-btn tour-btn-secondary" onClick={handlePrev}>
                {Icons.arrowLeft}
                <span>Înapoi</span>
              </button>
            )}
            
            {currentStep.isFinal ? (
              <button className="tour-btn tour-btn-cta" onClick={handleComplete}>
                <span>Hai la Treabă!</span>
                {Icons.sparkles}
              </button>
            ) : (
              <button className="tour-btn tour-btn-primary" onClick={handleNext}>
                <span>Următorul</span>
                {Icons.arrowRight}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
