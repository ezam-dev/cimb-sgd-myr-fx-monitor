import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExchangeHistoryItem } from '../types';

interface TrendChartProps {
  history: ExchangeHistoryItem[];
}

const TrendChart: React.FC<TrendChartProps> = ({ history }) => {
  const displayData = history.length > 0 ? history : [{ time: 'No Data', rate: 0 }];
  const minRate = history.length ? Math.min(...history.map(h => h.rate)) : 3.0;
  const maxRate = history.length ? Math.max(...history.map(h => h.rate)) : 3.5;
  const padding = (maxRate - minRate) * 0.2;
  const yDomain = [(minRate - (padding || 0.01)).toFixed(4), (maxRate + (padding || 0.01)).toFixed(4)];

  return (
    <div className="glass-morphism rounded-3xl p-5 mb-6 bg-white/60 dark:bg-gray-900/50 border border-white/40 dark:border-white/10 shadow-sm">
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Session Trend</h3>
          <span className="px-2 py-1 rounded-lg bg-white/30 dark:bg-white/5 text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-white/20">
            Last {history.length} updates
          </span>
      </div>
      
      <div className="h-48 w-full">
        {history.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
             <span className="text-sm">Waiting for data...</span>
           </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={yDomain} 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(value) => parseFloat(value).toFixed(3)}
            />
            <Tooltip 
              contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(12px)',
                  color: '#1e293b',
                  padding: '8px 12px'
              }}
              itemStyle={{ color: '#007AFF', fontWeight: 600, fontSize: '12px' }}
              labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
              formatter={(value: number) => [value.toFixed(4), 'MYR']}
            />
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="#007AFF" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRate)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TrendChart;