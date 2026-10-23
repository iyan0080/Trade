import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';
import { soundManager } from '../services/soundService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

interface GeminiCopilotProps {
  currentPrice: number;
  onTriggerAgentScan: (customQuery?: string) => void;
  isScanning: boolean;
}

export const GeminiCopilot: React.FC<GeminiCopilotProps> = ({
  currentPrice,
  onTriggerAgentScan,
  isScanning,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Halo Trader! Saya **AuraGold AI Agent**, asisten trading XAU/USD berbasis Gemini AI dengan Google Search Grounding.\n\nHarga Gold Spot saat ini berkisar di **$${currentPrice.toFixed(2)}**.\n\nSaya bertugas:
• Mengumpulkan berita terkini dari internet (DXY, Fed rate, Geopolitik, CPI, Yield US10Y)
• Menghitung setup presisi **Scalping M5** (entry cepat, SL ketat) & **Intraday H1** (struktur tren & pivot)
• Memberikan rekomendasi BUY / SELL berlandaskan sentimen berita real-time.\n\nSilakan klik tombol cepat di bawah atau ajukan pertanyaan spesifik!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    'Scan berita internet terkini & rekomendasi BUY/SELL',
    'Analisa korelasi DXY Dollar vs Gold hari ini',
    'Cek validitas setup Scalping M5 saat ini',
    'Setup Intraday H1: Dimana Key Support & Resistance?',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    soundManager.playBlip();
    const userMsg: Message = {
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // If user asked to scan news, also trigger agent scan in background
    if (query.toLowerCase().includes('scan') || query.toLowerCase().includes('berita')) {
      onTriggerAgentScan(query);
    }

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply || 'Tidak ada balasan dari server Gemini AI.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Terjadi gangguan saat memproses query dengan Gemini AI. Silakan coba kembali.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm">AI Agent Market Grounding</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" /> LIVE SEARCH
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Gemini 3.8 Flash • Terkoneksi Google Search Grounding
            </p>
          </div>
        </div>

        <button
          onClick={() => onTriggerAgentScan()}
          disabled={isScanning}
          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Agent Scanning...' : 'Refresh Sinyal AI'}</span>
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-slate-950/70 border-b border-slate-800 flex gap-2 overflow-x-auto custom-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="shrink-0 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 px-2.5 py-1 rounded-md border border-slate-800 transition-all flex items-center gap-1 active:scale-98"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[380px] custom-scrollbar">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-amber-400 border border-slate-700'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[88%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line font-sans">{msg.content}</div>
              <div
                className={`text-[9px] mt-1 text-right ${
                  msg.role === 'user' ? 'text-slate-900/70' : 'text-slate-500 font-mono'
                }`}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800 w-fit">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span>AI Agent sedang menelusuri data pasar internet & memproses sinyal...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan analisa atau strategi XAU/USD..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-lg font-bold transition-all active:scale-95"
          title="Kirim pesan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
