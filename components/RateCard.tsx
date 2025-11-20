import React, { useState, useRef } from 'react';
import { RefreshCw, TrendingUp, ExternalLink, Share2, ChevronDown, ChevronUp, Activity, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { RateData, AppStatus } from '../types';

interface RateCardProps {
  data: RateData | null;
  status: AppStatus;
  threshold: number;
  previousRate: number | null;
  onRefresh: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
  onManualInput?: (rate: number) => void;
}

const RateCard: React.FC<RateCardProps> = ({ 
  data, 
  status, 
  threshold, 
  previousRate,
  onRefresh, 
  showDetails, 
  onToggleDetails,
  onManualInput 
}) => {
  const isLoading = status === AppStatus.LOADING;
  const isAboveThreshold = data && data.rate >= threshold;

  // Calculate Difference
  const rateDiff = (data && previousRate) ? data.rate - previousRate : 0;
  const hasChange = Math.abs(rateDiff) > 0.0001;
  const isPositiveChange = rateDiff > 0;

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
      if (navigator.vibrate) navigator.vibrate(50);
    }, 800);
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
    <div 
      className={`
        relative overflow-hidden rounded-[32px] transition-all duration-500 z-20
        backdrop-blur-2xl
        bg-white/70 dark:bg-gray-900/60
        border border-white/40 dark:border-white/10
        shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
        hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.15)] dark:hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5)]
        hover:scale-[1.01]
        group
      `}
    >
      {/* Internal Reflective Gradient Sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
      
      {/* Top Actions */}
      <div className="relative z-10 p-7 pb-2">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">Exchange Rate</span>
                {isEditing && <span className="px-1.5 py-0.5 rounded-md bg-yellow-300/50 text-yellow-900 text-[10px] font-bold backdrop-blur-sm">EDIT</span>}
             </div>
             <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">SGD → MYR</span>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-all shadow-sm backdrop-blur-md active:scale-95"
              title="Share Rate"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                  setIsEditing(false); 
                  onRefresh();
              }}
              disabled={isLoading}
              className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-all shadow-sm backdrop-blur-md active:scale-95 ${isLoading ? 'animate-spin' : ''}`}
              title="Refresh Rate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Rate Display */}
        <div className="flex flex-col items-center py-6 relative">
           {/* Subtle Glow behind numbers */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${isAboveThreshold ? 'bg-green-400' : 'bg-blue-400'}`}></div>

           <div className="relative z-10 text-center">
              {isEditing ? (
                <form onSubmit={handleManualSubmit}>
                    <input
                    type="number"
                    step="0.0001"
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 outline-none text-center w-[5ch] p-0 leading-none bg-transparent"
                    />
                </form>
              ) : (
                <h2 
                className="text-[4.5rem] leading-none font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 cursor-pointer select-none drop-shadow-sm"
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                >
                {data ? data.rate.toFixed(4) : '---'}
                </h2>
              )}
              <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400">1 SGD equals</p>
                  
                  {/* Comparison Indicator */}
                  {hasChange && (
                      <div className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${isPositiveChange ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {isPositiveChange ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{Math.abs(rateDiff).toFixed(4)}</span>
                      </div>
                  )}
              </div>
              
              {/* Previous Rate Text if Changed */}
              {hasChange && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Was {previousRate?.toFixed(4)}
                  </p>
              )}
           </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center justify-between mt-2 mb-4">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/5 backdrop-blur-md">
                <Activity className={`w-3 h-3 ${isLoading ? 'text-blue-400 animate-spin' : 'text-slate-400'}`} />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                   {isLoading ? 'Updating...' : `Updated ${data?.lastUpdated || '--:--'}`}
                </span>
             </div>

            {isAboveThreshold ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/20 dark:bg-green-500/20 border border-green-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(74,222,128,0.2)] animate-pulse-slow">
                    <TrendingUp className="w-3 h-3 text-green-700 dark:text-green-400" />
                    <span className="text-xs font-bold text-green-800 dark:text-green-300">Target Hit</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/30 dark:bg-white/5 border border-white/10 backdrop-blur-md">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Target: {threshold.toFixed(2)}</span>
                </div>
            )}
        </div>

        {/* Source Link */}
        <div className="flex justify-center pb-4">
            <a 
                href={data?.sourceUrl || "https://www.cimbclicks.com.sg/sgd-to-myr-business"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-white/5 transition-colors group"
            >
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Source:</span>
                <span className="text-[10px] text-ios-blue font-medium group-hover:underline underline-offset-2">
                    {data?.sourceUrl === 'Simulation' ? 'Simulation Mode' : 'CIMB Clicks'}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-ios-blue transition-colors" />
            </a>
        </div>
      </div>

      {/* Toggle Button Area */}
      <button 
        onClick={onToggleDetails}
        className="w-full py-4 bg-white/40 dark:bg-black/20 backdrop-blur-md border-t border-white/30 dark:border-white/5 flex items-center justify-center gap-2 group hover:bg-white/50 dark:hover:bg-black/30 transition-colors"
      >
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">
            {showDetails ? 'Close Tools' : 'Tools & History'}
        </span>
        <div className="bg-white/50 dark:bg-white/10 p-1 rounded-full transition-transform duration-300 group-hover:scale-110">
            {showDetails ? (
            <ChevronUp className="w-3 h-3 text-slate-600 dark:text-slate-300" />
            ) : (
            <ChevronDown className="w-3 h-3 text-slate-600 dark:text-slate-300" />
            )}
        </div>
      </button>
    </div>
  );
};

export default RateCard;