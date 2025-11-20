import React, { useState, useRef } from 'react';
import { RefreshCw, TrendingUp, ExternalLink, Share2, ChevronDown, ChevronUp, BarChart2, Edit3 } from 'lucide-react';
import { RateData, AppStatus } from '../types';

interface RateCardProps {
  data: RateData | null;
  status: AppStatus;
  threshold: number;
  onRefresh: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
  onManualInput?: (rate: number) => void;
}

const RateCard: React.FC<RateCardProps> = ({ 
  data, 
  status, 
  threshold, 
  onRefresh, 
  showDetails, 
  onToggleDetails,
  onManualInput 
}) => {
  const isLoading = status === AppStatus.LOADING;
  const isAboveThreshold = data && data.rate >= threshold;

  // Manual Input State
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShare = async () => {
    if (data && navigator.share) {
      try {
        await navigator.share({
          title: 'Current CIMB SGD-MYR Rate',
          text: `The current SGD to MYR rate is ${data.rate} (Business).`,
          url: 'https://www.cimbclicks.com.sg/sgd-to-myr-business',
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  // Long Press Logic
  const handlePressStart = () => {
    if (!onManualInput) return;
    pressTimer.current = setTimeout(() => {
      setIsEditing(true);
      setInputValue(data?.rate.toString() || '');
      if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
    }, 800); // 800ms trigger
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = parseFloat(inputValue);
    if (!isNaN(newRate) && onManualInput) {
      onManualInput(newRate);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-ios-darkCard rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mb-6 relative overflow-hidden transition-all duration-300 border border-transparent dark:border-white/10">
      
      {/* Background Decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none transition-colors"></div>
      
      <div className="relative z-10 p-6 pb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">SGD to MYR</span>
            {isEditing && <span className="px-1.5 py-0.5 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold uppercase">Test Mode</span>}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 transition-colors text-slate-500 dark:text-slate-400"
              title="Share Rate"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                  setIsEditing(false); // Exit edit mode on refresh
                  onRefresh();
              }}
              disabled={isLoading}
              className={`p-2 rounded-full bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 transition-colors ${isLoading ? 'animate-spin' : ''}`}
              title="Refresh Rate"
            >
              <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex items-baseline gap-2 my-6">
          {isEditing ? (
             <form onSubmit={handleManualSubmit} className="flex items-baseline">
                <input
                  type="number"
                  step="0.0001"
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  className="text-6xl font-bold text-ios-blue bg-transparent border-b-2 border-ios-blue outline-none w-[5ch] p-0 leading-none tracking-tight"
                />
             </form>
          ) : (
            <span 
              className="text-6xl font-bold text-slate-900 dark:text-white tracking-tight cursor-pointer select-none active:opacity-70 transition-opacity"
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              title="Long press to edit (Debug)"
            >
              {data ? data.rate.toFixed(4) : '---'}
            </span>
          )}
          <span className="text-2xl font-medium text-slate-400 dark:text-slate-500">MYR</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Last updated</span>
            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {data?.lastUpdated || 'Waiting for update...'}
            </span>
          </div>

          {isAboveThreshold && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full border border-green-100 dark:border-green-800 animate-pulse">
               <TrendingUp className="w-4 h-4" />
               <span className="text-xs font-bold">Great Rate!</span>
            </div>
          )}
           
          {!isAboveThreshold && data && (
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-full border border-slate-100 dark:border-white/10">
               <span className="text-xs font-medium">Target: {threshold.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        {data?.sourceUrl && (
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between items-center">
                 <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-ios-blue hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Source: {data.sourceUrl === 'Simulation' ? 'User Simulation' : 'CIMB Official Site'}
                 </a>
                 <span className="text-[10px] text-slate-400 dark:text-slate-600">
                    {isEditing ? 'Editing...' : 'Refreshes every 10m'}
                 </span>
            </div>
        )}
      </div>

      {/* Interactive Toggle Button */}
      <button 
        onClick={onToggleDetails}
        className="w-full py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200 dark:active:bg-white/20 transition-colors border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 group"
      >
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
          {showDetails ? 'Hide Analysis' : 'View Trend & Tools'}
        </span>
        {showDetails ? (
           <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
        ) : (
           <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
        )}
      </button>
    </div>
  );
};

export default RateCard;