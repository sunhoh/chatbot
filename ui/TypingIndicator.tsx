import React from 'react';
import styles from './TypingIndicator.module.scss';

const TypingIndicator: React.FC = () => {
  return (
    <div className={styles.typingIndicatorWrapper}>
      <div className={styles.avatar}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 8v8l7-4-7-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className={styles.bubble}>
        <div className={styles.typingIndicator}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
