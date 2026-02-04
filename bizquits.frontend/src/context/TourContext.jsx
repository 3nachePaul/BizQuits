import React, { createContext, useContext, useState, useCallback } from 'react';

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourType, setTourType] = useState(null); // 'onboarding' or 'guided'

  const startTour = useCallback((type = 'guided') => {
    setTourType(type);
    setIsTourActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setTourType(null);
  }, []);

  // Check if user should see the guided tour (after onboarding)
  const shouldShowGuidedTour = useCallback(() => {
    const onboardingComplete = localStorage.getItem('bizquits_onboarding_complete');
    const tourComplete = localStorage.getItem('bizquits_tour_complete');
    const tourSkipped = localStorage.getItem('bizquits_tour_skipped');
    
    return onboardingComplete === 'true' && !tourComplete && !tourSkipped;
  }, []);

  // Check if user should see onboarding
  const shouldShowOnboarding = useCallback(() => {
    const onboardingComplete = localStorage.getItem('bizquits_onboarding_complete');
    return !onboardingComplete;
  }, []);

  // Reset tour progress (for replay)
  const resetTourProgress = useCallback(() => {
    localStorage.removeItem('bizquits_tour_complete');
    localStorage.removeItem('bizquits_tour_skipped');
  }, []);

  // Reset all progress (for full replay)
  const resetAllProgress = useCallback(() => {
    localStorage.removeItem('bizquits_onboarding_complete');
    localStorage.removeItem('bizquits_onboarding_date');
    localStorage.removeItem('bizquits_tour_complete');
    localStorage.removeItem('bizquits_tour_skipped');
    localStorage.removeItem('bizquits_tour_date');
  }, []);

  const value = {
    isTourActive,
    tourType,
    startTour,
    endTour,
    shouldShowGuidedTour,
    shouldShowOnboarding,
    resetTourProgress,
    resetAllProgress,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

export default TourContext;
