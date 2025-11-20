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
    <div className="bg-white dark:bg-ios-darkCard rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 p-5 mb-6 transition-colors">
      <div className="flex justify-between items-start mb-4">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Bell className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </div>
            <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-white">Alerts & Tools</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage notifications</p>
            </div>
         </div>
         <button 
            onClick={onExport}
            disabled={history.length === 0}
            className="p-2 text-slate-400 hover:text-ios-blue hover:bg-blue-50 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            title="Export CSV"
         >
            <Download className="w-5 h-5" />
         </button>
      </div>
      
      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Notify if rate exceeds</label>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <input 
              type="number" 
              step="0.0001"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-900 dark:text-white font-semibold border-none focus:ring-2 focus:ring-ios-blue/50 transition-all outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">MYR</span>
          </div>
          <div className="flex gap-2">
             <button 
               onClick={() => setThreshold(3.20)}
               className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
             >
               3.20
             </button>
             <button 
               onClick={() => setThreshold(3.45)}
               className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
             >
               3.45
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThresholdSettings;