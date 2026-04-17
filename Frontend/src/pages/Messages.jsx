// src/pages/Messages.jsx
// WhatsApp-style messaging UI
// Left sidebar: list of conversations
// Right panel: active chat window
// Messages stored in component state for now
// (backend Socket.io integration is the next upgrade)
import React from "react";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Demo conversations — in real app these come from backend
const demoConversations = [
  {
    id: "1",
    name: "Priya Sharma",
    initials: "PS",
    avatarColor: "#7C6FCD",
    lastMessage: "Hey! When can we meet?",
    time: "2:34 PM",
    unread: 2,
    messages: [
      { id: 1, from: "them", text: "Hi! I saw your profile on FlatSync.", time: "2:20 PM" },
      { id: 2, from: "me",   text: "Hey Priya! Yeah I liked your listing a lot.", time: "2:22 PM" },
      { id: 3, from: "them", text: "Great! What's your move-in date?", time: "2:30 PM" },
      { id: 4, from: "them", text: "Hey! When can we meet?", time: "2:34 PM" },
    ],
  },
  {
    id: "2",
    name: "Arjun Mehta",
    initials: "AM",
    avatarColor: "#2E9E7E",
    lastMessage: "What's your budget range?",
    time: "Yesterday",
    unread: 0,
    messages: [
      { id: 1, from: "me",   text: "Hi Arjun, I came across your listing.", time: "Yesterday" },
      { id: 2, from: "them", text: "Oh nice! Tell me about yourself.", time: "Yesterday" },
      { id: 3, from: "them", text: "What's your budget range?", time: "Yesterday" },
    ],
  },
  {
    id: "3",
    name: "Sneha Rao",
    initials: "SR",
    avatarColor: "#D06B3B",
    lastMessage: "Sounds perfect! Let's connect.",
    time: "Mon",
    unread: 0,
    messages: [
      { id: 1, from: "them", text: "Hello! I think we'd be great flatmates.", time: "Mon" },
      { id: 2, from: "me",   text: "Yes I agree! Your profile looks great.", time: "Mon" },
      { id: 3, from: "them", text: "Sounds perfect! Let's connect.", time: "Mon" },
    ],
  },
];

function Messages() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const bottomRef    = useRef(null);

  const [conversations, setConversations] = useState(demoConversations);
  const [activeConvId, setActiveConvId]   = useState("1");
  const [newMessage, setNewMessage]       = useState("");

  // If navigated from a profile → open that conversation
  useEffect(() => {
    if (location.state?.person) {
      const person = location.state.person;
      // Check if conversation already exists
      const exists = conversations.find((c) => c.name === person.name);
      if (!exists) {
        const newConv = {
          id: person._id || Date.now().toString(),
          name: person.name,
          initials: person.initials,
          avatarColor: person.avatarColor,
          lastMessage: "Start a conversation...",
          time: "Now",
          unread: 0,
          messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(newConv.id);
      } else {
        setActiveConvId(exists.id);
      }
    }
  }, [location.state]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, conversations]);

  // Redirect if not logged in
  if (!user) {
    return (
      <div style={styles.authWall}>
        <div style={styles.authCard}>
          <div style={styles.authIcon}>💬</div>
          <h2 style={styles.authTitle}>Login to access messages</h2>
          <p style={styles.authSub}>You need to be logged in to send and receive messages.</p>
          <button style={styles.authBtn} onClick={() => navigate("/login")}>
            Login →
          </button>
        </div>
      </div>
    );
  }

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now(),
      from: "me",
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConvId
          ? { ...conv, messages: [...conv.messages, msg], lastMessage: msg.text, time: msg.time }
          : conv
      )
    );
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.page}>

      {/* ── LEFT SIDEBAR: Conversation list ── */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Messages</h2>
          <span style={styles.sidebarCount}>{conversations.length} chats</span>
        </div>

        <div style={styles.convList}>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              style={{
                ...styles.convItem,
                ...(activeConvId === conv.id ? styles.convItemActive : {}),
              }}
            >
              {/* Avatar */}
              <div style={{ ...styles.convAvatar, backgroundColor: conv.avatarColor }}>
                {conv.initials}
              </div>

              {/* Name + last message */}
              <div style={styles.convInfo}>
                <div style={styles.convName}>{conv.name}</div>
                <div style={styles.convLast}>{conv.lastMessage}</div>
              </div>

              {/* Time + unread badge */}
              <div style={styles.convMeta}>
                <span style={styles.convTime}>{conv.time}</span>
                {conv.unread > 0 && (
                  <span style={styles.unreadBadge}>{conv.unread}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Active chat window ── */}
      {activeConv ? (
        <div style={styles.chatWindow}>

          {/* Chat header */}
          <div style={styles.chatHeader}>
            <div style={{ ...styles.chatAvatar, backgroundColor: activeConv.avatarColor }}>
              {activeConv.initials}
            </div>
            <div>
              <div style={styles.chatName}>{activeConv.name}</div>
              <div style={styles.chatStatus}>Active now</div>
            </div>
          </div>

          {/* Messages area */}
          <div style={styles.messagesArea}>
            {activeConv.messages.length === 0 && (
              <p style={styles.emptyChat}>
                Say hi to {activeConv.name}! 👋
              </p>
            )}

            {activeConv.messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.msgRow,
                  justifyContent: msg.from === "me" ? "flex-end" : "flex-start",
                }}
              >
                {/* Avatar for their messages */}
                {msg.from === "them" && (
                  <div style={{ ...styles.msgAvatar, backgroundColor: activeConv.avatarColor }}>
                    {activeConv.initials}
                  </div>
                )}

                <div style={{ maxWidth: "65%" }}>
                  <div style={{
                    ...styles.msgBubble,
                    ...(msg.from === "me" ? styles.myBubble : styles.theirBubble),
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    ...styles.msgTime,
                    textAlign: msg.from === "me" ? "right" : "left",
                  }}>
                    {msg.time}
                  </div>
                </div>

                {/* Avatar for my messages */}
                {msg.from === "me" && (
                  <div style={styles.myAvatar}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Message input bar */}
          <div style={styles.inputBar}>
            <textarea
              placeholder="Type a message... (Enter to send)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.msgInput}
              rows={1}
            />
            <button
              onClick={handleSend}
              style={{
                ...styles.sendBtn,
                opacity: newMessage.trim() ? 1 : 0.5,
              }}
              disabled={!newMessage.trim()}
            >
              ➤
            </button>
          </div>

        </div>
      ) : (
        <div style={styles.noChatSelected}>
          <p>Select a conversation to start chatting</p>
        </div>
      )}

    </div>
  );
}

