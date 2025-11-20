import React from 'react';
import { AlertLogItem } from '../types';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AlertLogsProps {
  alerts: AlertLogItem[];
}

const AlertLogs: React.FC<AlertLogsProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-ios-darkCard rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 p-5 mb-0 transition-colors">
      <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Recent Activity</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            ) : alert.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{alert.message}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{alert.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertLogs;