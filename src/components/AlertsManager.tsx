import React, { useState, useEffect } from 'react';
import { PriceAlert, TradeSignal } from '../types';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  ShieldAlert,
} from 'lucide-react';
import { soundManager } from '../services/soundService';

interface AlertsManagerProps {
  alerts: PriceAlert[];
  currentPrice: number;
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  onRemoveAlert: (id: string) => void;
  onClearAll: () => void;
  proximityThreshold: number;
  onChangeProximityThreshold: (val: number) => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts,
  currentPrice,
  onAddAlert,
  onRemoveAlert,
  onClearAll,
  proximityThreshold,
  onChangeProximityThreshold,
}) => {
  const [customPrice, setCustomPrice] = useState<string>('');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [customType, setCustomType] = useState<PriceAlert['type']>('CUSTOM');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [permissionState, setPermissionState] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setSoundEnabled(next);
    if (next) soundManager.playBlip();
  };

  const requestBrowserPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const res = await Notification.requestPermission();
      setPermissionState(res);
      if (res === 'granted') {
        new Notification('AuraGold XAU/USD Terminal', {
          body: 'Notifikasi browser untuk Entry, SL, dan TP berhasil diaktifkan!',
        });
      }
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(customPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    soundManager.playBlip();
    onAddAlert({
      label: customLabel || `Alert Harga $${priceNum.toFixed(2)}`,
      targetPrice: priceNum,
      type: customType,
      condition: priceNum > currentPrice ? 'CROSS_ABOVE' : 'CROSS_BELOW',
    });

    setCustomPrice('');
    setCustomLabel('');
  };

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">
              Sistem Alert & Notifikasi Harga
            </h3>
            <p className="text-[11px] text-slate-400">
              Audio Chime & Notifikasi saat mendekati Entry, SL, atau TP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {permissionState !== 'granted' && typeof Notification !== 'undefined' && (
            <button
              onClick={requestBrowserPermission}
              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-medium"
            >
              Aktifkan Izin Browser
            </button>
          )}

          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-amber-400'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute Suara Alert' : 'Bunyikan Suara Alert'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Proximity Sensitivity Controls */}
      <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">
          Jarak Toleransi Notifikasi (Proximity):
        </span>
        <div className="flex items-center gap-1 font-mono">
          {[0.3, 0.5, 1.0, 2.0].map((val) => (
            <button
              key={val}
              onClick={() => {
                soundManager.playBlip();
                onChangeProximityThreshold(val);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                proximityThreshold === val
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ±${val.toFixed(1)} ({(val * 10).toFixed(0)} pips)
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Alert Form */}
      <form onSubmit={handleCreateCustom} className="p-3 bg-slate-950/40 border-b border-slate-800 grid grid-cols-12 gap-2">
        <div className="col-span-5 sm:col-span-4">
          <input
            type="number"
            step="0.1"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder={`Harga (cth: ${(currentPrice + 2).toFixed(1)})`}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            required
          />
        </div>

        <div className="col-span-4 sm:col-span-5">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Label (cth: Breakout Resistance)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="col-span-3 sm:col-span-3">
          <button
            type="submit"
            className="w-full h-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>
      </form>

      {/* Alerts Active List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[380px] custom-scrollbar">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
          <span>Alert Aktif ({activeAlerts.length})</span>
          {alerts.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-slate-500 hover:text-rose-400 transition-colors"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {activeAlerts.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            Belum ada alert aktif. Klik tombol <strong className="text-amber-400">"Pasang Alert Otomatis"</strong> pada kartu sinyal Scalping/Intraday di atas.
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const distance = Math.abs(currentPrice - alert.targetPrice);
            const isNear = distance <= proximityThreshold;

            return (
              <div
                key={alert.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                  isNear
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10 animate-pulse'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                      alert.type === 'ENTRY'
                        ? 'bg-amber-500/20 text-amber-400'
                        : alert.type === 'TP'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : alert.type === 'SL'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {alert.type === 'ENTRY' && <Target className="w-4 h-4" />}
                    {alert.type === 'TP' && <CheckCircle className="w-4 h-4" />}
                    {alert.type === 'SL' && <ShieldAlert className="w-4 h-4" />}
                    {alert.type === 'CUSTOM' && <Bell className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">
                        ${alert.targetPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {alert.type}
                      </span>
                      {isNear && (
                        <span className="text-[10px] bg-amber-500 text-slate-950 px-1 rounded font-bold">
                          DEKAT!
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {alert.label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono text-[11px]">
                    <div className={isNear ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {(distance * 10).toFixed(0)} pips
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {distance.toFixed(2)}$
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveAlert(alert.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Hapus Alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Triggered Alerts History */}
        {triggeredAlerts.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500 font-semibold mb-2 block">
              Riwayat Alert Terpicu ({triggeredAlerts.length})
            </span>
            <div className="space-y-1.5 opacity-70">
              {triggeredAlerts.slice(-4).map((alert) => (
                <div
                  key={alert.id}
                  className="p-2 rounded bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs text-slate-400"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>{alert.label} (${alert.targetPrice.toFixed(2)})</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">TERPICU</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
