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

      <style jsx>{`
        .chat-page {
          padding: 40px 0;
          height: calc(100vh - 160px);
        }
        .chat-wrapper {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: 100%;
          overflow: hidden;
          padding: 0;
        }

        .chat-sidebar {
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
        }
        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid var(--glass-border);
        }
        .sidebar-header h2 { font-size: 20px; margin-bottom: 16px; }
        .search-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
        }
        .search-box input {
          background: none;
          border: none;
          color: white;
          width: 100%;
          font-size: 14px;
        }
        .search-box input:focus { outline: none; }

        .chat-list {
          flex: 1;
          overflow-y: auto;
        }
        .chat-item {
          padding: 16px 24px;
          display: flex;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        }
        .chat-item:hover { background: rgba(255, 255, 255, 0.02); }
        .chat-item.active { background: rgba(99, 102, 241, 0.08); border-right: 3px solid var(--primary); }
        
        .avatar-wrapper { position: relative; }
        .avatar {
          width: 44px;
          height: 44px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .online-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: var(--success);
          border: 2px solid var(--background);
          border-radius: 50%;
        }

        .chat-info { flex: 1; }
        .chat-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .chat-top strong { font-size: 14px; }
        .chat-top span { font-size: 11px; color: var(--text-muted); }
        .chat-info p {
          font-size: 13px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-area {
          display: flex;
          flex-direction: column;
        }
        .chat-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-info { display: flex; align-items: center; gap: 12px; }
        .header-info span { font-size: 11px; color: var(--success); display: block; }
        
        .message-list {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .message-wrapper { display: flex; width: 100%; }
        .message-wrapper.me { justify-content: flex-end; }
        .message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          position: relative;
        }
        .message-wrapper.me .message-bubble {
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .message-wrapper.other .message-bubble {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-bottom-left-radius: 4px;
        }
        .msg-time {
          display: block;
          font-size: 10px;
          margin-top: 4px;
          opacity: 0.7;
          text-align: right;
        }

        .chat-input-area {
          padding: 24px;
          border-top: 1px solid var(--glass-border);
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .chat-input-area input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-family: inherit;
        }
        .chat-input-area input:focus { outline: none; border-color: var(--primary); }
        .icon-btn { color: var(--text-muted); transition: color 0.3s ease; }
        .icon-btn:hover { color: white; }
        .send-btn { padding: 12px; width: 48px; height: 48px; border-radius: 12px; }

        @media (max-width: 768px) {
          .chat-sidebar { width: 80px; }
          .sidebar-header, .chat-info { display: none; }
          .chat-wrapper { grid-template-columns: 80px 1fr; }
        }
      `}</style>
    </div>
  );
}
