export function reportError(error: unknown): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.error(error);
}
