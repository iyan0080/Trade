import React from 'react';
import { PriceData, SplitLayout } from '../types';
import {
  Activity,
  Layers,
  LayoutGrid,
  Columns,
  Rows,
  Maximize2,
  Volume2,
  VolumeX,
  Calculator,
  Bell,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  X,
  Zap,
  Check,
  HelpCircle,
} from 'lucide-react';
import { soundManager } from '../services/soundService';

interface HeaderProps {
  priceData: PriceData | null;
  layout: SplitLayout;
  onLayoutChange: (layout: SplitLayout) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeAlertCount: number;
  onOpenCalculator: () => void;
  onOpenAlerts: () => void;
  isScanning: boolean;
  onRefreshScan: () => void;
  onSyncPrice?: (newPrice: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  priceData,
  layout,
  onLayoutChange,
  soundEnabled,
  onToggleSound,
  activeAlertCount,
  onOpenCalculator,
  onOpenAlerts,
  isScanning,
  onRefreshScan,
  onSyncPrice,
}) => {
  const isBullish = (priceData?.change || 0) >= 0;
  const [showSyncModal, setShowSyncModal] = React.useState(false);
  const [customInputPrice, setCustomInputPrice] = React.useState('');

  const handleApplyPrice = (val: number) => {
    if (!isNaN(val) && val > 0 && onSyncPrice) {
      soundManager.playBlip();
      onSyncPrice(val);
      setShowSyncModal(false);
      setCustomInputPrice('');
    }
  };

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customInputPrice);
    handleApplyPrice(val);
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 select-none">
      {/* Top Banner Ticker Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 gap-3">
        {/* Brand & Market Ticker */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <span className="text-sm font-black tracking-tighter">GH</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-white text-sm tracking-wider uppercase text-amber-400">
                  GOLD HUNT
                </h1>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OANDA FEED
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-medium">
                XAU/USD SCALP & INTRADAY
              </p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

          {/* Live Price Display & Calibration */}
          {priceData && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isBullish ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isBullish ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-lg font-bold text-amber-400 tracking-tight">
                        ${priceData.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        USD/oz t
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 -mt-0.5" title="1 Troy Ounce = 31.1035 gram">
                      Troy Ounce (~${(priceData.price / 31.1035).toFixed(2)}/g)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-mono text-xs pl-1 border-l border-slate-800">
                  <span
                    className={`flex items-center font-semibold ${
                      isBullish ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isBullish ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {isBullish ? '+' : ''}
                    {priceData.change.toFixed(2)} ({isBullish ? '+' : ''}
                    {priceData.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* MT5 Price Calibration Button */}
              <div>
                <button
                  onClick={() => setShowSyncModal(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-all shadow-sm group"
                  title="Sinkronkan harga aplikasi dengan harga pada MT5 Anda (satuan Troy Ounce)"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Sinkron MT5</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Macro Quick Metrics */}
        {priceData && (
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-slate-500">SATUAN: </span>
              <strong className="text-amber-300 font-bold">Troy Ounce (oz t)</strong>
            </div>
            <div className="h-3 w-[1px] bg-slate-800" />
            <div>
              <span className="text-slate-500">24H HIGH: </span>
              <strong className="text-emerald-400">${priceData.high24h.toFixed(2)}</strong>
            </div>
            <div className="h-3 w-[1px] bg-slate-800" />
            <div>
              <span className="text-slate-500">24H LOW: </span>
              <strong className="text-rose-400">${priceData.low24h.toFixed(2)}</strong>
            </div>
            <div className="h-3 w-[1px] bg-slate-800" />
            <div>
              <span className="text-slate-500">PER GRAM: </span>
              <strong className="text-amber-400">${(priceData.price / 31.1035).toFixed(2)}</strong>
            </div>
            <div className="h-3 w-[1px] bg-slate-800" />
            <div>
              <span className="text-slate-500">FEED: </span>
              <strong className="text-emerald-400 font-sans">OANDA</strong>
            </div>
            <div className="h-3 w-[1px] bg-slate-800" />
            <div>
              <span className="text-slate-500">SESI: </span>
              <strong className="text-amber-300 font-sans">{priceData.activeSession}</strong>
            </div>
          </div>
        )}

        {/* Action Controls & Split Screen Layout Selector */}
        <div className="flex items-center gap-2">
          {/* Split Screen Layout Switcher */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800" title="Split Screen Mode">
            <button
              onClick={() => {
                soundManager.playBlip();
                onLayoutChange('split-dual');
              }}
              className={`p-1.5 rounded transition-all ${
                layout === 'split-dual'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Split Dual (Chart Kiri, Sinyal Kanan)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundManager.playBlip();
                onLayoutChange('split-vertical');
              }}
              className={`p-1.5 rounded transition-all ${
                layout === 'split-vertical'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Split Vertikal (Chart Atas, Sinyal Bawah)"
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundManager.playBlip();
                onLayoutChange('quad-grid');
              }}
              className={`p-1.5 rounded transition-all ${
                layout === 'quad-grid'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Quad Grid (4 Panel Lengkap)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundManager.playBlip();
                onLayoutChange('focus-chart');
              }}
              className={`p-1.5 rounded transition-all ${
                layout === 'focus-chart'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fokus Grafik"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lot Calculator Modal Trigger */}
          <button
            onClick={() => {
              soundManager.playBlip();
              onOpenCalculator();
            }}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-800 transition-all"
            title="Kalkulator Lot Size & Manajemen Resiko"
          >
            <Calculator className="w-4 h-4" />
          </button>

          {/* Alerts Panel Trigger */}
          <button
            onClick={() => {
              soundManager.playBlip();
              onOpenAlerts();
            }}
            className="relative p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-800 transition-all"
            title="Kelola Alert & Notifikasi Harga"
          >
            <Bell className="w-4 h-4" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold rounded-full text-[9px] flex items-center justify-center">
                {activeAlertCount}
              </span>
            )}
          </button>

          {/* Sound Audio Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundManager.setSoundEnabled(!soundEnabled);
            }}
            className={`p-1.5 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-600'
            }`}
            title={soundEnabled ? 'Mute Audio Chimes' : 'Unmute Audio Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* AI Refresh Scan Button */}
          <button
            onClick={() => {
              soundManager.playBlip();
              onRefreshScan();
            }}
            disabled={isScanning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-md transition-all ${
              isScanning
                ? 'bg-amber-500/30 text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 active:scale-95'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScanning ? 'Scanning...' : 'AI Agent Scan'}</span>
          </button>
        </div>
      </div>

      {/* MT5 LIVE PRICE SYNC MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative">
            <button
              onClick={() => setShowSyncModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sinkronisasi Harga OANDA / MT5</h3>
                <p className="text-xs text-slate-400">Sesuaikan feed harga dengan akun broker OANDA atau MetaTrader 5 Anda</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">Harga Aplikasi Saat Ini:</div>
                <div className="text-xl font-bold font-mono text-amber-400 flex items-baseline gap-1">
                  <span>${priceData ? priceData.price.toFixed(2) : '3995.20'}</span>
                  <span className="text-xs text-slate-400 font-sans">/ troy oz</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  ≈ ${( (priceData ? priceData.price : 3995.20) / 31.1035 ).toFixed(2)} USD / gram
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Satuan & Broker:</div>
                <div className="text-xs font-mono font-bold text-amber-400">USD / Troy Ounce (oz t)</div>
                <div className="text-[11px] font-mono text-emerald-400">OANDA (XAU/USD Spot)</div>
              </div>
            </div>

            {/* Quick 1-Click Sync Presets */}
            <div className="space-y-2 mb-4">
              <div className="text-xs font-semibold text-slate-300">Pilihan Cepat (1-Click Presets):</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPrice(3995.00)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/50 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                    <span>OANDA Market Baseline</span>
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">$3,995.00 / oz t</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Harga acuan pasar XAU/USD OANDA</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPrice(4000.00)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/50 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                    <span>Level Psikologis Key 4000</span>
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">$4,000.00 / oz t</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Round Number Resistance</div>
                </button>
              </div>
            </div>

            {/* Manual Custom Price Input Form */}
            <form onSubmit={handleSyncSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Atau Masukkan Harga Sesuai MT5 Anda (USD per Troy Ounce):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={customInputPrice}
                    onChange={(e) => setCustomInputPrice(e.target.value)}
                    placeholder="cth: 3995.50"
                    className="w-full pl-8 pr-28 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                  <span className="absolute right-20 top-2.5 text-[11px] font-mono text-slate-500">
                    / oz t
                  </span>
                  <button
                    type="submit"
                    disabled={!customInputPrice || isNaN(parseFloat(customInputPrice))}
                    className="absolute right-1.5 top-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-all"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <p>
                  <strong>Satuan Troy Ounce:</strong> Standar internasional XAU/USD dihargai dalam 1 Troy Ounce (oz t = 31.1035 gram). Setelah disinkronkan, semua level POI sesi, SL, TP, dan kalkulator lot akan disesuaikan secara matematis.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
