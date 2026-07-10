export function wsUrlError(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
      return "invalid protocol";
    }
    return null;
  } catch {
    return "invalid url";
  }
}
