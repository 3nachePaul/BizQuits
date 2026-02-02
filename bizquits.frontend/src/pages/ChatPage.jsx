import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import api, { serviceApi } from "../services/api";
import "../styles/Chat.css";

function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newConversationService, setNewConversationService] = useState(null); // For starting new chats
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load conversations and handle serviceId from URL
  useEffect(() => {
    if (user) {
      setLoadingConversations(true);
      api.get('/message/conversations')
        .then(async (res) => {
          const data = res.data;
          setConversations(Array.isArray(data) ? data : []);
          
          // Check if we should auto-select or start new conversation from URL params
          const serviceId = searchParams.get('serviceId');
          if (serviceId) {
            const existingConv = Array.isArray(data) ? data.find(c => c.serviceId === parseInt(serviceId)) : null;
            if (existingConv) {
              setSelectedConversation(existingConv);
              setNewConversationService(null);
            } else {
              // No existing conversation - fetch service details to start new chat
              try {
                const serviceRes = await serviceApi.getById(serviceId);
                setNewConversationService(serviceRes.data);
                setSelectedConversation(null);
                setMessages([]);
              } catch (err) {
                console.error('Error fetching service:', err);
                setError('Failed to load service details');
              }
            }
          }
        })
        .catch(err => {
          console.error('Error fetching conversations:', err);
          setConversations([]);
          setError('Failed to load conversations');
        })
        .finally(() => setLoadingConversations(false));
    }
  }, [user, searchParams]);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      setLoading(true);
      setError(null);
      setNewConversationService(null); // Clear new conversation mode
      api.get(`/message/conversation/service/${selectedConversation.serviceId}`)
        .then(res => {
          const data = res.data;
          setMessages(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('Error fetching messages:', err);
          setMessages([]);
          setError('Failed to load messages');
        })
        .finally(() => setLoading(false));
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Determine serviceId from either selected conversation or new conversation
    const serviceId = selectedConversation?.serviceId || newConversationService?.id;
    if (!serviceId) return;
    
    if (selectedConversation?.isArchived) {
      alert("This conversation is archived. The job has been completed.");
      return;
    }
    
    const payload = { 
      serviceId: serviceId,
      content: newMessage 
    };
    
    try {
      const res = await api.post('/message', payload);
      setMessages([...messages, res.data]);
      setNewMessage("");
      
      if (newConversationService) {
        // This was a new conversation - add it to the list and switch to it
        const newConv = {
          serviceId: newConversationService.id,
          serviceName: newConversationService.name,
          entrepreneurName: newConversationService.entrepreneur?.email || 'Unknown',
          otherParty: { 
            id: newConversationService.entrepreneur?.userId, 
            email: newConversationService.entrepreneur?.email 
          },
          lastMessage: newMessage,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          isArchived: false
        };
        setConversations(prev => [newConv, ...prev]);
        setSelectedConversation(newConv);
        setNewConversationService(null);
      } else {
        // Update last message in existing conversations list
        setConversations(prev => prev.map(c => 
          c.serviceId === selectedConversation.serviceId 
            ? { ...c, lastMessage: newMessage, lastMessageAt: new Date().toISOString() }
            : c
        ));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMsg = err.response?.data || "Failed to send message";
      alert(typeof errorMsg === 'string' ? errorMsg : "Failed to send message");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="chat-container">
      {error && <div className="chat-error">{error}</div>}
      
      <aside className="chat-conversations">
        <h3>Conversations</h3>
        {loadingConversations ? (
          <div className="chat-loading">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="chat-empty">
            <p>No conversations yet.</p>
            <p className="chat-hint">Start a conversation by messaging an entrepreneur from a service page.</p>
          </div>
        ) : (
          <ul>
            {Array.isArray(conversations) && conversations.map(conv => (
              <li
                key={conv.serviceId}
                className={`conversation-item ${selectedConversation?.serviceId === conv.serviceId ? "selected" : ""} ${conv.isArchived ? "archived" : ""}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="conversation-header">
                  <span className="conversation-service">{conv.serviceName}</span>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
                <div className="conversation-meta">
                  <span className="conversation-party">{conv.otherParty?.email}</span>
                  <span className="conversation-time">{formatDate(conv.lastMessageAt)}</span>
                </div>
                {conv.lastMessage && (
                  <div className="conversation-preview">{conv.lastMessage.substring(0, 40)}...</div>
                )}
                {conv.isArchived && (
                  <span className="archived-badge">Archived</span>
                )}
                {conv.bookingStatus && !conv.isArchived && (
                  <span className={`status-badge status-${conv.bookingStatus.toLowerCase()}`}>
                    {conv.bookingStatus}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </aside>
      
      <main className="chat-main">
        {selectedConversation ? (
          <>
            <header className="chat-header">
              <div>
                <h4>{selectedConversation.serviceName}</h4>
                <span className="chat-header-meta">
                  with {selectedConversation.otherParty?.email}
                  {selectedConversation.isArchived && " • Archived"}
                </span>
              </div>
            </header>
            
            <div className="chat-messages">
              {loading ? (
                <div className="chat-loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="chat-empty-messages">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                Array.isArray(messages) && messages.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`chat-msg ${msg.senderId === user?.id ? "own" : ""}`}
                  >
                    <span className="chat-msg-content">{msg.content}</span>
                    <span className="chat-msg-meta">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {selectedConversation.isArchived ? (
              <div className="chat-archived-notice">
                This conversation is archived. The job has been completed.
              </div>
            ) : (
              <form className="chat-input" onSubmit={handleSend}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" disabled={!newMessage.trim()}>Send</button>
              </form>
            )}
          </>
        ) : newConversationService ? (
          <>
            <header className="chat-header">
              <div>
                <h4>{newConversationService.name}</h4>
                <span className="chat-header-meta">
                  New conversation with {newConversationService.entrepreneur?.email || newConversationService.entrepreneur?.companyName || 'Entrepreneur'}
                </span>
              </div>
            </header>
            
            <div className="chat-messages">
              <div className="chat-new-conversation-info">
                <h3>Start a conversation</h3>
                <p>Ask a question about this service:</p>
                <div className="service-preview">
                  <strong>{newConversationService.name}</strong>
                  <p>{newConversationService.description}</p>
                  <span className="service-price">${newConversationService.price}</span>
                </div>
              </div>
              <div ref={messagesEndRef} />
            </div>
            
            <form className="chat-input" onSubmit={handleSend}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Ask a question about this service..."
              />
              <button type="submit" disabled={!newMessage.trim()}>Send</button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder">
            <p>Select a conversation to start chatting.</p>
            <p className="chat-hint">Conversations are tied to services. Browse services to start a new conversation with an entrepreneur.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ChatPage;
