import React, { useState, useEffect, useRef } from 'react';
import {
  PriceData,
  TradeSignal,
  NewsItem,
  MarketSentiment,
  PriceAlert,
  SplitLayout,
} from './types';
import { Header } from './components/Header';
import { ChartWidget } from './components/ChartWidget';
import { SignalCard } from './components/SignalCard';
import { NewsSection } from './components/NewsSection';
import { AlertsManager } from './components/AlertsManager';
import { GeminiCopilot } from './components/GeminiCopilot';
import { LotCalculatorModal } from './components/LotCalculatorModal';
import { soundManager } from './services/soundService';
import {
  Bell,
  X,
  Target,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  Zap,
  Globe,
  TrendingUp,
} from 'lucide-react';

interface ToastAlert {
  id: string;
  type: 'ENTRY' | 'TP' | 'SL' | 'CUSTOM';
  message: string;
  price: number;
  time: string;
}

export default function App() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [scalpingSignal, setScalpingSignal] = useState<TradeSignal | null>(null);
  const [intradaySignal, setIntradaySignal] = useState<TradeSignal | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [citations, setCitations] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [proximityThreshold, setProximityThreshold] = useState<number>(0.5); // $0.50 (5 pips)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [layout, setLayout] = useState<SplitLayout>('split-dual');
  const [activeStrategyOverlay, setActiveStrategyOverlay] = useState<'SCALPING' | 'INTRADAY'>('SCALPING');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [showAlertsDrawer, setShowAlertsDrawer] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  // Ref to hold alerts for the interval loop to avoid stale closures
  const alertsRef = useRef<PriceAlert[]>([]);
  alertsRef.current = alerts;
  const triggeredSetRef = useRef<Set<string>>(new Set());

  // 1. Initial Data Fetch & Periodic Tick Polling
  useEffect(() => {
    fetchPrice();
    fetchNews();
    triggerAgentScan();

    const priceInterval = setInterval(fetchPrice, 1500);
    return () => clearInterval(priceInterval);
  }, []);

  const fetchPrice = async () => {
    try {
      const res = await fetch('/api/price');
      if (res.ok) {
        const data: PriceData = await res.json();
        setPriceData(data);
        checkAlertsAgainstPrice(data.price);
      }
    } catch (err) {
      console.warn('Price fetch error:', err);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setNewsList(data.news || []);
        setLastScanned(data.lastScanned || new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn('News fetch error:', err);
    }
  };

  // 2. Trigger Gemini AI Agent Web Grounding Analysis
  const triggerAgentScan = async (customFocus?: string) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customFocus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.scalping) setScalpingSignal(data.scalping);
        if (data.intraday) setIntradaySignal(data.intraday);
        if (data.marketSentiment) setSentiment(data.marketSentiment);
        if (data.newsItems && data.newsItems.length > 0) setNewsList(data.newsItems);
        if (data.citations) setCitations(data.citations);
        setLastScanned(new Date().toLocaleTimeString());

        // Play feedback blip
        soundManager.playBlip();
      }
    } catch (err) {
      console.error('Agent scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // 3. Proximity & Alert Engine
  const checkAlertsAgainstPrice = (currentPrice: number) => {
    const activeList = alertsRef.current.filter((a) => !a.triggered);

    activeList.forEach((alert) => {
      const distance = Math.abs(currentPrice - alert.targetPrice);
      const isProximity = distance <= proximityThreshold;

      // Check crossing conditions
      const isCrossed =
        (alert.condition === 'CROSS_ABOVE' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'CROSS_BELOW' && currentPrice <= alert.targetPrice);

      if (isProximity || isCrossed) {
        if (!triggeredSetRef.current.has(alert.id)) {
          triggeredSetRef.current.add(alert.id);
          triggerAlertEvent(alert, currentPrice, isCrossed);
        }
      }
    });
  };

  const triggerAlertEvent = (alert: PriceAlert, currentPrice: number, isCrossed: boolean) => {
    // Sound chime based on alert type
    if (alert.type === 'ENTRY') {
      soundManager.playEntryAlert();
    } else if (alert.type === 'TP') {
      soundManager.playTakeProfitAlert();
    } else if (alert.type === 'SL') {
      soundManager.playStopLossWarning();
    } else {
      soundManager.playEntryAlert();
    }

    // Push in-app toast notification
    const newToast: ToastAlert = {
      id: `${Date.now()}-${Math.random()}`,
      type: alert.type,
      message: `${alert.label}: Harga $${currentPrice.toFixed(2)} mendekati target $${alert.targetPrice.toFixed(2)}!`,
      price: currentPrice,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    // Native Browser Notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(`AuraGold Alert: ${alert.label}`, {
          body: `Harga XAU/USD ($${currentPrice.toFixed(2)}) telah mencapai area target ($${alert.targetPrice.toFixed(2)})!`,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Notification failed:', e);
      }
    }

    // Mark as triggered in state
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, triggered: true } : a))
    );
  };

  // 4. One-Click Auto Arming from Signal Setup
  const handleArmAlerts = (signal: TradeSignal, strategyType: 'SCALPING' | 'INTRADAY') => {
    soundManager.playBlip();

    const parseNum = (val?: string) => {
      if (!val) return null;
      const n = parseFloat(val.replace(/[^0-9.]/g, ''));
      return isNaN(n) ? null : n;
    };

    const entryParts = signal.entryZone.split('-').map((p) => parseNum(p.trim())).filter(Boolean) as number[];
    const entryMid = entryParts.length === 2 ? (entryParts[0] + entryParts[1]) / 2 : entryParts[0];
    const sl = parseNum(signal.stopLoss);
    const tp1 = parseNum(signal.takeProfit1);
    const tp2 = parseNum(signal.takeProfit2);

    const newAlerts: PriceAlert[] = [];

    if (entryMid) {
      newAlerts.push({
        id: `entry-${Date.now()}-${Math.random()}`,
        label: `[${strategyType}] Zona Entry`,
        targetPrice: Number(entryMid.toFixed(2)),
        type: 'ENTRY',
        strategy: strategyType,
        condition: 'PROXIMITY',
        triggered: false,
        createdAt: new Date().toISOString(),
      });
    }

    if (sl) {
      newAlerts.push({
        id: `sl-${Date.now()}-${Math.random()}`,
        label: `[${strategyType}] Stop Loss (SL)`,
        targetPrice: sl,
        type: 'SL',
        strategy: strategyType,
        condition: 'PROXIMITY',
        triggered: false,
        createdAt: new Date().toISOString(),
      });
    }

    if (tp1) {
      newAlerts.push({
        id: `tp1-${Date.now()}-${Math.random()}`,
        label: `[${strategyType}] Target TP1`,
        targetPrice: tp1,
        type: 'TP',
        strategy: strategyType,
        condition: 'PROXIMITY',
        triggered: false,
        createdAt: new Date().toISOString(),
      });
    }

    if (tp2) {
      newAlerts.push({
        id: `tp2-${Date.now()}-${Math.random()}`,
        label: `[${strategyType}] Target TP2`,
        targetPrice: tp2,
        type: 'TP',
        strategy: strategyType,
        condition: 'PROXIMITY',
        triggered: false,
        createdAt: new Date().toISOString(),
      });
    }

    setAlerts((prev) => [...prev, ...newAlerts]);
    setShowAlertsDrawer(true);
  };

  const handleAddCustomAlert = (alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => {
    const newAlert: PriceAlert = {
      ...alertData,
      id: `custom-${Date.now()}-${Math.random()}`,
      triggered: false,
      createdAt: new Date().toISOString(),
    };
    setAlerts((prev) => [...prev, newAlert]);
  };

  const handleRemoveAlert = (id: string) => {
    soundManager.playBlip();
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    triggeredSetRef.current.delete(id);
  };

  const handleClearAllAlerts = () => {
    soundManager.playBlip();
    setAlerts([]);
    triggeredSetRef.current.clear();
  };

  const activeAlertsCount = alerts.filter((a) => !a.triggered).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header with Navigation and Ticker */}
      <Header
        priceData={priceData}
        layout={layout}
        onLayoutChange={setLayout}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeAlertCount={activeAlertsCount}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenAlerts={() => setShowAlertsDrawer(!showAlertsDrawer)}
        isScanning={isScanning}
        onRefreshScan={() => triggerAgentScan()}
      />

      {/* Floating Alert Toasts Queue */}
      <div className="fixed top-16 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl flex items-start justify-between gap-3 backdrop-blur-md animate-slideDown ${
              toast.type === 'ENTRY'
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                : toast.type === 'TP'
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                : toast.type === 'SL'
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-200'
                : 'bg-blue-500/20 border-blue-500/60 text-blue-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">
                {toast.type === 'ENTRY' && <Target className="w-5 h-5 text-amber-400 animate-pulse" />}
                {toast.type === 'TP' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                {toast.type === 'SL' && <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />}
                {toast.type === 'CUSTOM' && <Bell className="w-5 h-5 text-blue-400" />}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  {toast.type === 'ENTRY' ? '🚨 ALERT ZONA ENTRY!' : toast.type === 'TP' ? '🎯 TAKE PROFIT TERSENTUH!' : toast.type === 'SL' ? '⚠️ WARNING STOP LOSS!' : '🔔 ALERT HARGA'}
                </div>
                <div className="text-xs text-white mt-0.5 leading-snug">{toast.message}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">{toast.time}</div>
              </div>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Dynamic Viewport Grid */}
      <main className="flex-1 p-3 sm:p-4 max-w-[1720px] w-full mx-auto">
        {/* LAYOUT 1: SPLIT DUAL (Side-by-Side: Chart Left, Signals & News Right) */}
        {layout === 'split-dual' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full">
            {/* Left Column: Interactive Chart + Copilot (7 cols) */}
            <div className="xl:col-span-7 flex flex-col gap-4">
              <div className="h-[480px]">
                <ChartWidget
                  candles={priceData?.candles || []}
                  currentPrice={priceData?.price || 2738.45}
                  scalpingSignal={scalpingSignal}
                  intradaySignal={intradaySignal}
                  activeStrategy={activeStrategyOverlay}
                  onStrategyChange={setActiveStrategyOverlay}
                />
              </div>

              <div className="h-[420px]">
                <GeminiCopilot
                  currentPrice={priceData?.price || 2738.45}
                  onTriggerAgentScan={triggerAgentScan}
                  isScanning={isScanning}
                />
              </div>
            </div>

            {/* Right Column: Signals & Macro News (5 cols) */}
            <div className="xl:col-span-5 flex flex-col gap-4">
              {/* Dual Signal Cards (Scalping M5 & Intraday H1) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                {scalpingSignal && (
                  <SignalCard
                    type="SCALPING"
                    signal={scalpingSignal}
                    currentPrice={priceData?.price || 2738.45}
                    onArmAlerts={handleArmAlerts}
                    isAlertActive={alerts.some((a) => a.strategy === 'SCALPING' && !a.triggered)}
                  />
                )}

                {intradaySignal && (
                  <SignalCard
                    type="INTRADAY"
                    signal={intradaySignal}
                    currentPrice={priceData?.price || 2738.45}
                    onArmAlerts={handleArmAlerts}
                    isAlertActive={alerts.some((a) => a.strategy === 'INTRADAY' && !a.triggered)}
                  />
                )}
              </div>

              {/* News & Macro Fundamental Section */}
              <div className="flex-1 min-h-[400px]">
                <NewsSection
                  news={newsList}
                  sentiment={sentiment}
                  citations={citations}
                  isScanning={isScanning}
                  onRefreshScan={triggerAgentScan}
                  lastScanned={lastScanned}
                />
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 2: SPLIT VERTICAL (Chart Top, Dual Strategy + News Bottom) */}
        {layout === 'split-vertical' && (
          <div className="space-y-4">
            <div className="h-[460px]">
              <ChartWidget
                candles={priceData?.candles || []}
                currentPrice={priceData?.price || 2738.45}
                scalpingSignal={scalpingSignal}
                intradaySignal={intradaySignal}
                activeStrategy={activeStrategyOverlay}
                onStrategyChange={setActiveStrategyOverlay}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                {scalpingSignal && (
                  <SignalCard
                    type="SCALPING"
                    signal={scalpingSignal}
                    currentPrice={priceData?.price || 2738.45}
                    onArmAlerts={handleArmAlerts}
                    isAlertActive={alerts.some((a) => a.strategy === 'SCALPING' && !a.triggered)}
                  />
                )}
              </div>
              <div>
                {intradaySignal && (
                  <SignalCard
                    type="INTRADAY"
                    signal={intradaySignal}
                    currentPrice={priceData?.price || 2738.45}
                    onArmAlerts={handleArmAlerts}
                    isAlertActive={alerts.some((a) => a.strategy === 'INTRADAY' && !a.triggered)}
                  />
                )}
              </div>
              <div>
                <NewsSection
                  news={newsList}
                  sentiment={sentiment}
                  citations={citations}
                  isScanning={isScanning}
                  onRefreshScan={triggerAgentScan}
                  lastScanned={lastScanned}
                />
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 3: QUAD GRID (4 Panels: Chart, Scalping, Intraday, AI Copilot) */}
        {layout === 'quad-grid' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[450px]">
              <ChartWidget
                candles={priceData?.candles || []}
                currentPrice={priceData?.price || 2738.45}
                scalpingSignal={scalpingSignal}
                intradaySignal={intradaySignal}
                activeStrategy={activeStrategyOverlay}
                onStrategyChange={setActiveStrategyOverlay}
              />
            </div>

            <div className="h-[450px]">
              <NewsSection
                news={newsList}
                sentiment={sentiment}
                citations={citations}
                isScanning={isScanning}
                onRefreshScan={triggerAgentScan}
                lastScanned={lastScanned}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scalpingSignal && (
                <SignalCard
                  type="SCALPING"
                  signal={scalpingSignal}
                  currentPrice={priceData?.price || 2738.45}
                  onArmAlerts={handleArmAlerts}
                  isAlertActive={alerts.some((a) => a.strategy === 'SCALPING' && !a.triggered)}
                />
              )}
              {intradaySignal && (
                <SignalCard
                  type="INTRADAY"
                  signal={intradaySignal}
                  currentPrice={priceData?.price || 2738.45}
                  onArmAlerts={handleArmAlerts}
                  isAlertActive={alerts.some((a) => a.strategy === 'INTRADAY' && !a.triggered)}
                />
              )}
            </div>

            <div className="h-[450px]">
              <GeminiCopilot
                currentPrice={priceData?.price || 2738.45}
                onTriggerAgentScan={triggerAgentScan}
                isScanning={isScanning}
              />
            </div>
          </div>
        )}

        {/* LAYOUT 4: FOCUS CHART (Maximized Chart View) */}
        {layout === 'focus-chart' && (
          <div className="space-y-4">
            <div className="h-[650px]">
              <ChartWidget
                candles={priceData?.candles || []}
                currentPrice={priceData?.price || 2738.45}
                scalpingSignal={scalpingSignal}
                intradaySignal={intradaySignal}
                activeStrategy={activeStrategyOverlay}
                onStrategyChange={setActiveStrategyOverlay}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scalpingSignal && (
                <SignalCard
                  type="SCALPING"
                  signal={scalpingSignal}
                  currentPrice={priceData?.price || 2738.45}
                  onArmAlerts={handleArmAlerts}
                />
              )}
              {intradaySignal && (
                <SignalCard
                  type="INTRADAY"
                  signal={intradaySignal}
                  currentPrice={priceData?.price || 2738.45}
                  onArmAlerts={handleArmAlerts}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating or Side Drawer for Alerts Manager */}
      {showAlertsDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-md p-4 flex flex-col animate-slideLeft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Pusat Notifikasi & Alert Harga
            </span>
            <button
              onClick={() => setShowAlertsDrawer(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <AlertsManager
              alerts={alerts}
              currentPrice={priceData?.price || 2738.45}
              onAddAlert={handleAddCustomAlert}
              onRemoveAlert={handleRemoveAlert}
              onClearAll={handleClearAllAlerts}
              proximityThreshold={proximityThreshold}
              onChangeProximityThreshold={setProximityThreshold}
            />
          </div>
        </div>
      )}

      {/* Risk & Lot Size Calculator Modal */}
      <LotCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        defaultSlPips={activeStrategyOverlay === 'SCALPING' ? 30 : 70}
      />
    </div>
  );
}
