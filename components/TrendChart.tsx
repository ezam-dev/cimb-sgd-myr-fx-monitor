import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExchangeHistoryItem } from '../types';

interface TrendChartProps {
  history: ExchangeHistoryItem[];
}

const TrendChart: React.FC<TrendChartProps> = ({ history }) => {
  // If history is empty, use placeholders so the chart doesn't collapse
  const displayData = history.length > 0 ? history : [
    { time: 'No Data', rate: 0 }
  ];

  // Calculate domain for Y-axis to make the chart look dynamic
  const minRate = history.length ? Math.min(...history.map(h => h.rate)) : 3.0;
  const maxRate = history.length ? Math.max(...history.map(h => h.rate)) : 3.5;
  
  const padding = (maxRate - minRate) * 0.2;
  // Prevent flat line if min == max
  const yDomain = [
    (minRate - (padding || 0.01)).toFixed(4), 
    (maxRate + (padding || 0.01)).toFixed(4)
  ];

  return (
    <div className="bg-white dark:bg-ios-darkCard rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 p-5 mb-6 transition-colors">
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">Session Trend</h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Last {history.length} updates</span>
      </div>
      
      <div className="h-48 w-full">
        {history.length === 0 ? (
           <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
             Waiting for data points...
           </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
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
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#1e293b'
              }}
              itemStyle={{ color: '#007AFF', fontWeight: 600 }}
              formatter={(value: number) => [value.toFixed(4), 'MYR']}
            />
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="#007AFF" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRate)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
      <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">
        * Real-time session data
      </p>
    </div>
  );
};

export default TrendChart;