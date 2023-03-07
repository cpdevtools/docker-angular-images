export function loadConfig<TConfig = any>(): TConfig | undefined {
  try {
    const scriptTag = document.querySelector('> head > script[id="config"][type="application/json"]');
    if (scriptTag?.textContent) {
      return JSON.parse(scriptTag.textContent) as TConfig;
    }
  } catch {}
  return undefined;
}
