// src/components/Chatbot.js
import React, { useState } from 'react';
import './Chatbot.css'; // Stil dosyası

const Chatbot = () => {
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSendMessage = () => {
        if (message.trim()) {
            const phoneNumber = '905348290866'; // Kendi WhatsApp numaranızı buraya ekleyin (+90 ile birlikte)
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            setMessage(''); // Mesajı temizle
        }
    };

    return (
        <div className={`chatbot ${isOpen ? 'open' : ''}`}>
            {!isOpen ? (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    💬 Chat
                </button>
            ) : (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <span>Hemen Sorun</span>
                        <button onClick={() => setIsOpen(false)}>X</button>
                    </div>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Mesajınızı buraya yazın..."
                    />
                    <button onClick={handleSendMessage}>Gönder</button>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
