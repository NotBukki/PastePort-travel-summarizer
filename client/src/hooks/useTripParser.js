import { useState, useCallback } from 'react';

export function useTripParser() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    result: null,
    travelerType: null,
  });

  const parse = useCallback(async (segments, travelerType = 'mid-range') => {
    setState({ loading: true, error: null, result: null, travelerType });
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segments, travelerType }),
      });
      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error('Server is starting up — please try again in a moment.');
      }
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to parse documents.');
      }
      setState({ loading: false, error: null, result: json.data, travelerType });
    } catch (err) {
      setState({ loading: false, error: err.message, result: null, travelerType });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, result: null, travelerType: null });
  }, []);

  return { ...state, parse, reset };
}
