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

  // State: UI
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [showHelp, setShowHelp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Hooks
  const { data, status, error, refetch, setRate } = useExchangeRate(10 * 60 * 1000); // Poll every 10 mins

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

  // Effect: Data Processing (History & Alerts)
  useEffect(() => {
    if (status === 'SUCCESS' && data) {
      
      // 1. Update History if it's a new timestamp or empty
      setHistory(prev => {
        const lastItem = prev[prev.length - 1];
        // Simple check to avoid dupes in quick succession (same minute)
        // If source is Simulation, we always allow it for testing graph updates
        if (data.sourceUrl !== 'Simulation' && lastItem && lastItem.time === data.lastUpdated && lastItem.rate === data.rate) {
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

      // 2. Check Alerts
      if (data.rate >= threshold) {
        setAlerts(prev => {
           // Prevent spamming alert for the same breach session (within 30 mins)
           const lastAlert = prev[0];
           const now = Date.now();
           const cooldown = 30 * 60 * 1000; 
           
           // If we have a recent alert (less than 30m ago) about crossing threshold, skip
           // Unless it is a simulation (to allow testing alerts easily)
           if (data.sourceUrl !== 'Simulation' && lastAlert && (now - new Date(lastAlert.timestamp).getTime() < cooldown) && lastAlert.type === 'success') {
             return prev;
           }

           const newAlert: AlertLogItem = {
             id: crypto.randomUUID(),
             timestamp: new Date().toLocaleTimeString(),
             message: `Rate reached target: ${data.rate.toFixed(4)} MYR`,
             type: 'success'
           };
           const newAlerts = [newAlert, ...prev].slice(0, 20);
           localStorage.setItem('fx_alerts', JSON.stringify(newAlerts));
           return newAlerts;
        });
      }
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
    <div className="min-h-screen pb-10 transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} onOpenHelp={() => setShowHelp(true)} />
      
      <main className="max-w-md mx-auto px-4 py-6 transition-all duration-500">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Connection Issue</h4>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
              <button 
                onClick={refetch}
                className="mt-2 text-xs font-medium text-red-700 dark:text-red-300 hover:underline"
              >
                Retry Now
              </button>
            </div>
          </div>
        )}

        <RateCard 
          data={data}
          status={status}
          threshold={threshold}
          onRefresh={refetch}
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails(!showDetails)}
          onManualInput={handleManualRate}
        />

        <div className={`transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${showDetails ? 'max-h-[2000px] opacity-100 translate-y-0 scale-100' : 'max-h-0 opacity-0 -translate-y-4 scale-95 origin-top'}`}>
          <div className="pt-2 pb-24 space-y-6">
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
        
      </main>
      
      {/* Sticky Bottom Status for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-ios-darkCard/90 backdrop-blur-lg border-t border-slate-200/50 dark:border-white/10 md:hidden z-40 transition-colors">
         <div className="flex justify-between items-center max-w-md mx-auto">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {status === 'LOADING' ? 'Syncing...' : status === 'SUCCESS' ? 'Live Data' : 'Offline'}
            </span>
            <div className={`flex items-center gap-2`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {status === 'LOADING' ? 'Updating' : 'Active'}
                </span>
                <div className={`w-2 h-2 rounded-full ${status === 'SUCCESS' ? 'bg-green-500' : status === 'ERROR' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></div>
            </div>
         </div>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default App;