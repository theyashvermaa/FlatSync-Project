import { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800">
      <div className="flex items-center gap-3 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-4 py-2.5 focus-within:border-primary-500 dark:focus-within:border-primary-400 transition-colors">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-transparent text-gray-900 dark:text-zinc-100 text-sm placeholder-gray-400 dark:placeholder-zinc-500 resize-none outline-none max-h-32"
          style={{ lineHeight: '1.5' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`p-2.5 rounded-xl transition-all shadow-xs ${text.trim()
            ? 'bg-primary-600 hover:bg-primary-500 text-white'
            : 'bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed'
            }`}
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-center text-gray-400 dark:text-zinc-500 text-[10px] mt-2 tracking-wider font-semibold">
        PRESS ENTER TO SEND · SHIFT+ENTER FOR NEW LINE
      </p>
    </div>
  );
};

export default ChatInput;