// ForcesBetter content script.
// Runs at document_start: applies cached settings synchronously (no flash),
// then syncs with chrome.storage and injects the header theme toggle.
(() => {
  const DEFAULTS = {
    enabled: true,
    theme: "system", // "light" | "dark" | "system"
    radius: 12,
    accent: "#2dd4bf",
    font: "modern", // "modern" | "original"
    wide: false,
  };
  const CACHE_KEY = "forcesBetter:settings";
  const root = document.documentElement;
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  let settings = { ...DEFAULTS, ...readCache() };

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function writeCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
    } catch {}
  }

  function resolvedTheme() {
    if (settings.theme === "system") return darkQuery.matches ? "dark" : "light";
    return settings.theme;
  }

  function apply() {
    if (!settings.enabled) {
      for (const attr of ["data-cfb", "data-cfb-theme", "data-cfb-font", "data-cfb-wide"]) {
        root.removeAttribute(attr);
      }
      root.style.removeProperty("--cfb-radius");
      root.style.removeProperty("--cfb-accent");
      root.style.removeProperty("--cfb-on-accent");
      updateToggle();
      return;
    }
    root.setAttribute("data-cfb", "");
    root.setAttribute("data-cfb-theme", resolvedTheme());
    root.setAttribute("data-cfb-font", settings.font);
    if (settings.wide) root.setAttribute("data-cfb-wide", "");
    else root.removeAttribute("data-cfb-wide");
    root.style.setProperty("--cfb-radius", `${Number(settings.radius) || 0}px`);
    root.style.setProperty("--cfb-accent", settings.accent);
    root.style.setProperty("--cfb-on-accent", onAccent(settings.accent));
    updateToggle();
  }

  // Dark text on light accents (teal, amber), white on saturated ones (blue, violet).
  function onAccent(hex) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.5 ? "#06201c" : "#ffffff";
  }

  function update(patch) {
    settings = { ...settings, ...patch };
    writeCache();
    apply();
  }

  // --- Header toggle -------------------------------------------------------

  let toggle = null;

  function updateToggle() {
    if (!toggle) return;
    toggle.hidden = !settings.enabled;
    const dark = resolvedTheme() === "dark";
    toggle.textContent = dark ? "☀" : "☾";
    toggle.title = dark ? "Светлая тема" : "Тёмная тема";
  }

  function injectToggle() {
    if (window !== window.top) return;
    const host = document.querySelector("#header .lang-chooser");
    if (!host || host.querySelector(".cfb-theme-toggle")) return;
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "cfb-theme-toggle";
    toggle.addEventListener("click", () => {
      const theme = resolvedTheme() === "dark" ? "light" : "dark";
      update({ theme });
      chrome.storage.sync.set({ theme });
    });
    host.prepend(toggle);
    updateToggle();
  }

  // Limits are shown as icons; keep the hidden labels available as tooltips.
  function labelLimits() {
    for (const label of document.querySelectorAll(".problem-statement .header .property-title")) {
      label.parentElement.title = label.textContent.trim();
    }
  }

  // Text tweaks that CSS can't do: "→ Caption" arrows, lowercase sample titles.
  // Both are cosmetic and harmless to keep when the extension is switched off.
  function tidyText() {
    for (const caption of document.querySelectorAll(".caption.titled")) {
      const node = caption.firstChild;
      if (node?.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace(/^\s*→\s*/, "");
    }
    for (const title of document.querySelectorAll(".sample-test .title")) {
      const node = title.firstChild;
      if (node?.nodeType === Node.TEXT_NODE) {
        node.textContent = node.textContent.replace(/^\s*\S/, (c) => c.toUpperCase());
      }
    }
  }

  function onReady() {
    injectToggle();
    labelLimits();
    if (settings.enabled) tidyText();
  }

  // --- Wiring --------------------------------------------------------------

  apply();

  darkQuery.addEventListener("change", () => {
    if (settings.theme === "system") apply();
  });

  chrome.storage.sync.get(DEFAULTS, (stored) => update(stored));

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    const patch = {};
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key in DEFAULTS) patch[key] = newValue ?? DEFAULTS[key];
    }
    update(patch);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady, { once: true });
  } else {
    onReady();
  }
})();
