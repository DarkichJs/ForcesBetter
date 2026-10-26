const DEFAULTS = {
  enabled: true,
  theme: "system",
  radius: 12,
  accent: "#2dd4bf",
  font: "modern",
  wide: false,
  editor: true,
};

const $ = (id) => document.getElementById(id);

function render(s) {
  $("enabled").checked = s.enabled;
  $("settings").classList.toggle("disabled", !s.enabled);

  for (const btn of $("theme").children) {
    btn.setAttribute("aria-pressed", String(btn.dataset.value === s.theme));
  }
  for (const btn of $("accent").children) {
    btn.setAttribute("aria-pressed", String(btn.dataset.value === s.accent));
  }
  document.documentElement.style.setProperty("--accent", s.accent);

  $("radius").value = s.radius;
  $("radius-value").textContent = `${s.radius}px`;
  $("font").checked = s.font === "modern";
  $("wide").checked = s.wide;
  $("editor").checked = s.editor;
}

function save(patch) {
  chrome.storage.sync.set(patch);
}

chrome.storage.sync.get(DEFAULTS, render);
chrome.storage.onChanged.addListener((_, area) => {
  if (area === "sync") chrome.storage.sync.get(DEFAULTS, render);
});

$("enabled").addEventListener("change", (e) => save({ enabled: e.target.checked }));
$("font").addEventListener("change", (e) => save({ font: e.target.checked ? "modern" : "original" }));
$("wide").addEventListener("change", (e) => save({ wide: e.target.checked }));
$("editor").addEventListener("change", (e) => save({ editor: e.target.checked }));

$("radius").addEventListener("input", (e) => {
  $("radius-value").textContent = `${e.target.value}px`;
  save({ radius: Number(e.target.value) });
});

for (const id of ["theme", "accent"]) {
  $(id).addEventListener("click", (e) => {
    const value = e.target.closest("button")?.dataset.value;
    if (value) save({ [id]: value });
  });
}

$("reset").addEventListener("click", () => save(DEFAULTS));
