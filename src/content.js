(() => {
  const DEFAULTS = {
    enabled: true,
    theme: "system",
    radius: 12,
    accent: "#2dd4bf",
    font: "modern",
    wide: false,
    editor: true,
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
      for (const attr of ["data-cfb", "data-cfb-theme", "data-cfb-font", "data-cfb-wide", "data-cfb-editor"]) {
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
    if (settings.editor) root.setAttribute("data-cfb-editor", "");
    else root.removeAttribute("data-cfb-editor");
    root.style.setProperty("--cfb-radius", `${Number(settings.radius) || 0}px`);
    root.style.setProperty("--cfb-accent", settings.accent);
    root.style.setProperty("--cfb-on-accent", onAccent(settings.accent));
    updateToggle();
  }

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

  let toggle = null;

  function updateToggle() {
    if (!toggle) return;
    toggle.hidden = !settings.enabled;
    const dark = resolvedTheme() === "dark";
    toggle.textContent = dark ? "☀" : "☾";
    toggle.title = dark ? "Light theme" : "Dark theme";
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
    const actions = host.querySelector(".cfb-header-actions");
    if (actions) actions.append(toggle);
    else host.prepend(toggle);
    updateToggle();
  }

  function labelLimits() {
    for (const label of document.querySelectorAll(".problem-statement .header .property-title")) {
      label.parentElement.title = label.textContent.trim();
    }
  }

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

  const LEVELS = [
    { id: "easy", label: "Easy", min: 800, max: 1200 },
    { id: "medium", label: "Medium", min: 1300, max: 1900 },
    { id: "hard", label: "Hard", min: 2000, max: 3500 },
  ];

  function levelOf(rating) {
    return LEVELS.find((level) => rating <= level.max) ?? LEVELS[LEVELS.length - 1];
  }

  function badge(rating) {
    const level = levelOf(rating);
    const el = document.createElement("span");
    el.className = `cfb-diff cfb-diff--${level.id}`;
    el.textContent = level.label;
    el.title = `Problem rating: ${rating}`;
    return el;
  }

  function badgeProblemList() {
    for (const cell of document.querySelectorAll("table.problems .ProblemRating")) {
      const rating = parseInt(cell.textContent, 10);
      if (!rating) continue;
      const row = cell.closest("tr");
      const title = row?.cells[1]?.querySelector("div > a");
      if (!title || title.parentElement.querySelector(".cfb-diff")) continue;
      cell.classList.add(`cfb-rating--${levelOf(rating).id}`);
      title.after(badge(rating));
    }
  }

  function addLevelFilter() {
    const form = document.querySelector("form:has(input[name=minDifficulty])");
    if (!form || form.querySelector(".cfb-diff-filter")) return;
    const min = form.querySelector("input[name=minDifficulty]");
    const max = form.querySelector("input[name=maxDifficulty]");

    const bar = document.createElement("div");
    bar.className = "cfb-diff-filter";
    for (const level of LEVELS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `cfb-diff cfb-diff--${level.id}`;
      button.textContent = level.label;
      button.title = `${level.min}–${level.max}`;
      const active = min.value == level.min && max.value == level.max;
      button.setAttribute("aria-pressed", String(active));
      button.addEventListener("click", () => {
        min.value = active ? "" : level.min;
        max.value = active ? "" : level.max;
        form.requestSubmit(form.querySelector("input[type=submit]") ?? undefined);
      });
      bar.append(button);
    }
    form.prepend(bar);
  }

  function badgeProblemHeader() {
    const header = document.querySelector(".problem-statement .header");
    if (!header || header.querySelector(".cfb-diff")) return;
    const tag = [...document.querySelectorAll(".tag-box")].find((t) => /^\*\d+$/.test(t.textContent.trim()));
    if (!tag) return;
    const rating = parseInt(tag.textContent.trim().slice(1), 10);
    const el = badge(rating);
    el.textContent = `${el.textContent} · ${rating}`;
    header.querySelector(".title")?.after(el);
  }

  function groupSampleLines() {
    const caseOf = (line) => [...line.classList].find((c) => /^test-example-line-\d+$/.test(c));
    for (const pre of document.querySelectorAll(".sample-test pre")) {
      const lines = [...pre.querySelectorAll(".test-example-line")];
      if (!lines.length || pre.dataset.cfbGrouped) continue;
      pre.dataset.cfbGrouped = "";
      lines.forEach((line, i) => {
        line.classList.toggle("cfb-tc-first", caseOf(line) !== caseOf(lines[i - 1] ?? pre));
        line.classList.toggle("cfb-tc-last", caseOf(line) !== caseOf(lines[i + 1] ?? pre));
      });
      const highlight = (target, on) => {
        const id = target?.closest?.(".test-example-line") && caseOf(target.closest(".test-example-line"));
        if (id) for (const line of pre.getElementsByClassName(id)) line.classList.toggle("cfb-tc-hover", on);
      };
      pre.addEventListener("mouseover", (e) => highlight(e.target, true));
      pre.addEventListener("mouseout", (e) => highlight(e.target, false));
    }
  }

  function onReady() {
    groupSampleLines();
    injectToggle();
    labelLimits();
    badgeProblemList();
    addLevelFilter();
    badgeProblemHeader();
    if (settings.enabled) tidyText();
  }

  function themeTurnstile(scope) {
    if (!settings.enabled || resolvedTheme() !== "dark") return;
    for (const widget of scope.querySelectorAll(".cf-turnstile:not([data-theme])")) {
      widget.setAttribute("data-theme", "dark");
    }
  }

  function watchTurnstile() {
    const observer = new MutationObserver(() => themeTurnstile(document));
    observer.observe(root, { childList: true, subtree: true });
    window.addEventListener("load", () => observer.disconnect(), { once: true });
  }

  apply();
  watchTurnstile();

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
