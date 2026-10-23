import React, { useState } from 'react';
import { NewsItem, MarketSentiment } from '../types';
import {
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ExternalLink,
  Shield,
  Search,
} from 'lucide-react';
import { soundManager } from '../services/soundService';

interface NewsSectionProps {
  news: NewsItem[];
  sentiment?: MarketSentiment | null;
  citations?: string[];
  isScanning: boolean;
  onRefreshScan: (customFocus?: string) => void;
  lastScanned?: string;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  sentiment,
  citations = [],
  isScanning,
  onRefreshScan,
  lastScanned,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH' | 'NEUTRAL'>('ALL');
  const [customQuery, setCustomQuery] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);

  const filteredNews = news.filter((item) => {
    if (filter === 'ALL') return true;
    return item.impact === filter;
  });

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playBlip();
    onRefreshScan(customQuery.trim());
    setShowSearchBox(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm tracking-wide">
                Koleksi Berita & Data Fundamental XAU/USD
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                LIVE WEB
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Analisa faktor penggerak harga: Fed Rate, DXY, Inflasi, Yield & Geopolitik
            </p>
          </div>
        </div>

        {/* Scan Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearchBox(!showSearchBox)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-all"
            title="Kustomisasi fokus pencarian berita"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Fokus Berita</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBlip();
              onRefreshScan();
            }}
            disabled={isScanning}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all ${
              isScanning
                ? 'bg-amber-500/40 text-slate-950 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 active:scale-98'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Memindai Web...' : 'Scan Berita Baru'}</span>
          </button>
        </div>
      </div>

      {/* Custom Search Form Overlay */}
      {showSearchBox && (
        <form onSubmit={handleScanSubmit} className="p-3 bg-slate-950 border-b border-slate-800 flex gap-2">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Contoh: Pengaruh rilis CPI AS malam ini atau eskalasi Timur Tengah..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-400"
          >
            Cari & Analisa
          </button>
        </form>
      )}

      {/* Macro Sentiment Overview Banner */}
      {sentiment && (
        <div className="p-3.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wider flex items-center gap-1.5 ${
                sentiment.bias === 'BULLISH'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : sentiment.bias === 'BEARISH'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-700/40 text-slate-300 border border-slate-600'
              }`}
            >
              {sentiment.bias === 'BULLISH' && <TrendingUp className="w-3.5 h-3.5" />}
              {sentiment.bias === 'BEARISH' && <TrendingDown className="w-3.5 h-3.5" />}
              {sentiment.bias === 'NEUTRAL' && <Minus className="w-3.5 h-3.5" />}
              <span>BIAS MAKRO: {sentiment.bias}</span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl line-clamp-1">{sentiment.summary}</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Sentimen Index:</span>
            <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  sentiment.bias === 'BULLISH'
                    ? 'bg-emerald-400'
                    : sentiment.bias === 'BEARISH'
                    ? 'bg-rose-400'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${sentiment.score}%` }}
              />
            </div>
            <strong className="text-white">{sentiment.score}%</strong>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/40 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px] mr-1">Filter:</span>
          {(['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                filter === tab
                  ? 'bg-slate-800 text-amber-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'Semua Berita' : tab}
            </button>
          ))}
        </div>

        {lastScanned && (
          <span className="text-[11px] text-slate-500 font-mono">
            Update: {lastScanned}
          </span>
        )}
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[460px] custom-scrollbar">
        {filteredNews.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Tidak ada berita dengan filter ini.
          </div>
        ) : (
          filteredNews.map((item, idx) => {
            const isBull = item.impact === 'BULLISH';
            const isBear = item.impact === 'BEARISH';

            return (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all hover:bg-slate-950/90 group"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-amber-400 transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase font-mono ${
                      isBull
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isBear
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.impact} ({item.impactScore}%)
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                  {item.summary}
                </p>

                {item.relevance && (
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-400 mb-2 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-400/90">Dampak XAU/USD:</strong> {item.relevance}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-slate-400" />
                    Sumber: <strong className="text-slate-400">{item.source}</strong>
                  </span>
                  <span className="font-mono">{item.timestamp}</span>
                </div>
              </div>
            );
          })
        )}

        {/* Google Search Grounding Citations */}
        {citations.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              Sumber Penelusuran Web (Google Search Grounding):
            </div>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              {citations.map((cite, i) => (
                <li key={i} className="truncate">
                  {cite}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
