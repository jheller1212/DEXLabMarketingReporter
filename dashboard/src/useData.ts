import { useState, useEffect } from "react";
import type { Snapshot, SnapshotIndex } from "./types";

interface DataState {
  loading: boolean;
  error: string | null;
  snapshots: Snapshot[];
  latest: Snapshot | null;
}

export function useData(): DataState {
  const [state, setState] = useState<DataState>({
    loading: true,
    error: null,
    snapshots: [],
    latest: null,
  });

  useEffect(() => {
    async function load() {
      try {
        // Load index and latest in parallel
        const base = import.meta.env.BASE_URL;
        const [indexRes, latestRes] = await Promise.all([
          fetch(`${base}data/index.json`),
          fetch(`${base}data/latest.json`),
        ]);

        if (!indexRes.ok || !latestRes.ok) {
          throw new Error("Failed to load data files");
        }

        const index: SnapshotIndex = await indexRes.json();
        const latest: Snapshot = await latestRes.json();

        // Load all snapshots
        const snapshotPromises = index.snapshots.map(async (date) => {
          const res = await fetch(`${base}data/snapshots/${date}.json`);
          if (!res.ok) throw new Error(`Failed to load snapshot ${date}`);
          return res.json() as Promise<Snapshot>;
        });

        const snapshots = await Promise.all(snapshotPromises);
        // Sort by date ascending
        snapshots.sort((a, b) => a.date.localeCompare(b.date));

        setState({ loading: false, error: null, snapshots, latest });
      } catch (err) {
        setState({
          loading: false,
          error: err instanceof Error ? err.message : "Unknown error",
          snapshots: [],
          latest: null,
        });
      }
    }

    load();
  }, []);

  return state;
}
