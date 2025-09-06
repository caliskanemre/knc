// src/components/Chatbot.js
import React, { useState, useEffect } from 'react';
import './Chatbot.css'; // Stil dosyası
import { useTranslation } from 'react-i18next';

const Chatbot = () => {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineStatus, setOnlineStatus] = useState(true);

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
                window.open(whatsappUrl, '_blank');
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

    return (
        <div className={`chatbot ${isOpen ? 'open' : ''}`}>
            {!isOpen ? (
                <div className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <div className="chat-icon">
                        <span className="message-icon">💬</span>
                        {onlineStatus && <div className="online-indicator"></div>}
                    </div>
                    <span className="chat-text">{t('liveSupport')}</span>
                    {onlineStatus && <div className="pulse-animation"></div>}
                </div>
            ) : (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <div className="agent-info">
                            <div className="agent-avatar">
                                <span>👩‍💼</span>
                                <div className={`status-dot ${onlineStatus ? 'online' : 'offline'}`}></div>
                            </div>
                            <div className="agent-details">
                                <span className="agent-name">{t('customerRepresentative')}</span>
                                <span className="agent-status">
                                    {onlineStatus ? t('online') : t('comingBackSoon')}
                                </span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            ✕
                        </button>
                    </div>

                    <div className="chat-body">
                        <div className="welcome-message">
                            <div className="message-bubble received">
                                <p>{t('hello')}</p>
                                <p>{t('howCanIHelp')}</p>
                                <span className="message-time">{t('now')}</span>
                            </div>
                        </div>

                        {isTyping && (
                            <div className="typing-indicator">
                                <div className="typing-bubble">
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="chat-input">
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
                            className="send-btn"
                        >
                            {isTyping ? '⏳' : '📤'}
                        </button>
                    </div>

                    <div className="powered-by">
                        <span>{t('secureMessagingWhatsApp')}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
