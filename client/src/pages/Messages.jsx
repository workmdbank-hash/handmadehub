import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getMyConversations, getConversation, sendMessage } from '../services/api';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function Messages() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeIdFromUrl = queryParams.get('id');
  const isMobile = useIsMobile();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const loggedInUserId = localStorage.getItem('userId');

  const fetchConversations = async () => {
    try {
      const data = await getMyConversations();
      setConversations(data);
      setLoading(false);
      
      if (activeIdFromUrl) {
        handleSelectConversation(parseInt(activeIdFromUrl));
      } else if (!isMobile && data.length > 0 && !activeConversation) {
        handleSelectConversation(data[0].id);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConversations(); }, [location]);

  useEffect(() => {
    if (!activeConversation) return;
    const interval = setInterval(async () => {
      try {
        const data = await getConversation(activeConversation.id);
        setActiveMessages(data.messages || []);
        setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, messages: c.messages.map(m => ({ ...m, isRead: true })) } : c));
      } catch (error) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  const handleSelectConversation = async (id) => {
    const localConv = conversations.find(c => c.id === id);
    if (localConv) {
      setActiveConversation(localConv);
      setActiveMessages([]);
    }

    setIsLoadingMessages(true);
    try {
      const data = await getConversation(id);
      setActiveConversation(data);
      setActiveMessages(data.messages || []);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, messages: c.messages.map(m => ({ ...m, isRead: true })) } : c));
    } catch (error) { 
      toast.error('Failed to load.'); 
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleBackToInbox = () => {
    setActiveConversation(null);
    setActiveMessages([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    try {
      const msg = await sendMessage(activeConversation.id, newMessage);
      setActiveMessages([...activeMessages, msg]);
      setNewMessage('');
      setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, messages: [msg], updatedAt: new Date() } : c).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    } catch (error) { toast.error('Failed to send.'); }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div style={styles.appContainer}>
      <div style={styles.chatWrapper}>
        {/* Sidebar: Conversation List */}
        <div style={{
          ...styles.sidebar, 
          display: isMobile && activeConversation ? 'none' : 'flex'
        }}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Inbox</h2>
          </div>
          <div style={styles.convList}>
            {conversations.length === 0 ? (
              <p style={styles.emptyText}>No conversations yet.</p>
            ) : (
              conversations.map((c) => {
                const otherUser = String(c.buyerId) === loggedInUserId ? c.seller : c.buyer;
                const lastMessage = c.messages[0] || { message: 'No messages yet' };
                const isActive = activeConversation?.id === c.id;
                const hasUnread = c.messages.some(m => !m.isRead && String(m.senderId) !== loggedInUserId);
                
                return (
                  <div key={c.id} style={isActive ? styles.activeConvItem : styles.convItem} onClick={() => handleSelectConversation(c.id)}>
                    <div style={styles.convAvatar}>
                      {otherUser?.profileImage ? (
                        <img src={otherUser.profileImage.startsWith('/images') ? `http://${window.location.hostname}:3000${otherUser.profileImage}` : otherUser.profileImage} alt="User" style={styles.avatarImg} />
                      ) : (
                        <span>{otherUser?.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div style={styles.convInfo}>
                      <div style={styles.convTopRow}>
                        <span style={styles.convName}>{otherUser?.name}</span>
                        {hasUnread && <span style={styles.unreadBadge}></span>}
                      </div>
                      <p style={styles.convPreview}>{lastMessage.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main: Chat Window */}
        <div style={{
          ...styles.chatWindow, 
          display: isMobile && !activeConversation ? 'none' : 'flex'
        }}>
          {!activeConversation ? (
            <div style={styles.noChatSelected}>
              <span style={{fontSize: '48px'}}>💬</span>
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Sticky Chat Header */}
              <div style={styles.chatHeader}>
                {isMobile && (
                  <button style={styles.backBtn} onClick={handleBackToInbox}>←</button>
                )}
                <div style={styles.chatHeaderInfo}>
                  <h3 style={styles.chatHeaderName}>
                    {String(activeConversation.buyerId) === loggedInUserId ? activeConversation.seller.name : activeConversation.buyer.name}
                  </h3>
                  <Link to={`/product/${activeConversation.productId}`} style={styles.chatHeaderProduct}>
                    🏷️ {activeConversation.product?.name}
                  </Link>
                </div>
              </div>

              {/* Scrollable Messages Area */}
              <div style={styles.messagesArea}>
                {isLoadingMessages ? (
                  <div className="spinner" style={{ margin: 'auto' }}></div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = String(msg.senderId) === loggedInUserId;
                    return (
                      <div key={msg.id} style={isMe ? styles.messageRowRight : styles.messageRowLeft}>
                        <div style={isMe ? styles.bubbleRight : styles.bubbleLeft}>
                          <p style={styles.messageText}>{msg.message}</p>
                          <span style={isMe ? styles.timestampRight : styles.timestampLeft}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sticky Input Bar */}
              <form onSubmit={handleSend} style={styles.inputBar}>
                <input 
                  type="text" 
                  placeholder="Message..." 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  style={styles.textInput}
                />
                <button type="submit" style={styles.sendBtn} disabled={!newMessage.trim()}>
                  ➤
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  // NEW: Adjusted height to prevent page scroll
  appContainer: { 
    height: 'calc(100vh - 130px)', // Adjusted to 130px to account for desktop/mobile headers accurately
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f0f2f5',
    overflow: 'hidden' 
  },
  chatWrapper: {
    flex: 1,
    display: 'flex',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    overflow: 'hidden',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  },
  
  // Sidebar
  sidebar: { 
    width: '320px', 
    borderRight: '1px solid #ddd', 
    backgroundColor: '#fff', 
    flexDirection: 'column',
    flexShrink: 0
  },
  sidebarHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fff',
    flexShrink: 0 
  },
  sidebarTitle: {
    margin: 0,
    color: '#1a1a1a',
    fontSize: '20px',
    fontWeight: '600'
  },
  convList: {
    flexGrow: 1,
    overflowY: 'auto'
  },
  convItem: { 
    display: 'flex', 
    gap: '15px', 
    padding: '15px 20px', 
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
    transition: 'background-color 0.2s'
  },
  activeConvItem: { 
    display: 'flex', 
    gap: '15px', 
    padding: '15px 20px', 
    cursor: 'pointer',
    backgroundColor: '#f0f2f5',
    borderBottom: '1px solid #f5f5f5'
  },
  convAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#8b5a2b',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    flexShrink: 0,
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  convInfo: {
    flex: 1,
    minWidth: 0
  },
  convTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  convName: {
    fontWeight: '600',
    color: '#1a1a1a',
    fontSize: '15px'
  },
  unreadBadge: {
    width: '10px',
    height: '10px',
    backgroundColor: '#8b5a2b',
    borderRadius: '50%'
  },
  convPreview: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#888',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  // Chat Window
  chatWindow: { 
    flexGrow: 1, 
    display: 'flex', 
    flexDirection: 'column',
    backgroundColor: '#e5ddd5',
    overflow: 'hidden',
    position: 'relative' // NEW: For sticky fallback
  },
  noChatSelected: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#666',
    gap: '15px'
  },
  
  // Sticky Chat Header (Fallback added)
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ddd',
    gap: '10px',
    minHeight: '60px',
    flexShrink: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'sticky', // NEW: Sticky fallback
    top: 0,
    zIndex: 10
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#8b5a2b',
    padding: '0 5px'
  },
  chatHeaderInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  chatHeaderName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  chatHeaderProduct: {
    fontSize: '13px',
    color: '#8b5a2b',
    textDecoration: 'none',
    marginTop: '2px'
  },

  // Scrollable Messages Area
  messagesArea: { 
    flexGrow: 1, 
    overflowY: 'auto', 
    padding: '20px 15px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px',
    backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    WebkitOverflowScrolling: 'touch'
  },
  messageRowLeft: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  messageRowRight: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  bubbleLeft: {
    backgroundColor: '#fff',
    padding: '8px 12px',
    borderRadius: '12px 12px 12px 0',
    maxWidth: '75%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    position: 'relative'
  },
  bubbleRight: {
    backgroundColor: '#8b5a2b',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '12px 12px 0 12px',
    maxWidth: '75%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    position: 'relative'
  },
  messageText: {
    margin: 0,
    fontSize: '15px',
    lineHeight: '1.4',
    wordWrap: 'break-word'
  },
  timestampLeft: {
    fontSize: '10px',
    color: '#999',
    marginTop: '4px',
    display: 'block',
    textAlign: 'right'
  },
  timestampRight: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.7)',
    marginTop: '4px',
    display: 'block',
    textAlign: 'right'
  },

  // Sticky Input Bar (Fallback added)
  inputBar: {
    display: 'flex',
    padding: '10px 15px',
    backgroundColor: '#fff',
    borderTop: '1px solid #ddd',
    gap: '10px',
    alignItems: 'center',
    flexShrink: 0,
    paddingBottom: '15px',
    position: 'sticky', // NEW: Sticky fallback
    bottom: 0,
    zIndex: 10
  },
  textInput: {
    flexGrow: 1,
    height: '40px',
    padding: '0 15px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    backgroundColor: '#f0f2f5',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'inherit'
  },
  sendBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#8b5a2b',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background-color 0.2s'
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: '20px'
  }
};

export default Messages;