"use client";

import { useState } from "react";
import { Send, User, Search, MoreVertical, Paperclip, Smile } from "lucide-react";

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState("1");
  const [message, setMessage] = useState("");

  const chats = [
    { id: "1", name: "Ahmet Yılmaz", lastMsg: "Logo tasarımını bitirdim...", time: "12:45", online: true },
    { id: "2", name: "Luna Coffee", lastMsg: "Ödemeyi ne zaman yapalım?", time: "Dün", online: false },
    { id: "3", name: "Dijital Akademi", lastMsg: "Sözleşmeyi onayladınız mı?", time: "Pzt", online: true },
  ];

  const messages = [
    { id: 1, sender: "me", text: "Merhaba, iş ilanıyla ilgileniyorum.", time: "10:00" },
    { id: 2, sender: "other", text: "Selamlar! Next.js tecrübeniz nedir?", time: "10:05" },
    { id: 3, sender: "me", text: "3 yıldır aktif olarak Next.js ile projeler geliştiriyorum.", time: "10:07" },
  ];

  return (
    <div className="chat-page container">
      <div className="chat-wrapper glass-card">
        {/* Sidebar */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Mesajlar</h2>
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Sohbet ara..." />
            </div>
          </div>
          <div className="chat-list">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChat(chat.id)}
              >
                <div className="avatar-wrapper">
                  <div className="avatar">
                    <User size={20} />
                  </div>
                  {chat.online && <div className="online-indicator"></div>}
                </div>
                <div className="chat-info">
                  <div className="chat-top">
                    <strong>{chat.name}</strong>
                    <span>{chat.time}</span>
                  </div>
                  <p>{chat.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="chat-area">
          <div className="chat-header">
            <div className="header-info">
              <div className="avatar">
                <User size={20} />
              </div>
              <div>
                <strong>{chats.find(c => c.id === activeChat)?.name}</strong>
                <span>Çevrimiçi</span>
              </div>
            </div>
            <button className="icon-btn"><MoreVertical size={20} /></button>
          </div>

          <div className="message-list">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                <div className="message-bubble">
                  {msg.text}
                  <span className="msg-time">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <button className="icon-btn"><Paperclip size={20} /></button>
            <input 
              type="text" 
              placeholder="Mesajınızı yazın..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="icon-btn"><Smile size={20} /></button>
            <button className="btn-primary send-btn">
              <Send size={18} />
            </button>
          </div>
        </main>
      </div>


    </div>
  );
}
