import React, { useState } from 'react';
import { Candle, TradeSignal, SessionPOIs } from '../types';
import { Maximize2, Minimize2, Eye, TrendingUp, Sliders, Activity, Layers, Crosshair } from 'lucide-react';

interface ChartWidgetProps {
  candles: Candle[];
  currentPrice: number;
  scalpingSignal?: TradeSignal | null;
  intradaySignal?: TradeSignal | null;
  activeStrategy: 'SCALPING' | 'INTRADAY';
  onStrategyChange: (strategy: 'SCALPING' | 'INTRADAY') => void;
  sessionPOIs?: SessionPOIs;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  candles,
  currentPrice,
  scalpingSignal,
  intradaySignal,
  activeStrategy,
  onStrategyChange,
  sessionPOIs,
}) => {
  const [useTradingView, setUseTradingView] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('M5');
  const [showIndicators, setShowIndicators] = useState<boolean>(true);
  const [showPOIs, setShowPOIs] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  const signal = activeStrategy === 'SCALPING' ? scalpingSignal : intradaySignal;

  // Extract numerical values for chart levels
  const parseNum = (val?: string) => {
    if (!val) return null;
    const n = parseFloat(val.replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  };

  const slLevel = parseNum(signal?.stopLoss);
  const tp1Level = parseNum(signal?.takeProfit1);
  const tp2Level = parseNum(signal?.takeProfit2);
  const tp3Level = parseNum(signal?.takeProfit3);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 440;
  const paddingRight = 85;
  const paddingBottom = 40;
  const paddingTop = 30;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const chartWidth = svgWidth - paddingRight;

  // Calculate min & max prices with buffer including POIs
  const candlePrices = candles.flatMap((c) => [c.low, c.high]);
  if (currentPrice) candlePrices.push(currentPrice);
  if (slLevel) candlePrices.push(slLevel);
  if (tp1Level) candlePrices.push(tp1Level);
  if (tp2Level) candlePrices.push(tp2Level);
  if (showPOIs && sessionPOIs) {
    candlePrices.push(
      sessionPOIs.asianHigh,
      sessionPOIs.asianLow,
      sessionPOIs.londonHigh,
      sessionPOIs.londonLow,
      sessionPOIs.previousDayHigh,
      sessionPOIs.previousDayLow
    );
  }

  const minPrice = candlePrices.length > 0 ? Math.min(...candlePrices) - 1.5 : (currentPrice ? currentPrice - 10 : 3990);
  const maxPrice = candlePrices.length > 0 ? Math.max(...candlePrices) + 1.5 : (currentPrice ? currentPrice + 10 : 4015);
  const priceRange = maxPrice - minPrice || 10;

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  const candleWidth = chartWidth / Math.max(candles.length, 1);

  // Calculate EMA 20
  const ema20Points: { x: number; y: number }[] = [];
  let ema = candles.length > 0 ? candles[0].close : 0;
  const k = 2 / (20 + 1);
  candles.forEach((c, i) => {
    ema = c.close * k + ema * (1 - k);
    const x = i * candleWidth + candleWidth / 2;
    const y = getY(ema);
    ema20Points.push({ x, y });
  });

  const emaPath = ema20Points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Chart Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-amber-400 text-base tracking-wider">XAU/USD</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              OANDA FEED
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20 font-mono hidden sm:inline-flex" title="1 Troy Ounce = 31.1035 gram">
              USD / Troy Ounce (oz t)
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

          {/* Timeframe selector */}
          <div className="flex items-center space-x-1 bg-slate-950/70 p-0.5 rounded-lg border border-slate-800">
            {['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'].map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                  selectedTimeframe === tf
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode & Strategy Target Selection */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => onStrategyChange('SCALPING')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                activeStrategy === 'SCALPING'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overlay: Scalp
            </button>
            <button
              onClick={() => onStrategyChange('INTRADAY')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                activeStrategy === 'INTRADAY'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overlay: Intraday
            </button>
          </div>

          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`p-1.5 rounded border transition-all ${
              showIndicators
                ? 'bg-slate-800 border-slate-700 text-amber-400'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle EMA 20 Indicator"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowPOIs(!showPOIs)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold transition-all ${
              showPOIs
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Tandai Session High-Low sebagai POI (ASH, ASL, LSH, LSL, PDH, PDL)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>POI Sesi</span>
          </button>

          <button
            onClick={() => setUseTradingView(!useTradingView)}
            className={`px-2.5 py-1 rounded border font-medium transition-all ${
              useTradingView
                ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {useTradingView ? 'Beralih ke Terminal Pro' : 'Buka TradingView'}
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex-1 min-h-[360px] bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden select-none">
        {useTradingView ? (
          <iframe
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_gold&symbol=OANDA%3AXAUUSD&interval=5&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FJakarta&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=id&utm_source=localhost"
            className="w-full h-full border-0"
            title="OANDA TradingView Gold Chart"
          />
        ) : (
          <div className="w-full h-full relative">
            {/* Hover details bar */}
            <div className="absolute top-2 left-4 z-10 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1 rounded-md border border-slate-800/80 backdrop-blur-sm">
              <span>
                LIVE: <strong className="text-amber-400">${currentPrice.toFixed(2)}</strong> <span className="text-[10px] text-slate-400">/ oz t</span>
              </span>
              <span className="text-[10px] text-amber-300/80 hidden md:inline">
                (~${(currentPrice / 31.1035).toFixed(2)}/g)
              </span>
              {hoveredCandle ? (
                <>
                  <span>
                    O: <span className="text-white">${hoveredCandle.open.toFixed(2)}</span>
                  </span>
                  <span>
                    H: <span className="text-emerald-400">${hoveredCandle.high.toFixed(2)}</span>
                  </span>
                  <span>
                    L: <span className="text-rose-400">${hoveredCandle.low.toFixed(2)}</span>
                  </span>
                  <span>
                    C: <span className="text-white">${hoveredCandle.close.toFixed(2)}</span>
                  </span>
                  <span>
                    Vol: <span className="text-slate-300">{hoveredCandle.volume}</span>
                  </span>
                  <span className="text-slate-500">({hoveredCandle.time})</span>
                </>
              ) : (
                <span className="text-slate-500">Arahkan kursor ke lilin untuk rincian OHLC</span>
              )}
            </div>

            {/* SVG Candlestick Engine */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full"
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredCandle(null)}
            >
              {/* Grid Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                const y = paddingTop + chartHeight * ratio;
                const priceAtY = maxPrice - ratio * priceRange;
                return (
                  <g key={ratio}>
                    <line
                      x1={0}
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={chartWidth + 6}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {priceAtY.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Volume Bars at bottom */}
              {candles.map((c, i) => {
                const x = i * candleWidth;
                const maxVol = Math.max(...candles.map((v) => v.volume), 500);
                const volHeight = (c.volume / maxVol) * 45;
                const isBull = c.close >= c.open;
                return (
                  <rect
                    key={`vol-${i}`}
                    x={x + 1}
                    y={svgHeight - paddingBottom - volHeight}
                    width={Math.max(candleWidth - 2, 1)}
                    height={volHeight}
                    fill={isBull ? '#10b981' : '#f43f5e'}
                    opacity={0.2}
                  />
                );
              })}

              {/* EMA 20 Line */}
              {showIndicators && emaPath && (
                <path
                  d={emaPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  opacity={0.8}
                />
              )}

              {/* Candlesticks */}
              {candles.map((c, i) => {
                const x = i * candleWidth;
                const candleMidX = x + candleWidth / 2;
                const isBull = c.close >= c.open;
                const openY = getY(c.open);
                const closeY = getY(c.close);
                const highY = getY(c.high);
                const lowY = getY(c.low);
                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);
                const color = isBull ? '#10b981' : '#f43f5e';

                return (
                  <g
                    key={`candle-${i}`}
                    className="cursor-crosshair group"
                    onMouseEnter={() => setHoveredCandle(c)}
                  >
                    {/* Wick */}
                    <line
                      x1={candleMidX}
                      y1={highY}
                      x2={candleMidX}
                      y2={lowY}
                      stroke={color}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={x + candleWidth * 0.15}
                      y={bodyTop}
                      width={Math.max(candleWidth * 0.7, 2)}
                      height={bodyHeight}
                      fill={color}
                      rx="1"
                    />
                  </g>
                );
              })}

              {/* SIGNAL OVERLAY LEVELS (Entry, SL, TP) */}
              {tp1Level && (
                <g>
                  <line
                    x1={0}
                    y1={getY(tp1Level)}
                    x2={chartWidth}
                    y2={getY(tp1Level)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={chartWidth + 4}
                    y={getY(tp1Level) - 9}
                    width={68}
                    height={18}
                    fill="#10b981"
                    rx="3"
                  />
                  <text
                    x={chartWidth + 8}
                    y={getY(tp1Level) + 3}
                    fill="#022c22"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    TP1 {tp1Level.toFixed(1)}
                  </text>
                </g>
              )}

              {tp2Level && (
                <g>
                  <line
                    x1={0}
                    y1={getY(tp2Level)}
                    x2={chartWidth}
                    y2={getY(tp2Level)}
                    stroke="#059669"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={chartWidth + 4}
                    y={getY(tp2Level) - 9}
                    width={68}
                    height={18}
                    fill="#059669"
                    rx="3"
                  />
                  <text
                    x={chartWidth + 8}
                    y={getY(tp2Level) + 3}
                    fill="#ecfdf5"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    TP2 {tp2Level.toFixed(1)}
                  </text>
                </g>
              )}

              {slLevel && (
                <g>
                  <line
                    x1={0}
                    y1={getY(slLevel)}
                    x2={chartWidth}
                    y2={getY(slLevel)}
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={chartWidth + 4}
                    y={getY(slLevel) - 9}
                    width={68}
                    height={18}
                    fill="#f43f5e"
                    rx="3"
                  />
                  <text
                    x={chartWidth + 8}
                    y={getY(slLevel) + 3}
                    fill="#fff"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    SL {slLevel.toFixed(1)}
                  </text>
                </g>
              )}

              {/* SESSION HIGH / LOW POINTS OF INTEREST (POI / LIQUIDITY) */}
              {showPOIs && sessionPOIs && (
                <g className="session-pois">
                  {/* ASIAN HIGH POI */}
                  {sessionPOIs.asianHigh && (
                    <g>
                      <line
                        x1={0}
                        y1={getY(sessionPOIs.asianHigh)}
                        x2={chartWidth}
                        y2={getY(sessionPOIs.asianHigh)}
                        stroke="#38bdf8"
                        strokeWidth="1.2"
                        strokeDasharray="4 3"
                        opacity="0.85"
                      />
                      <text
                        x={10}
                        y={getY(sessionPOIs.asianHigh) - 4}
                        fill="#38bdf8"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="monospace"
                        opacity="0.9"
                      >
                        [POI] ASIAN HIGH (ASH)
                      </text>
                      <rect
                        x={chartWidth + 3}
                        y={getY(sessionPOIs.asianHigh) - 8}
                        width={70}
                        height={16}
                        fill="#0284c7"
                        rx="3"
                      />
                      <text
                        x={chartWidth + 6}
                        y={getY(sessionPOIs.asianHigh) + 3}
                        fill="#f0f9ff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        ASH {sessionPOIs.asianHigh.toFixed(1)}
                      </text>
                    </g>
                  )}

                  {/* ASIAN LOW POI */}
                  {sessionPOIs.asianLow && (
                    <g>
                      <line
                        x1={0}
                        y1={getY(sessionPOIs.asianLow)}
                        x2={chartWidth}
                        y2={getY(sessionPOIs.asianLow)}
                        stroke="#38bdf8"
                        strokeWidth="1.2"
                        strokeDasharray="4 3"
                        opacity="0.85"
                      />
                      <text
                        x={10}
                        y={getY(sessionPOIs.asianLow) - 4}
                        fill="#38bdf8"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="monospace"
                        opacity="0.9"
                      >
                        [POI] ASIAN LOW (ASL)
                      </text>
                      <rect
                        x={chartWidth + 3}
                        y={getY(sessionPOIs.asianLow) - 8}
                        width={70}
                        height={16}
                        fill="#0284c7"
                        rx="3"
                      />
                      <text
                        x={chartWidth + 6}
                        y={getY(sessionPOIs.asianLow) + 3}
                        fill="#f0f9ff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        ASL {sessionPOIs.asianLow.toFixed(1)}
                      </text>
                    </g>
                  )}

                  {/* LONDON HIGH POI */}
                  {sessionPOIs.londonHigh && (
                    <g>
                      <line
                        x1={0}
                        y1={getY(sessionPOIs.londonHigh)}
                        x2={chartWidth}
                        y2={getY(sessionPOIs.londonHigh)}
                        stroke="#c084fc"
                        strokeWidth="1.2"
                        strokeDasharray="4 3"
                        opacity="0.85"
                      />
                      <text
                        x={10}
                        y={getY(sessionPOIs.londonHigh) - 4}
                        fill="#c084fc"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="monospace"
                        opacity="0.9"
                      >
                        [POI] LONDON HIGH (LSH)
                      </text>
                      <rect
                        x={chartWidth + 3}
                        y={getY(sessionPOIs.londonHigh) - 8}
                        width={70}
                        height={16}
                        fill="#9333ea"
                        rx="3"
                      />
                      <text
                        x={chartWidth + 6}
                        y={getY(sessionPOIs.londonHigh) + 3}
                        fill="#faf5ff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        LSH {sessionPOIs.londonHigh.toFixed(1)}
                      </text>
                    </g>
                  )}

                  {/* LONDON LOW POI */}
                  {sessionPOIs.londonLow && (
                    <g>
                      <line
                        x1={0}
                        y1={getY(sessionPOIs.londonLow)}
                        x2={chartWidth}
                        y2={getY(sessionPOIs.londonLow)}
                        stroke="#c084fc"
                        strokeWidth="1.2"
                        strokeDasharray="4 3"
                        opacity="0.85"
                      />
                      <text
                        x={10}
                        y={getY(sessionPOIs.londonLow) - 4}
                        fill="#c084fc"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="monospace"
                        opacity="0.9"
                      >
                        [POI] LONDON LOW (LSL)
                      </text>
                      <rect
                        x={chartWidth + 3}
                        y={getY(sessionPOIs.londonLow) - 8}
                        width={70}
                        height={16}
                        fill="#9333ea"
                        rx="3"
                      />
                      <text
                        x={chartWidth + 6}
                        y={getY(sessionPOIs.londonLow) + 3}
                        fill="#faf5ff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        LSL {sessionPOIs.londonLow.toFixed(1)}
                      </text>
                    </g>
                  )}

                  {/* PREVIOUS DAY HIGH POI */}
                  {sessionPOIs.previousDayHigh && (
                    <g>
                      <line
                        x1={0}
                        y1={getY(sessionPOIs.previousDayHigh)}
                        x2={chartWidth}
                        y2={getY(sessionPOIs.previousDayHigh)}
                        stroke="#fbbf24"
                        strokeWidth="1.2"
                        strokeDasharray="5 3"
                        opacity="0.8"
                      />
                      <text
                        x={chartWidth - 145}
                        y={getY(sessionPOIs.previousDayHigh) - 4}
                        fill="#fbbf24"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="monospace"
                        opacity="0.9"
                      >
                        PREV DAY HIGH (PDH)
                      </text>
                      <rect
                        x={chartWidth + 3}
                        y={getY(sessionPOIs.previousDayHigh) - 8}
                        width={70}
                        height={16}
                        fill="#d97706"
                        rx="3"
                      />
                      <text
                        x={chartWidth + 6}
                        y={getY(sessionPOIs.previousDayHigh) + 3}
                        fill="#fffbeb"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        PDH {sessionPOIs.previousDayHigh.toFixed(1)}
                      </text>
                    </g>
                  )}

                  {/* PREVIOUS DAY LOW POI */}
                  {sessionPOIs.previousDayLow && (
                    <g>
                      <line
                        x1={0}
                        y1={getY(sessionPOIs.previousDayLow)}
                        x2={chartWidth}
                        y2={getY(sessionPOIs.previousDayLow)}
                        stroke="#fb7185"
                        strokeWidth="1.2"
                        strokeDasharray="5 3"
                        opacity="0.8"
                      />
                      <text
                        x={chartWidth - 145}
                        y={getY(sessionPOIs.previousDayLow) - 4}
                        fill="#fb7185"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="monospace"
                        opacity="0.9"
                      >
                        PREV DAY LOW (PDL)
                      </text>
                      <rect
                        x={chartWidth + 3}
                        y={getY(sessionPOIs.previousDayLow) - 8}
                        width={70}
                        height={16}
                        fill="#e11d48"
                        rx="3"
                      />
                      <text
                        x={chartWidth + 6}
                        y={getY(sessionPOIs.previousDayLow) + 3}
                        fill="#fff1f2"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        PDL {sessionPOIs.previousDayLow.toFixed(1)}
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* CURRENT LIVE PRICE LINE */}
              {currentPrice && (
                <g>
                  <line
                    x1={0}
                    y1={getY(currentPrice)}
                    x2={chartWidth}
                    y2={getY(currentPrice)}
                    stroke="#eab308"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={chartWidth - 5}
                    cy={getY(currentPrice)}
                    r="4"
                    fill="#eab308"
                    className="animate-ping"
                    opacity="0.8"
                  />
                  <rect
                    x={chartWidth + 4}
                    y={getY(currentPrice) - 10}
                    width={68}
                    height={20}
                    fill="#eab308"
                    rx="3"
                  />
                  <text
                    x={chartWidth + 8}
                    y={getY(currentPrice) + 4}
                    fill="#451a03"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {currentPrice.toFixed(2)}
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Chart Footer Indicator Legend */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Bull
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Bear
          </span>
          {showIndicators && (
            <span className="flex items-center gap-1.5 text-sky-400 font-mono">
              <span className="w-3 h-0.5 bg-sky-400 inline-block"></span> EMA 20
            </span>
          )}
          {showPOIs && (
            <>
              <span className="flex items-center gap-1 text-sky-400 font-mono">
                <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span> ASH/ASL (Asia POI)
              </span>
              <span className="flex items-center gap-1 text-purple-400 font-mono">
                <span className="w-2.5 h-0.5 bg-purple-400 inline-block"></span> LSH/LSL (London POI)
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-mono hidden md:flex">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span> PDH/PDL (Day POI)
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span className="hidden sm:inline">Broker: <strong className="text-emerald-400">OANDA (XAU/USD)</strong></span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span>Target Mode: <strong className="text-amber-400">{activeStrategy}</strong></span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Spread: <strong className="text-emerald-400">0.15 - 0.22 pips</strong></span>
        </div>
      </div>
    </div>
  );
};
