import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendNlpQuery } from '../api/ml';
import type { NlpQueryResult } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  confidence?: number;
  suggestedActions?: string[];
  timestamp: string;
}

export const NlpChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Hello! I am your PeoplePay360 AI HR & Payroll Assistant. Ask me anything about salary forecasts, time-off predictions, or employee attrition risks in plain English.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'What is our Q4 salary forecast?',
        'Who has leave predictions for October?',
        'Are there any high attrition risks?',
      ],
    },
  ]);

  const nlpMutation = useMutation({
    mutationFn: (query: string) => sendNlpQuery(query),
    onSuccess: (data: NlpQueryResult, query: string) => {
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer,
        confidence: data.confidence,
        suggestedActions: data.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg, aiMsg]);
    },
  });

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputQuery.trim();
    if (!text || nlpMutation.isPending) return;

    nlpMutation.mutate(text);
    if (!textToSend) setInputQuery('');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label="Open AI Assistant"
      >
        <span className="text-lg">💬</span>
        <span>Ask AI Assistant</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[520px] overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                🤖
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">PeoplePay NLP Assistant</h3>
                <span className="text-[10px] text-indigo-300 font-medium">Powered by ML Natural Language Engine</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors text-xs"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.confidence && (
                      <span className="mt-1 block text-[10px] text-gray-400 font-mono">
                        Model Confidence: {Math.round(m.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Suggested Chips */}
                  {!isUser && m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                      {m.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(action)}
                          className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full transition-colors shadow-xs"
                        >
                          ⚡ {action}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-gray-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {nlpMutation.isPending && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-2.5 rounded-xl border border-gray-200 w-fit">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                Processing NLP query...
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-200 flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything (e.g. Q4 budget)..."
              className="flex-1 text-xs rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || nlpMutation.isPending}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};
