import { handlers } from "./handlers";

let starting: Promise<void> | null = null;

export function startMockWorker(): Promise<void> {
  if (starting) {
    return starting;
  }

  starting = (async () => {
    const { setupWorker } = await import("msw/browser");
    const worker = setupWorker(...handlers);
    await worker.start({
      onUnhandledRequest: "bypass",
      quiet: true,
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });
  })();

  return starting;
}
