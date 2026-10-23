import React, { useState } from 'react';
import { X, Calculator, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { soundManager } from '../services/soundService';

interface LotCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSlPips?: number;
}

export const LotCalculatorModal: React.FC<LotCalculatorModalProps> = ({
  isOpen,
  onClose,
  defaultSlPips = 35,
}) => {
  const [balance, setBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [slPips, setSlPips] = useState<number>(defaultSlPips);
  const [leverage, setLeverage] = useState<number>(100);

  if (!isOpen) return null;

  // Calculation for XAU/USD (Gold)
  // 1 standard lot = 100 oz. 1 pip (0.10) = $10.00. 1 point (0.01) = $1.00.
  // Risk Amount ($) = Balance * (RiskPercent / 100)
  // Sl Distance in USD per oz = slPips / 10
  // Lot Size = Risk Amount / (slPips * 10) OR Risk Amount / (Sl Distance * 100)
  const riskAmountUSD = (balance * (riskPercent / 100));
  const pipValuePerLot = 10; // For XAUUSD standard lot, 1 pip ($0.10) is $10 USD
  const calculatedLot = slPips > 0 ? riskAmountUSD / (slPips * pipValuePerLot) : 0.01;
  const safeLot = Math.max(0.01, Number(calculatedLot.toFixed(2)));

  // Estimated profit at standard R:R
  const profitTP1 = riskAmountUSD * 1.5;
  const profitTP2 = riskAmountUSD * 2.5;

  const isHighRisk = riskPercent > 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">
                Kalkulator Lot & Resiko XAU/USD
              </h3>
              <p className="text-[11px] text-slate-400">
                Hitung lot size ideal agar modal aman & terkontrol
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playBlip();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-4 space-y-4 text-xs">
          {/* Balance Input */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Modal / Saldo Akun (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
              <input
                type="number"
                min="10"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Risk Percentage */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-medium">Batas Resiko Per Trade (%)</label>
              <span className="font-mono text-amber-400 font-bold">{riskPercent}% (${riskAmountUSD.toFixed(2)})</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setRiskPercent(pct)}
                  className={`py-1.5 rounded-lg font-mono font-bold transition-all ${
                    riskPercent === pct
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Stop Loss Distance */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-medium">
                Jarak Stop Loss (Pips)
              </label>
              <span className="text-slate-500 text-[11px] font-mono">
                ${(slPips / 10).toFixed(2)} USD per troy oz
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="5"
                value={slPips}
                onChange={(e) => setSlPips(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setSlPips(30)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-mono"
              >
                M5 (30p)
              </button>
              <button
                type="button"
                onClick={() => setSlPips(70)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-mono"
              >
                H1 (70p)
              </button>
            </div>
          </div>

          {/* Result Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
            <div className="text-slate-400 text-[11px] mb-1">REKOMENDASI LOT SIZE:</div>
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-3xl font-black text-amber-400 tracking-tight">
                {safeLot} <span className="text-sm font-normal text-slate-400">LOT</span>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-400">
                Max Loss: <strong className="text-rose-400">-${riskAmountUSD.toFixed(2)}</strong>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-950/60 p-2 rounded">
                <span className="text-slate-500 block">Est. Profit TP1 (1:1.5)</span>
                <strong className="text-emerald-400">+${profitTP1.toFixed(2)}</strong>
              </div>
              <div className="bg-slate-950/60 p-2 rounded">
                <span className="text-slate-500 block">Est. Profit TP2 (1:2.5)</span>
                <strong className="text-emerald-400">+${profitTP2.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {isHighRisk && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Peringatan: Resiko di atas 3% per posisi berpotensi memicu drawdown cepat saat pasar emas sedang volatile tinggi. Disarankan menggunakan 1-2%.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playBlip();
              onClose();
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
          >
            Terapkan ke Trading Plan
          </button>
        </div>
      </div>
    </div>
  );
};
