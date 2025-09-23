import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './ChatHeader.module.scss';
import Image from 'next/image';

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <Image
          src="https://www1.tvcf.co.kr/images/RenewV1.1/logo.svg"
          alt="TVCF Logo"
          className={styles.logo}
          width={100}
          height={100}
        />
        <span className={styles.title}>고객센터</span>
      </div>
      <div className={styles.controls}>
        <button onClick={onClose} className={styles.closeButton} aria-label="Close Chatbot">
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
