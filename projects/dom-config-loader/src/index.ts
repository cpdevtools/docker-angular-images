export function loadConfig<TConfig = any>(): TConfig | undefined {
  try {
    if (typeof document !== "undefined") {
      const scriptTag = document.querySelector('html > head > script[id="config"][type="application/json"]');
      if (scriptTag?.textContent) {
        return JSON.parse(scriptTag.textContent) as TConfig;
      }
    }
  } catch (e) {
    console.warn(`Could not load config`);
    console.warn(e);
  }
  return undefined;
}
