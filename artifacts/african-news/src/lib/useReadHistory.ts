import { useState, useCallback } from "react";

const STORAGE_KEY = "an-read-ids";
const MAX_IDS = 500;

function loadIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as number[];
    return [];
  } catch {
    return [];
  }
}

function saveIds(ids: number[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
  }
}

export function useReadHistory() {
  const [readIds, setReadIds] = useState<Set<number>>(() => new Set(loadIds()));

  const markRead = useCallback((id: number) => {
    setReadIds(prev => {
      if (prev.has(id)) return prev;
      const current = loadIds();
      const updated = [id, ...current.filter(x => x !== id)].slice(0, MAX_IDS);
      saveIds(updated);
      return new Set(updated);
    });
  }, []);

  const markAllRead = useCallback((ids: number[]) => {
    setReadIds(prev => {
      const current = loadIds();
      const merged = [...ids, ...current.filter(x => !ids.includes(x))].slice(0, MAX_IDS);
      saveIds(merged);
      return new Set(merged);
    });
  }, []);

  const clearHistory = useCallback(() => {
    saveIds([]);
    setReadIds(new Set());
  }, []);

  const isRead = useCallback((id: number) => readIds.has(id), [readIds]);

  return { readIds, markRead, markAllRead, clearHistory, isRead };
}
