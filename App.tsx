import React, { useState, useEffect, useCallback } from 'react';
import { useExchangeRate } from './hooks/useExchangeRate';
import Header from './components/Header';
import RateCard from './components/RateCard';
import ThresholdSettings from './components/ThresholdSettings';
import TrendChart from './components/TrendChart';
import AlertLogs from './components/AlertLogs';
import HelpModal from './components/HelpModal';
import { AlertTriangle } from 'lucide-react';
import { ExchangeHistoryItem, AlertLogItem, Theme } from './types';

const App: React.FC = () => {
  // State: Settings
  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('fx_threshold');
    return saved ? parseFloat(saved) : 3.20;
  });

  // State: Data persistence
  const [history, setHistory] = useState<ExchangeHistoryItem[]>(() => {
    const saved = localStorage.getItem('fx_history');
    return saved ? JSON.parse(saved) : [];
  });

  // State: Logs
  const [alerts, setAlerts] = useState<AlertLogItem[]>(() => {
    const saved = localStorage.getItem('fx_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // State: Comparison
  const [previousRate, setPreviousRate] = useState<number | null>(null);

  // State: UI
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [showHelp, setShowHelp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Hooks - Poll every 1 minute (60000ms)
  const { data, status, error, refetch, setRate } = useExchangeRate(60000);

  // Effect: Theme Handling
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Effect: Data Processing (History, Alerts, Audits)
  useEffect(() => {
    if (status === 'SUCCESS' && data) {
      
      // Update Comparison State (Get last rate before this update if exists)
      setHistory(prev => {
        const lastItem = prev[prev.length - 1];
        
        // Update previous rate state for comparison UI
        if (lastItem) {
            setPreviousRate(lastItem.rate);
        }

        // Avoid duplicate history entries if values match exactly within same timeframe
        if (data.sourceUrl !== 'Simulation' && lastItem && lastItem.rate === data.rate && lastItem.time === data.lastUpdated) {
          return prev;
        }
        
        const newItem: ExchangeHistoryItem = {
          time: data.lastUpdated,
          fullTimestamp: Date.now(),
          rate: data.rate
        };
        
        const newHistory = [...prev, newItem].slice(-50); // Keep last 50 points
        localStorage.setItem('fx_history', JSON.stringify(newHistory));
        return newHistory;
      });

      // Add Audit Log for every fetch
      setAlerts(prev => {
        // Audit Log Entry
        const auditLog: AlertLogItem = {
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString(),
            message: `Sync: ${data.rate.toFixed(4)} MYR`,
            type: 'info'
        };

        // Threshold Alert
        let newItems = [auditLog];
        
        if (data.rate >= threshold) {
           // Cooldown check for Threshold alerts
           const lastAlert = prev.find(p => p.type === 'success'); // Find last success/threshold alert
           const now = Date.now();
           const cooldown = 30 * 60 * 1000; 
           
           const shouldAlert = !lastAlert || (now - new Date(lastAlert.timestamp).getTime() > cooldown) || data.sourceUrl === 'Simulation';

           if (shouldAlert) {
               newItems.push({
                 id: crypto.randomUUID(),
                 timestamp: new Date().toLocaleTimeString(),
                 message: `Target Hit: ${data.rate.toFixed(4)} MYR`,
                 type: 'success'
               });
           }
        }

        const updatedAlerts = [...newItems, ...prev].slice(0, 50); // Increased log size
        localStorage.setItem('fx_alerts', JSON.stringify(updatedAlerts));
        return updatedAlerts;
      });
    }
  }, [data, status, threshold]);

  // Persist Threshold
  useEffect(() => {
    localStorage.setItem('fx_threshold', threshold.toString());
  }, [threshold]);

  // Handle Manual Rate Input (Simulation)
  const handleManualRate = (rate: number) => {
    setRate({
      rate,
      lastUpdated: new Date().toLocaleTimeString(),
      sourceUrl: 'Simulation'
    });
  };

  // Export to CSV
  const exportCSV = () => {
    if (history.length === 0) return;
    
    const headers = "Date,Time,Rate (SGD to MYR)\n";
    const rows = history.map(h => {
      const date = new Date(h.fullTimestamp).toLocaleDateString();
      return `${date},${h.time},${h.rate}`;
    }).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cimb_fx_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden pb-10 transition-colors duration-500">
      
      {/* Ambient Animated Background for Liquid Effect */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
         <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-400/20 dark:bg-pink-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header theme={theme} toggleTheme={toggleTheme} onOpenHelp={() => setShowHelp(true)} />
        
        <main className="flex-grow max-w-md mx-auto w-full px-4 py-8 transition-all duration-500 flex flex-col justify-start md:justify-center min-h-[80vh]">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-md border border-red-100 dark:border-red-800/50 rounded-2xl flex items-start gap-3 animate-fade-in shadow-lg z-20">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Connection Issue</h4>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
                <p className="text-[10px] text-red-500/80 mt-1">Displaying last known data.</p>
                <button 
                  onClick={refetch}
                  className="mt-2 text-xs font-medium text-red-700 dark:text-red-300 hover:underline"
                >
                  Retry Now
                </button>
              </div>
            </div>
          )}

          <div className="relative">
            <RateCard 
              data={data}
              status={status}
              threshold={threshold}
              previousRate={previousRate}
              onRefresh={refetch}
              showDetails={showDetails}
              onToggleDetails={() => setShowDetails(!showDetails)}
              onManualInput={handleManualRate}
            />

            {/* Contextual Bubble Panel - Floating Bottom Sheet effect */}
            <div className={`transform transition-all duration-700 cubic-bezier(0.32, 0.72, 0, 1) origin-top ${showDetails ? 'opacity-100 translate-y-4 scale-100' : 'opacity-0 -translate-y-12 scale-90 pointer-events-none absolute inset-x-0 top-full'}`}>
              <div className="space-y-4">
                <TrendChart history={history} />

                <ThresholdSettings 
                  threshold={threshold} 
                  setThreshold={setThreshold}
                  history={history}
                  onExport={exportCSV}
                />

                <AlertLogs alerts={alerts} />
              </div>
            </div>
          </div>
          
        </main>
        
        {/* Sticky Bottom Status for Mobile (Glass) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg md:hidden z-40 transition-all duration-300 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${status === 'SUCCESS' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : status === 'ERROR' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {status === 'LOADING' ? 'Syncing CIMB...' : status === 'SUCCESS' ? 'Live' : 'Offline'}
              </span>
        </div>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default App;