import React from 'react';
import './BiscuitMascot.css';
import logoImage from '../assets/bizquits-logo.png';

/**
 * BiscuitMascot - The BizQuits logo
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - animate: boolean (default: true)
 * - showLabel: boolean - show "BizQuits" text below (default: false)
 * - className: additional classes
 */
const BiscuitMascot = ({ 
  size = 'md', 
  animate = true,
  showLabel = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'biscuit-sm',
    md: 'biscuit-md',
    lg: 'biscuit-lg',
    xl: 'biscuit-xl'
  };

  return (
    <div className={`biscuit-mascot ${sizeClasses[size]} ${animate ? 'animate' : ''} ${className}`}>
      <img 
        src={logoImage} 
        alt="BizQuits Logo" 
        className="biscuit-logo-img"
      />
      
      {/* Optional label */}
      {showLabel && (
        <div className="biscuit-label">BizQuits</div>
      )}
    </div>
  );
};

export default BiscuitMascot;