const styles = {
  page: {
    paddingTop: "64px",
    height: "100vh",
    display: "flex",
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },

  // Auth wall
  authWall: { paddingTop: "64px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0eeff" },
  authCard: { background: "#fff", borderRadius: "20px", padding: "48px 40px", textAlign: "center", maxWidth: "380px", border: "1px solid #e5e5e5" },
  authIcon: { fontSize: "48px", marginBottom: "16px" },
  authTitle: { fontSize: "22px", fontWeight: 800, color: "#1a1a2e", marginBottom: "8px" },
  authSub: { fontSize: "14px", color: "#888", marginBottom: "24px", lineHeight: 1.6 },
  authBtn: { backgroundColor: "#5c4fcf", color: "#fff", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },

  // Sidebar
  sidebar: {
    width: "320px",
    flexShrink: 0,
    backgroundColor: "#fff",
    borderRight: "1px solid #e5e5e5",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  sidebarHeader: {
    padding: "20px",
    borderBottom: "1px solid #e5e5e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebarTitle: { fontSize: "18px", fontWeight: 800, color: "#1a1a2e" },
  sidebarCount: { fontSize: "12px", color: "#aaa" },
  convList: { flex: 1, overflowY: "auto" },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 20px",
    cursor: "pointer",
    borderBottom: "1px solid #f5f5f5",
    transition: "background 0.15s",
  },
  convItemActive: { backgroundColor: "#f0eeff" },
  convAvatar: {
    width: "44px", height: "44px",
    borderRadius: "50%", color: "#fff",
    fontWeight: 700, fontSize: "14px",
    display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  convInfo: { flex: 1, minWidth: 0 },
  convName: { fontSize: "14px", fontWeight: 700, color: "#1a1a2e", marginBottom: "3px" },
  convLast: { fontSize: "12px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  convMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 },
  convTime: { fontSize: "11px", color: "#aaa" },
  unreadBadge: {
    background: "#5c4fcf", color: "#fff",
    fontSize: "11px", fontWeight: 700,
    borderRadius: "50%", width: "18px",
    height: "18px", display: "flex",
    alignItems: "center", justifyContent: "center",
  },

  // Chat window
  chatWindow: { flex: 1, display: "flex", flexDirection: "column", height: "100%" },
  chatHeader: {
    padding: "16px 24px",
    borderBottom: "1px solid #e5e5e5",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  chatAvatar: {
    width: "40px", height: "40px",
    borderRadius: "50%", color: "#fff",
    fontWeight: 700, fontSize: "14px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  chatName: { fontSize: "15px", fontWeight: 700, color: "#1a1a2e" },
  chatStatus: { fontSize: "12px", color: "#2E9E7E", fontWeight: 500 },

  // Messages
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backgroundColor: "#f9f9f9",
  },
  emptyChat: { textAlign: "center", color: "#aaa", fontSize: "14px", marginTop: "60px" },
  msgRow: { display: "flex", alignItems: "flex-end", gap: "8px" },
  msgAvatar: {
    width: "28px", height: "28px",
    borderRadius: "50%", color: "#fff",
    fontWeight: 700, fontSize: "10px",
    display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  myAvatar: {
    width: "28px", height: "28px",
    borderRadius: "50%",
    background: "#5c4fcf", color: "#fff",
    fontWeight: 700, fontSize: "10px",
    display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  msgBubble: {
    padding: "10px 14px",
    borderRadius: "18px",
    fontSize: "14px",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  myBubble: {
    background: "#5c4fcf",
    color: "#fff",
    borderBottomRightRadius: "4px",
  },
  theirBubble: {
    background: "#fff",
    color: "#1a1a2e",
    border: "1px solid #e5e5e5",
    borderBottomLeftRadius: "4px",
  },
  msgTime: { fontSize: "10px", color: "#bbb", marginTop: "4px", padding: "0 4px" },

  // Input bar
  inputBar: {
    padding: "16px 24px",
    backgroundColor: "#fff",
    borderTop: "1px solid #e5e5e5",
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  },
  msgInput: {
    flex: 1,
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    resize: "none",
    backgroundColor: "#f9f9f9",
    color: "#1a1a2e",
    lineHeight: 1.5,
    maxHeight: "120px",
    overflowY: "auto",
  },
  sendBtn: {
    width: "44px", height: "44px",
    borderRadius: "50%",
    background: "#5c4fcf", color: "#fff",
    border: "none", fontSize: "18px",
    cursor: "pointer", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "opacity 0.2s",
  },
  noChatSelected: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "15px" },
};

export default Messages;