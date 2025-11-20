import React from 'react';
import { AlertLogItem } from '../types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface AlertLogsProps {
  alerts: AlertLogItem[];
}

const AlertLogs: React.FC<AlertLogsProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="glass-morphism rounded-3xl p-5 mb-24 bg-white/60 dark:bg-gray-900/50 border border-white/40 dark:border-white/10 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
         <h3 className="text-sm font-bold text-slate-800 dark:text-white">Activity Log</h3>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 backdrop-blur-sm transition-all hover:bg-white/60 dark:hover:bg-white/10">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            ) : alert.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{alert.message}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{alert.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default AlertLogs;