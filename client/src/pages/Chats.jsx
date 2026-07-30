import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosInstance';
import ChatWindow from '../components/Chat/ChatWindow';
import ChatInput from '../components/Chat/ChatInput';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const getRoomId = (id1, id2) => [id1, id2].sort().join('_');

const Chats = () => {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const { socket, msgNotifications } = useSocket();
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const bottomRef = useRef(null);

  const roomId = user && receiverId ? getRoomId(user._id, receiverId) : null;

  // 1. Fetch Connections
  useEffect(() => {
    if (!user) return;
    const fetchConnections = async () => {
      try {
        const [incomingRes, outgoingRes] = await Promise.all([
          api.get('/requests/incoming'),
          api.get('/requests/outgoing')
        ]);

        const incoming = incomingRes.data.filter(r => r.status === 'accepted');
        const outgoing = outgoingRes.data.filter(r => r.status === 'accepted');

        const seen = new Set();
        const merged = [];

        incoming.forEach(r => {
          const otherId = r.fromUser._id;
          if (!seen.has(otherId)) {
            seen.add(otherId);
            merged.push(r.fromUser);
          }
        });

        outgoing.forEach(r => {
          const otherId = r.toUser._id;
          if (!seen.has(otherId)) {
            seen.add(otherId);
            merged.push(r.toUser);
          }
        });

        setConnections(merged);
      } catch (err) {
        console.error('Failed to fetch connections:', err);
      } finally {
        setLoadingConnections(false);
      }
    };
    fetchConnections();
  }, [user]);

  // 2. Chat Logic (when a receiverId is present)
  useEffect(() => {
    if (!socket || !user || !roomId) return;

    setLoadingChat(true);

    const handleOnlineList = (onlineList) => {
      setOnlineUsers(onlineList);
    };

    const handleUserOnline = (onlineUserId) => {
      setOnlineUsers(prev => [...new Set([...prev, onlineUserId])]);
    };

    const handleUserOffline = (offlineUserId) => {
      setOnlineUsers(prev => prev.filter(id => id !== offlineUserId));
    };

    const handleMessage = (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
      socket.emit('mark_seen', { roomId, readerId: user._id });
    };

    const handleSeen = ({ readerId }) => {
      if (readerId === user._id?.toString()) return;
      setMessages(prev =>
        prev.map(msg => {
          const msgSenderId = msg.senderId?._id?.toString() ?? msg.senderId?.toString();
          return msgSenderId === user._id?.toString()
            ? { ...msg, seen: true }
            : msg;
        })
      );
    };

    const handleDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    };

    socket.on('online_users_list', handleOnlineList);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('receive_message', handleMessage);
    socket.on('messages_seen', handleSeen);
    socket.on('message_deleted', handleDeleted);

    socket.emit('join_room', roomId);
    socket.emit('mark_seen', { roomId, readerId: user._id });

    // Fetch chat history
    api.get(`/messages/${roomId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Messages fetch failed:', err))
      .finally(() => setLoadingChat(false));

    // Fetch receiver profile
    api.get(`/users/${receiverId}`)
      .then(res => setReceiver(res.data))
      .catch(err => console.error('Receiver fetch failed:', err));

    return () => {
      socket.off('online_users_list', handleOnlineList);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('receive_message', handleMessage);
      socket.off('messages_seen', handleSeen);
      socket.off('message_deleted', handleDeleted);
    };
  }, [socket, user, roomId, receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim() || !socket || !user || !receiverId) return;
    socket.emit('send_message', {
      roomId,
      senderId: user._id,
      receiverId,
      text: text.trim(),
    });
  };

  const deleteMessage = (messageId) => {
    socket.emit('delete_message', { roomId, messageId });
    setMessages(prev => prev.filter(m => m._id !== messageId));
  };

  const isReceiverOnline = onlineUsers?.some(
    id => id.toString() === receiverId?.toString()
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center flex-1 bg-gray-50 dark:bg-zinc-950">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-[calc(100vh-4.5rem)] overflow-hidden bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      {/* Sidebar - Contacts */}
      <div className={`${receiverId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-200`}>
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingConnections ? (
            <div className="flex justify-center p-6">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center p-8 text-gray-500 dark:text-zinc-400">
              <p className="font-semibold text-gray-700 dark:text-zinc-300">No conversations yet.</p>
              <p className="text-xs mt-2">Connect with others to start chatting!</p>
            </div>
          ) : (
            connections.map(contact => {
              const isActive = contact._id === receiverId;
              const isOnline = onlineUsers?.some(
                id => id.toString() === contact._id.toString()
              );
              const hasUnread = msgNotifications.some(n => n.senderId === contact._id);

              return (
                <Link
                  key={contact._id}
                  to={`/chats/${contact._id}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive
                      ? 'bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800/60 shadow-xs'
                      : 'hover:bg-gray-100 dark:hover:bg-zinc-800/60 border border-transparent'
                    }`}
                >
                  <div className="relative shrink-0">
                    {contact.photoUrl ? (
                      <img src={contact.photoUrl} alt={contact.name} className="w-12 h-12 rounded-full object-cover shadow-xs border border-gray-200 dark:border-zinc-700" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-base border border-primary-200 dark:border-primary-800/50">
                        {contact.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-extrabold text-sm truncate ${isActive ? 'text-primary-900 dark:text-primary-200' : 'text-gray-900 dark:text-zinc-100'}`}>
                      {contact.name}
                    </p>
                    <p className={`text-xs truncate ${isActive ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-500 dark:text-zinc-400'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  {hasUnread && !isActive && (
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shrink-0"></div>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!receiverId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50 dark:bg-zinc-950 relative transition-colors duration-200`}>
        {!receiverId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-zinc-950">
            <div className="w-20 h-20 bg-primary-50 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400 shadow-xs border border-primary-100 dark:border-zinc-800">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100 mb-2">Your Messages</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm">Select a conversation from the sidebar to view matches and chat seamlessly.</p>
          </div>
        ) : loadingChat ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">Loading messages...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-xs">
              <button
                onClick={() => navigate('/chats')}
                className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="relative shrink-0">
                {receiver?.photoUrl ? (
                  <img src={receiver.photoUrl} alt={receiver.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-zinc-700 shadow-xs" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm border border-primary-200 dark:border-primary-800/50">
                    {receiver?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {isReceiverOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                )}
              </div>

              <div>
                <p className="text-gray-900 dark:text-zinc-100 font-extrabold text-base leading-tight">
                  {receiver?.name || 'Loading...'}
                </p>
                <p className={`text-xs font-semibold ${isReceiverOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-zinc-500'}`}>
                  {isReceiverOnline ? 'Online now' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950">
              <ChatWindow
                messages={messages}
                currentUserId={user._id}
                onDelete={deleteMessage}
              />
              <div ref={bottomRef} />
            </div>

            {/* Chat Input */}
            <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-800 p-3">
              <ChatInput onSend={sendMessage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chats;
