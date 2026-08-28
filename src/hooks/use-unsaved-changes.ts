"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { installUnsavedChangesGuard } from "@/lib/unsaved-changes";

export function useUnsavedChanges<T>(value: T, enabled: boolean) {
  const [baseline, setBaseline] = useState(() => JSON.stringify(value));
  const serialized = JSON.stringify(value);
  const latestValueRef = useRef(serialized);
  latestValueRef.current = serialized;
  const dirtyRef = useRef(false);
  dirtyRef.current = enabled && serialized !== baseline;

  const markSaved = useCallback((savedValue: T) => {
    const saved = JSON.stringify(savedValue);
    // Synchronous ref update lets an immediately following successful-save redirect proceed.
    dirtyRef.current = latestValueRef.current !== saved;
    setBaseline(saved);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    return installUnsavedChangesGuard(() => dirtyRef.current);
  }, [enabled]);

  return { isDirty: enabled && serialized !== baseline, markSaved };
}
