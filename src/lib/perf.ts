/**
 * Lightweight, safe server-side performance timing utility.
 * Only logs in development mode; zero overhead in production.
 */
export interface PerfTracker {
  step: (name: string) => void;
  end: () => { totalMs: number; steps: Record<string, number> };
}

export function createPerfTracker(label: string): PerfTracker {
  const startTime = performance.now();
  let lastTime = startTime;
  const steps: Record<string, number> = {};

  return {
    step: (name: string) => {
      const now = performance.now();
      steps[name] = Math.round((now - lastTime) * 100) / 100;
      lastTime = now;
    },
    end: () => {
      const totalMs = Math.round((performance.now() - startTime) * 100) / 100;
      if (process.env.NODE_ENV === 'development') {
        const stepDetails = Object.entries(steps)
          .map(([k, v]) => `${k}: ${v}ms`)
          .join(' | ');
        console.log(`[PERF] ${label} -> Total: ${totalMs}ms${stepDetails ? ` (${stepDetails})` : ''}`);
      }
      return { totalMs, steps };
    },
  };
}
