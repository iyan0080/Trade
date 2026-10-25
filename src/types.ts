export type TradeAction = 'BUY' | 'SELL' | 'WAIT';

export interface TradeSignal {
  action: TradeAction;
  confidence: number;
  timeframe: string;
  entryZone: string;
  entryPrice?: number;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2: string;
  takeProfit3: string;
  riskReward: string;
  duration: string;
  trigger: string;
  tip: string;
}

export interface NewsItem {
  id?: string;
  title: string;
  source: string;
  timestamp: string;
  impact: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactScore: number;
  summary: string;
  relevance?: string;
}

export interface MarketSentiment {
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number;
  summary: string;
}

export interface SessionPOIs {
  asianHigh: number;
  asianLow: number;
  londonHigh: number;
  londonLow: number;
  previousDayHigh: number;
  previousDayLow: number;
  currentSession: string;
}

export interface PriceData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  high24h: number;
  low24h: number;
  open24h: number;
  change: number;
  changePercent: number;
  dxy: number;
  us10y: number;
  activeSession: string;
  marketStatus: string;
  broker?: string;
  brokerAccount?: string;
  unit?: string; // e.g. 'USD / Troy Ounce (oz t)'
  unitShort?: string; // '$/oz t'
  pricePerGramUSD?: number; // USD per gram conversion
  gramsPerTroyOunce?: number; // 31.1035
  sessionPOIs?: SessionPOIs;
  lastUpdated: string;
  candles: Candle[];
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceAlert {
  id: string;
  label: string;
  targetPrice: number;
  type: 'ENTRY' | 'SL' | 'TP' | 'CUSTOM';
  triggered: boolean;
  strategy?: 'SCALPING' | 'INTRADAY';
  condition: 'CROSS_ABOVE' | 'CROSS_BELOW' | 'PROXIMITY';
  createdAt: string;
}

export type SplitLayout = 'split-dual' | 'split-vertical' | 'quad-grid' | 'focus-chart' | 'focus-signals';
