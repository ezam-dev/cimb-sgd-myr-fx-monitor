export interface RateData {
  rate: number;
  lastUpdated: string;
  sourceUrl?: string;
}

export interface ExchangeHistoryItem {
  time: string; // HH:MM format
  fullTimestamp: number; // Unix timestamp for sorting/export
  rate: number;
}

export interface AlertLogItem {
  id: string;
  timestamp: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type Theme = 'light' | 'dark';