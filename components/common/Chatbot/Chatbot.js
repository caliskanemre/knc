// src/components/Chatbot.js
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// import './Chatbot.css'; // Stil dosyası
import styles from './Chatbot.module.css';
import { useTranslation } from 'react-i18next';

const Chatbot = () => {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineStatus, setOnlineStatus] = useState(true);
    const [mounted, setMounted] = useState(false); // SSR/CSR guard

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Online durumunu simüle et
    useEffect(() => {
        const interval = setInterval(() => {
            setOnlineStatus(Math.random() > 0.1); // %90 online olma olasılığı
        }, 30000); // 30 saniyede bir kontrol et

        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = () => {
        if (message.trim()) {
            setIsTyping(true);

            // Kısa bir yazıyor simülasyonu
            setTimeout(() => {
                const phoneNumber = '905348290866';
                const finalMessage = `${t('helloWebsiteMessage')}\n\n${message}`;
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;
                if (typeof window !== 'undefined') {
                    window.open(whatsappUrl, '_blank');
                }
                setMessage('');
                setIsTyping(false);
            }, 1000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const content = (
        <div className={`${styles.chatbot} ${isOpen ? styles.open : ''}`} style={{ position: 'fixed' }}>
            {!isOpen ? (
                <div className={styles['chatbot-toggle']} onClick={() => setIsOpen(true)}>
                    <div className={styles['chat-icon']}>
                        <span className={styles['message-icon']}>💬</span>
                        {onlineStatus && <div className={styles['online-indicator']}></div>}
                    </div>
                    <span className={styles['chat-text']}>{t('liveSupport')}</span>
                    {onlineStatus && <div className={styles['pulse-animation']}></div>}
                </div>
            ) : (
                <div className={styles['chatbot-container']}>
                    <div className={styles['chatbot-header']}>
                        <div className={styles['agent-info']}>
                            <div className={styles['agent-avatar']}>
                                <span>👩‍💼</span>
                                <div className={`${styles['status-dot']} ${onlineStatus ? styles.online : styles.offline}`}></div>
                            </div>
                            <div className={styles['agent-details']}>
                                <span className={styles['agent-name']}>{t('customerRepresentative')}</span>
                                <span className={styles['agent-status']}>
                                    {onlineStatus ? t('online') : t('comingBackSoon')}
                                </span>
                            </div>
                        </div>
                        <button className={styles['close-btn']} onClick={() => setIsOpen(false)}>
                            ✕
                        </button>
                    </div>

                    <div className={styles['chat-body']}>
                        <div className={styles['welcome-message']}>
                            <div className={`${styles['message-bubble']} ${styles.received}`}>
                                <p>{t('hello')}</p>
                                <p>{t('howCanIHelp')}</p>
                                <span className={styles['message-time']}>{t('now')}</span>
                            </div>
                        </div>

                        {isTyping && (
                            <div className={styles['typing-indicator']}>
                                <div className={styles['typing-bubble']}>
                                    <div className={styles['typing-dots']}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles['chat-input']}>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={t('typeYourMessage')}
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || isTyping}
                            className={styles['send-btn']}
                        >
                            {isTyping ? '⏳' : '📤'}
                        </button>
                    </div>

                    <div className={styles['powered-by']}>
                        <span>{t('secureMessagingWhatsApp')}</span>
                    </div>
                </div>
            )}
        </div>
    );

    if (!mounted || typeof document === 'undefined') return null;
    return createPortal(content, document.body);
};

export default Chatbot;
