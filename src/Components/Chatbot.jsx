import React, { useMemo, useRef, useState } from 'react';
import { askCyberChat } from '../api';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your cybersecurity assistant. Ask me about phishing, malware, secure coding, log analysis, incident response, or general best practices.' }
  ]);

  const listRef = useRef(null);
  const history = useMemo(() => messages.map(({ role, content }) => ({ role, content })), [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);

    try {
      const { answer } = await askCyberChat(text, next);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer || "I couldn't generate a response." }]);
    } catch (e) {
      console.error('Chat error', e);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, there was an error contacting the assistant.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-blue-600 text-white shadow-lg px-4 py-3 hover:bg-blue-700 transition-colors"
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
      >
        {open ? 'Close Chat' : 'Chatbot'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[92vw] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
            <div className="font-semibold">UF XRay Cybersecurity Assistant</div>
            <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-900">✕</button>
          </div>

          <div ref={listRef} className="p-3 h-80 overflow-y-auto space-y-3 bg-white">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'assistant' ? 'text-sm flex' : 'text-sm flex justify-end'}>
                <div className={
                  'px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap ' +
                  (m.role === 'assistant' ? 'bg-gray-100 text-gray-900' : 'bg-blue-600 text-white')
                }>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-sm flex">
                <div className="px-3 py-2 rounded-lg max-w-[85%] bg-gray-100 text-gray-600">Thinking…</div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about cyber security..."
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="rounded-md bg-blue-600 text-white px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                Send
              </button>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Stay ethical: I won’t help with harmful activities.</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
