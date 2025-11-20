import React from 'react';
import { Bell, Download } from 'lucide-react';
import { ExchangeHistoryItem } from '../types';

interface ThresholdSettingsProps {
  threshold: number;
  setThreshold: (val: number) => void;
  history: ExchangeHistoryItem[];
  onExport: () => void;
}

const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({ threshold, setThreshold, history, onExport }) => {
  return (
    <div className="glass-morphism rounded-3xl p-5 mb-6 bg-white/60 dark:bg-gray-900/50 border border-white/40 dark:border-white/10 shadow-sm">
      <div className="flex justify-between items-start mb-5">
         <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl">
            <Bell className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Rate Alerts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Notification trigger</p>
            </div>
         </div>
         <button 
            onClick={onExport}
            disabled={history.length === 0}
            className="p-2.5 text-slate-400 hover:text-ios-blue hover:bg-blue-500/10 rounded-xl transition-colors disabled:opacity-30"
            title="Export CSV"
         >
            <Download className="w-5 h-5" />
         </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-1">
          <div className="relative flex-1 group">
            <input 
              type="number" 
              step="0.0001"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full pl-5 pr-12 py-4 bg-white/50 dark:bg-black/20 rounded-2xl text-slate-900 dark:text-white font-bold text-lg border border-transparent focus:border-ios-blue/30 focus:bg-white/70 dark:focus:bg-black/40 transition-all outline-none shadow-inner"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 pointer-events-none">MYR</span>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             {[3.18, 3.20, 3.25, 3.30].map((val) => (
                 <button 
                   key={val}
                   onClick={() => setThreshold(val)}
                   className={`px-4 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                       threshold === val 
                       ? 'bg-ios-blue text-white shadow-lg shadow-blue-500/30' 
                       : 'bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 border border-white/20 dark:border-white/5'
                   }`}
                 >
                   {val.toFixed(2)}
                 </button>
             ))}
        </div>
      </div>
    </div>
  );
};

export default ThresholdSettings;