import { useState, useEffect, useCallback } from 'react';
import { fetchCimbRate } from '../services/geminiService';
import { RateData, AppStatus } from '../types';

export const useExchangeRate = (pollIntervalMs: number = 60000) => {
  const [data, setData] = useState<RateData | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    setStatus(AppStatus.LOADING);
    setError(null);
    try {
      const result = await fetchCimbRate();
      setData(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      setStatus(AppStatus.ERROR);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
    }
  }, []);

  const setRate = useCallback((manualData: RateData) => {
    setData(manualData);
    setStatus(AppStatus.SUCCESS);
    setError(null);
  }, []);

  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchRate, pollIntervalMs]);

  return { data, status, error, refetch: fetchRate, setRate };
};