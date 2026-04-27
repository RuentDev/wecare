"use client";

import { useState, useCallback, useRef } from "react";

export interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string;
  load: (fetcher: () => Promise<T>) => void;
}

/**
 * Lightweight hook for async data fetching with loading / error state.
 * Cancels stale responses when called again before the previous resolves.
 */
export function useAsyncState<T>(initial: T): AsyncState<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelRef = useRef(false);

  const load = useCallback(async (fetcher: () => Promise<T>) => {
    cancelRef.current = false;
    setLoading(true);
    setError("");
    try {
      const result = await fetcher();
      if (!cancelRef.current) setData(result);
    } catch (err) {
      if (!cancelRef.current)
        setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (!cancelRef.current) setLoading(false);
    }
    // Return cleanup so callers can cancel if they unmount
    return () => {
      cancelRef.current = true;
    };
  }, []);

  return { data, loading, error, load };
}
