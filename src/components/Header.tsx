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
}) => {
  const isBullish = (priceData?.change || 0) >= 0;

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 select-none">
      {/* Top Banner Ticker Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 gap-3">
        {/* Brand & Market Ticker */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <span className="text-base tracking-tighter">AU</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-white text-sm tracking-wide">
                  AuraGold
                </h1>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider">
                XAU/USD SCALP & INTRADAY
              </p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

          {/* Live Price Display */}
          {priceData && (
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
                <span className="font-mono text-lg font-bold text-amber-400 tracking-tight">
                  ${priceData.price.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs">
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
          )}
        </div>

        {/* Global Macro Quick Metrics */}
        {priceData && (
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-800/80">
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
              <span className="text-slate-500">DXY: </span>
              <strong className="text-slate-200">{priceData.dxy}</strong>
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
    </header>
  );
};
