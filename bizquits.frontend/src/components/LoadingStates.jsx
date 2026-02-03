import BiscuitMascot from './BiscuitMascot';
import './LoadingStates.css';

/**
 * Full page loading state with mascot
 */
export function PageLoader({ message = "Loading..." }) {
  return (
    <div className="page-loader">
      <div className="page-loader-content">
        <div className="loader-spinner-ring">
          <div className="spinner-segment"></div>
          <div className="spinner-segment"></div>
          <div className="spinner-segment"></div>
        </div>
        <BiscuitMascot size="lg" />
        <p className="loader-message">{message}</p>
        <div className="loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline/card loading state
 */
export function CardLoader({ rows = 3 }) {
  return (
    <div className="card-loader">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton skeleton-avatar"></div>
          <div className="skeleton-text">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-subtitle"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state with mascot
 */
export function EmptyState({ 
  title = "Nothing here yet", 
  description = "Start by adding something new!",
  action,
  actionLabel
}) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-mascot">
        <BiscuitMascot size="xl" />
      </div>
      <div className="empty-state-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {action && (
          <button className="btn btn-primary" onClick={action}>
            {actionLabel || "Get Started"}
          </button>
        )}
      </div>
      <div className="empty-state-decoration">
        <span className="deco-star"></span>
        <span className="deco-sparkle"></span>
      </div>
    </div>
  );
}

/**
 * Error state with retry option
 */
export function ErrorState({
  title = "Oops! Something went wrong",
  description = "Don't worry, it happens to the best of us.",
  onRetry
}) {
  return (
    <div className="error-state-container">
      <div className="error-state-icon"></div>
      <BiscuitMascot size="lg" />
      <h3>{title}</h3>
      <p>{description}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * Success celebration state
 */
export function SuccessState({
  title = "Success!",
  description = "Everything worked perfectly.",
  onContinue
}) {
  return (
    <div className="success-state-container">
      <div className="success-confetti">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <BiscuitMascot size="xl" />
      <h3>{title}</h3>
      <p>{description}</p>
      {onContinue && (
        <button className="btn btn-primary" onClick={onContinue}>
          Continue
        </button>
      )}
    </div>
  );
}

/**
 * Small inline spinner
 */
export function Spinner({ size = "md" }) {
  return (
    <div className={`inline-spinner inline-spinner--${size}`}>
      <div className="spinner-circle"></div>
    </div>
  );
}

export default {
  PageLoader,
  CardLoader,
  EmptyState,
  ErrorState,
  SuccessState,
  Spinner
};
