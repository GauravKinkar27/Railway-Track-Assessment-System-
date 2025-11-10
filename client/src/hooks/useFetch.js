// client/src/hooks/useFetch.js
// This custom hook is used by all pages to fetch data from the backend.
// It includes loading, error, and cleanup handling.

import { useState, useEffect } from 'react';

export default function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    // The '/api' prefix is handled by the Vite proxy in development.
    fetch(`/api${url}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Network response error (status: ${res.status})`);
        }
        return res.json();
      })
      .then(jsonData => {
        if (!cancelled) {
          setData(jsonData);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    // Cleanup function to prevent state updates on unmounted components.
    return () => {
      cancelled = true;
    };
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

