import { useState } from 'react';
import { Trash2, Check, CheckCheck } from 'lucide-react';

const SeenTick = ({ seen }) => {
  if (seen) return <CheckCheck size={12} className="text-emerald-500 dark:text-emerald-400" />;
  return <Check size={12} className="text-gray-400 dark:text-zinc-500" />;
};

const ChatWindow = ({ messages, currentUserId, onDelete }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-950 min-h-[300px]">
        <div className="text-center p-6">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">No messages yet. Say hello!</p>
        </div>
      </div>
    );
  }

  const handleDeleteClick = (msgId) => {
    setConfirmDelete(msgId);
  };

  const handleConfirmDelete = (msgId) => {
    onDelete(msgId);
    setConfirmDelete(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 bg-gray-50 dark:bg-zinc-950">
      {messages.map((msg) => {
        const senderId = msg.senderId?._id
          ? msg.senderId._id.toString()
          : msg.senderId?.toString();

        const isMine = senderId === currentUserId?.toString();
        const senderPhoto = msg.senderId?.photoUrl;
        const senderName = msg.senderId?.name;
        const time = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit',
        });

        return (
          <div key={msg._id}
            className={`flex items-end gap-2 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
            onMouseEnter={() => setHoveredId(msg._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Avatar — received only */}
            {!isMine && (
              senderPhoto ? (
                <img src={senderPhoto} alt={senderName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-5 shadow-xs border border-gray-200 dark:border-zinc-700" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-xs text-gray-700 dark:text-zinc-300 font-bold flex-shrink-0 mb-5 border border-gray-300 dark:border-zinc-700">
                  {senderName?.[0]?.toUpperCase() || '?'}
                </div>
              )
            )}

            {/* Delete button — hover on YOUR messages only */}
            {isMine && hoveredId === msg._id && (
              <button
                onClick={() => handleDeleteClick(msg._id)}
                className="p-1.5 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all mb-5 flex-shrink-0 shadow-xs"
                title="Delete for everyone"
              >
                <Trash2 size={13} />
              </button>
            )}

            <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
              {/* Confirm delete popup */}
              {confirmDelete === msg._id && (
                <div className="mb-1.5 flex items-center gap-2 bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-800/50 shadow-md rounded-xl px-3 py-2 text-xs">
                  <span className="text-gray-700 dark:text-zinc-300 font-medium">Delete for everyone?</span>
                  <button
                    onClick={() => handleConfirmDelete(msg._id)}
                    className="text-rose-600 dark:text-rose-400 hover:underline font-bold"
                  >Yes</button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                  >No</button>
                </div>
              )}

              {/* Bubble */}
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-xs ${isMine
                  ? 'bg-primary-600 text-white rounded-br-sm font-medium'
                  : 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 border border-gray-200/80 dark:border-zinc-800 rounded-bl-sm font-normal'
                }`}>
                {msg.text}
              </div>

              {/* Time + tick */}
              <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-400 dark:text-zinc-500">
                <span>{time}</span>
                {isMine && <SeenTick seen={msg.seen} />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatWindow;