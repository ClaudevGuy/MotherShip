"use client";

import { useEffect, useRef } from "react";

export function usePolling(
  fn: () => void,
  interval: number,
  enabled: boolean = true
) {
  const callbackRef = useRef(fn);

  useEffect(() => {
    callbackRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      callbackRef.current();
    }, interval);

    return () => clearInterval(id);
  }, [interval, enabled]);
}
