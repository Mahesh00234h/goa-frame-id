const VISITS_KEY = "fig:visits";
const CREATED_KEY = "fig:created";
const SESSION_KEY = "fig:session-counted";

function read(key: string): number {
  if (typeof window === "undefined") return 0;
  const n = Number(window.localStorage.getItem(key));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function write(key: string, value: number): number {
  if (typeof window !== "undefined") window.localStorage.setItem(key, String(value));
  return value;
}

export type LocalStats = { visits: number; created: number };

export function readStats(): LocalStats {
  return { visits: read(VISITS_KEY), created: read(CREATED_KEY) };
}

/** Counts one visit per browser tab session. */
export function countVisit(): LocalStats {
  if (typeof window === "undefined") return { visits: 0, created: 0 };
  if (!window.sessionStorage.getItem(SESSION_KEY)) {
    window.sessionStorage.setItem(SESSION_KEY, "1");
    write(VISITS_KEY, read(VISITS_KEY) + 1);
  }
  return readStats();
}

export function countCreated(): LocalStats {
  write(CREATED_KEY, read(CREATED_KEY) + 1);
  return readStats();
}