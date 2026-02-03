import React from 'react';
import './AnimatedBackground.css';

/**
 *  AnimatedBackground - Claymorphism floating blobs
 * 
 * Creates a dreamy ambient background with floating clay blobs:
 * - Violet blobs (primary accent)
 * - Pink blobs (secondary accent)
 * - Sky blobs (tertiary accent)
 * - Emerald & amber blobs (small accents)
 * - Sparkle stars
 * 
 * Props:
 * - variant: 'default' | 'hero' | 'minimal' (default: 'default')
 * - density: 'low' | 'medium' | 'high' (default: 'medium')
 */
const AnimatedBackground = ({ 
  variant = 'default', 
  density = 'medium',
  children 
}) => {
  const getElementCount = () => {
    switch (density) {
      case 'low': return { violet: 2, pink: 1, sky: 1, emerald: 1, amber: 1, sparkles: 3 };
      case 'high': return { violet: 4, pink: 3, sky: 3, emerald: 2, amber: 2, sparkles: 6 };
      default: return { violet: 3, pink: 2, sky: 2, emerald: 1, amber: 1, sparkles: 4 };
    }
  };

  const counts = getElementCount();

  return (
    <div className={`animated-bg animated-bg--${variant}`}>
      {/* Gradient overlays */}
      <div className="bg-gradient-layer" />
      <div className="bg-noise-layer" />
      
      {/* Floating clay blobs */}
      <div className="floating-elements">
        {/* Violet blobs */}
        {[...Array(counts.violet)].map((_, i) => (
          <div 
            key={`violet-${i}`} 
            className={`floating-element blob-violet blob-violet-${i + 1}`}
            style={{ 
              left: `${5 + (i * 30) % 75}%`,
              top: `${10 + (i * 35) % 70}%`
            }}
          />
        ))}

        {/* Pink blobs */}
        {[...Array(counts.pink)].map((_, i) => (
          <div 
            key={`pink-${i}`} 
            className={`floating-element blob-pink blob-pink-${i + 1}`}
            style={{ 
              right: `${10 + (i * 35) % 70}%`,
              top: `${20 + (i * 40) % 60}%`
            }}
          />
        ))}

        {/* Sky blobs */}
        {[...Array(counts.sky)].map((_, i) => (
          <div 
            key={`sky-${i}`} 
            className={`floating-element blob-sky blob-sky-${i + 1}`}
            style={{ 
              left: `${15 + (i * 40) % 65}%`,
              bottom: `${10 + (i * 25) % 50}%`
            }}
          />
        ))}

        {/* Emerald blobs (small accents) */}
        {[...Array(counts.emerald)].map((_, i) => (
          <div 
            key={`emerald-${i}`} 
            className={`floating-element blob-emerald blob-emerald-${i + 1}`}
            style={{ 
              right: `${20 + (i * 45) % 60}%`,
              bottom: `${15 + (i * 30) % 45}%`
            }}
          />
        ))}

        {/* Amber blobs (small accents) */}
        {[...Array(counts.amber)].map((_, i) => (
          <div 
            key={`amber-${i}`} 
            className={`floating-element blob-amber blob-amber-${i + 1}`}
            style={{ 
              left: `${25 + (i * 50) % 55}%`,
              top: `${60 + (i * 20) % 30}%`
            }}
          />
        ))}

        {/* Sparkle stars */}
        {[...Array(counts.sparkles)].map((_, i) => (
          <div 
            key={`sparkle-${i}`} 
            className={`floating-element sparkle sparkle-${i + 1}`}
          />
        ))}
      </div>

      {/* Decorative gradient orbs */}
      <div className="decorative-circles">
        <div className="deco-circle circle-1" />
        <div className="deco-circle circle-2" />
        <div className="deco-circle circle-3" />
      </div>

      {/* Content */}
      <div className="bg-content">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
