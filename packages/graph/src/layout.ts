import { inferSettings } from "graphology-layout-forceatlas2";
import forceAtlas2 from "graphology-layout-forceatlas2";
import type { MorphologyGraph } from "./adapter";

const LAYOUT_NODE_LIMIT = 80;
const LAYOUT_MS = 1200;

interface LayoutSupervisor {
  start: () => void;
  stop: () => void;
  kill: () => void;
}

export async function arrangeGraph(graph: MorphologyGraph, signal: AbortSignal): Promise<void> {
  if (graph.order <= LAYOUT_NODE_LIMIT || signal.aborted) {
    return;
  }

  const settings = inferSettings(graph);
  try {
    const loaded = (await import("graphology-layout-forceatlas2/worker")) as {
      default: new (
        graph: MorphologyGraph,
        params?: { settings?: ReturnType<typeof inferSettings> },
      ) => LayoutSupervisor;
    };
    if (signal.aborted) {
      return;
    }

    const layout = new loaded.default(graph, { settings });
    layout.start();
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        layout.stop();
        resolve();
      }, LAYOUT_MS);
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          layout.kill();
          resolve();
        },
        { once: true },
      );
    });
  } catch {
    await arrangeInFrames(graph, signal);
  }
}

async function arrangeInFrames(graph: MorphologyGraph, signal: AbortSignal): Promise<void> {
  const settings = inferSettings(graph);
  for (let step = 0; step < 8; step += 1) {
    if (signal.aborted) {
      return;
    }

    forceAtlas2.assign(graph, { iterations: 5, settings });
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }
}
