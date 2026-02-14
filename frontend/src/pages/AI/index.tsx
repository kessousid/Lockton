import { useState, useRef, useEffect } from 'react';
import { aiApi, clientsApi } from '../../api/client';
import { Card, Button, Select, Spinner } from '../../components/ui';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Client } from '../../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What coverage does Apex Manufacturing have?",
  "How many claims are pending review?",
  "What's the renewal pipeline looking like?",
  "Recommend coverage for a construction company",
  "What are the top risk factors for our clients?",
  "Summarize our loss ratio trends",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Lockton AI Insurance Assistant. I can help with policy questions, claims guidance, renewal tracking, risk assessments, and more. How can I help you today?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clientsApi.list().then(setClients).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiApi.chat(msg, selectedClient ? Number(selectedClient) : undefined);
      setMessages(prev => [...prev, { role: 'assistant', content: res.response, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Insurance Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">Powered by AI — ask about policies, claims, risk, and more</p>
      </div>

      <div className="flex gap-4">
        <Select
          value={selectedClient}
          onChange={setSelectedClient}
          options={[{ value: '', label: 'No client context' }, ...clients.map(c => ({ value: String(c.id), label: c.name }))]}
          className="w-64"
        />
      </div>

      <Card className="flex flex-col h-[600px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-lockton-navy rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`max-w-[70%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-lockton-navy text-white' : 'bg-gray-100 text-gray-900'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-lockton-gold rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-lockton-navy-dark" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-lockton-navy rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs font-medium text-gray-400 mb-2">SUGGESTED QUESTIONS</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-600 hover:bg-lockton-navy hover:text-white hover:border-lockton-navy transition-colors"
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />{s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about policies, claims, risk assessments..."
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-lockton-navy focus:ring-1 focus:ring-lockton-navy outline-none disabled:opacity-50"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
