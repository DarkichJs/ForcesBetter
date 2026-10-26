(() => {
  if (window !== window.top || !window.ace) return;

  const root = document.documentElement;
  const content = document.getElementById("pageContent");
  const sidebar = document.getElementById("sidebar");
  if (!content?.querySelector(".problem-statement")) return;

  const problem = (() => {
    const path = location.pathname;
    let m = path.match(/^\/problemset\/problem\/(\d+)\/(\w+)/);
    if (m) return { key: m[1] + m[2], submit: "/problemset/submit", code: m[1] + m[2] };
    m = path.match(/^(\/(?:group\/\w+\/)?(?:contest|gym)\/(\d+))\/problem\/(\w+)/);
    if (m) return { key: m[2] + m[3], submit: `${m[1]}/submit`, index: m[3] };
    return null;
  })();
  if (!problem) return;

  const STORE = "forcesBetter:";
  const HANDOFF_KEY = STORE + "handoff";
  const load = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(STORE + key)) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const store = (key, value) => {
    try {
      localStorage.setItem(STORE + key, JSON.stringify(value));
    } catch {}
  };

  const MODES = [
    [/kotlin/i, "kotlin", ".kt"],
    [/javascript|node|v8/i, "javascript", ".js"],
    [/java/i, "java", ".java"],
    [/c#|mono|\.net/i, "csharp", ".cs"],
    [/python|pypy/i, "python", ".py"],
    [/rust/i, "rust", ".rs"],
    [/\bgo\b/i, "golang", ".go"],
    [/haskell/i, "haskell", ".hs"],
    [/pascal|delphi/i, "pascal", ".pas"],
    [/ruby/i, "ruby", ".rb"],
    [/scala/i, "scala", ".scala"],
    [/ocaml/i, "ocaml", ".ml"],
    [/perl/i, "perl", ".pl"],
    [/^d\b|dmd|ldc/i, "d", ".d"],
    [/c\+\+|g\+\+|clang|\bc\b|gnu c|msvc/i, "c_cpp", ".cpp"],
  ];

  const TEMPLATES = {
    c_cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    \n\n    return 0;\n}\n",
    python: "import sys\ninput = sys.stdin.readline\n\n\n",
    java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));\n        \n    }\n}\n",
    kotlin: "fun main() {\n    \n}\n",
    rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    \n}\n",
    golang: "package main\n\nimport (\n\t\"bufio\"\n\t\"fmt\"\n\t\"os\"\n)\n\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tout := bufio.NewWriter(os.Stdout)\n\tdefer out.Flush()\n\t_ = in\n\tfmt.Fprintln(out)\n}\n",
  };

  const modeOf = (name = "") => MODES.find(([re]) => re.test(name)) ?? [null, "c_cpp", ".cpp"];

  const ICONS = {
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v6.5L4.6 18.2A1.8 1.8 0 0 0 6.1 21h11.8a1.8 1.8 0 0 0 1.5-2.8L14 9.5V3"/><path d="M7.5 15h9"/>',
    send: '<path d="M14.5 21.5 22 2 2.5 9.5l8 3.5z"/><path d="m22 2-11.5 10.5"/>',
    folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
    list: '<path d="M11 6h10M11 12h10M11 18h10"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>',
    output: '<path d="M4 6h16M4 12h10M4 18h7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

  const el = (tag, props = {}, html = "") => {
    const node = Object.assign(document.createElement(tag), props);
    if (html) node.innerHTML = html;
    return node;
  };

  function preText(pre) {
    const clone = pre.cloneNode(true);
    clone.querySelectorAll(".testCaseMarker").forEach((m) => m.remove());
    const lines = clone.querySelectorAll(":scope > .test-example-line");
    let text;
    if (lines.length) text = [...lines].map((line) => line.textContent).join("\n");
    else {
      clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
      text = clone.textContent;
    }
    text = text.replace(/\r/g, "").replace(/^\n+/, "");
    return text.endsWith("\n") ? text : text + "\n";
  }

  function samples() {
    const inputs = [...content.querySelectorAll(".sample-test .input pre")];
    const outputs = [...content.querySelectorAll(".sample-test .output pre")];
    return inputs.map((pre, i) => ({ input: preText(pre), output: outputs[i] ? preText(outputs[i]) : "" }));
  }

  function sameOutput(expected, actual) {
    const a = expected.trim().split(/\s+/).filter(Boolean);
    const b = actual.trim().split(/\s+/).filter(Boolean);
    if (a.length !== b.length) return false;
    return a.every((x, i) => {
      const y = b[i];
      if (x === y) return true;
      if (/^(yes|no)$/i.test(x) && x.toLowerCase() === y.toLowerCase()) return true;
      if ((x.includes(".") || y.includes(".")) && !isNaN(x) && !isNaN(y)) {
        const p = Number(x);
        const q = Number(y);
        return Math.abs(p - q) <= 1e-6 * Math.max(1, Math.abs(p));
      }
      return false;
    });
  }

  let seq = 0;
  const pending = new Map();
  document.addEventListener("cfb:response", (event) => {
    const { id, result } = JSON.parse(event.detail);
    pending.get(id)?.(result);
    pending.delete(id);
  });
  const request = (url, data) =>
    new Promise((resolve) => {
      const id = ++seq;
      pending.set(id, resolve);
      document.dispatchEvent(new CustomEvent("cfb:request", { detail: JSON.stringify({ id, url, data }) }));
    });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const strip = (s) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  const loggedIn = () => !!document.querySelector('#header a[href^="/profile/"]');

  async function invoke(source, lang, input) {
    const start = await request("/data/customtest", {
      action: "submitSourceCode",
      communityCode: "",
      source,
      sourceCode: source,
      tabSize: "4",
      programTypeId: lang,
      input,
      output: "",
    });
    if (!start.ok) throw new Error(loggedIn() ? "Codeforces didn't accept the run. Try again in a moment." : "Log in to Codeforces to run code.");
    const id = start.json.customTestSubmitId;
    if (!id) {
      const errors = Object.entries(start.json)
        .filter(([k, v]) => /error/i.test(k) && typeof v === "string" && v.trim())
        .map(([, v]) => strip(v));
      throw new Error(errors.join(" ") || "Codeforces refused to run the code.");
    }
    const deadline = Date.now() + 90000;
    while (Date.now() < deadline) {
      await sleep(900);
      const poll = await request("/data/customtest", { communityCode: "", action: "getVerdict", customTestSubmitId: String(id) });
      const json = poll.ok ? poll.json : null;
      if (json && json.verdict != null && String(json.customTestSubmitId) === String(id)) {
        return { verdict: strip(json.verdict), output: String(json.output ?? ""), stat: strip(json.stat) };
      }
    }
    throw new Error("The run timed out. Codeforces may be busy, try again.");
  }

  const isOk = (verdict) => /^ok$/i.test(verdict) || /^(ok|успешно)/i.test(verdict);
  const isCompileError = (r) => /compil/i.test(r.verdict) || /компил/i.test(r.verdict);

  const ws = el("div", { className: "cfb-ws" });
  ws.innerHTML = `
    <section class="cfb-pane cfb-pane--editor">
      <header class="cfb-pane-head">
        <span class="cfb-pane-tab is-active">${icon("code")}Editor</span>
        <span class="cfb-spacer"></span>
        <button type="button" class="cfb-icon-btn" data-act="reset" title="Reset to template">${icon("reset")}</button>
      </header>
      <div class="cfb-toolbar">
        <select class="cfb-lang" title="Language"></select>
        <button type="button" class="cfb-icon-btn" data-act="open" title="Open a file">${icon("folder")}</button>
        <input type="file" hidden>
        <span class="cfb-spacer"></span>
        <button type="button" class="cfb-btn" data-act="run" title="Run with your input (Ctrl+Enter)">${icon("play")}<span>Run</span></button>
        <button type="button" class="cfb-btn" data-act="tests" title="Check all samples (Ctrl+Shift+Enter)">${icon("flask")}<span>Samples</span></button>
        <button type="button" class="cfb-btn cfb-btn--accent" data-act="submit" title="Submit">${icon("send")}<span>Submit</span></button>
      </div>
      <div class="cfb-ace"></div>
    </section>
    <div class="cfb-handle cfb-handle--row" title="Drag to resize"></div>
    <section class="cfb-pane cfb-pane--io">
      <header class="cfb-pane-head" role="tablist">
        <button type="button" class="cfb-pane-tab is-active" data-view="input">${icon("terminal")}Input</button>
        <button type="button" class="cfb-pane-tab" data-view="output">${icon("output")}Output</button>
        <button type="button" class="cfb-pane-tab" data-view="tests">${icon("list")}Samples</button>
        <span class="cfb-spacer"></span>
        <span class="cfb-status"></span>
      </header>
      <div class="cfb-view" data-view="input">
        <div class="cfb-view-bar"><span>Add your own test input below</span><span class="cfb-chips"></span></div>
        <textarea class="cfb-input" spellcheck="false" placeholder="stdin"></textarea>
      </div>
      <div class="cfb-view" data-view="output" hidden><div class="cfb-empty">Run the code to see its output.</div></div>
      <div class="cfb-view" data-view="tests" hidden><div class="cfb-empty">Check your solution on all samples from the statement.</div></div>
    </section>`;

  const $ = (sel) => ws.querySelector(sel);
  const langSelect = $(".cfb-lang");
  const inputArea = $(".cfb-input");
  const status = $(".cfb-status");
  const views = { input: $('.cfb-view[data-view="input"]'), output: $('.cfb-view[data-view="output"]'), tests: $('.cfb-view[data-view="tests"]') };

  function show(view) {
    for (const [name, node] of Object.entries(views)) node.hidden = name !== view;
    for (const tab of ws.querySelectorAll(".cfb-pane--io .cfb-pane-tab")) tab.classList.toggle("is-active", tab.dataset.view === view);
  }
  ws.querySelector(".cfb-pane--io .cfb-pane-head").addEventListener("click", (e) => {
    const view = e.target.closest("[data-view]")?.dataset.view;
    if (view) show(view);
  });

  const sampleList = samples();
  const chips = $(".cfb-chips");
  const markChip = () => {
    for (const [i, chip] of [...chips.children].entries()) {
      chip.classList.toggle("is-active", sampleList[i].input.trim() === inputArea.value.trim());
    }
  };
  sampleList.forEach((sample, i) => {
    const chip = el("button", { type: "button", className: "cfb-chip", textContent: `Sample ${i + 1}` });
    chip.addEventListener("click", () => {
      inputArea.value = sample.input;
      markChip();
    });
    chips.append(chip);
  });
  inputArea.value = sampleList[0]?.input ?? "";
  markChip();
  inputArea.addEventListener("input", markChip);

  ace.define("ace/theme/cfb", ["require", "exports"], (require, exports) => {
    exports.isDark = true;
    exports.cssClass = "ace-cfb";
    exports.cssText = "";
  });
  try {
    ace.require("ace/ext/language_tools");
  } catch {}

  const saved = load(`code:${problem.key}`, null);
  const editor = ace.edit($(".cfb-ace"), {
    theme: "ace/theme/cfb",
    mode: "ace/mode/c_cpp",
    useWorker: false,
    fontSize: 14,
    tabSize: 4,
    useSoftTabs: true,
    showPrintMargin: false,
    highlightActiveLine: true,
    fixedWidthGutter: true,
    scrollPastEnd: 0.4,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: false,
  });
  editor.renderer.setScrollMargin(10, 10);
  editor.renderer.setPadding(14);
  document.fonts?.ready.then(() => editor.renderer.updateFontSize());

  let mode = "c_cpp";
  function setMode(name) {
    const [, next, ext] = modeOf(name);
    mode = next;
    editor.session.setMode(`ace/mode/${next}`);
    return ext;
  }

  let langPicked = !!saved?.lang && !!load("lang", null);
  let saveTimer = 0;
  editor.session.on("change", () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCode, 300);
  });
  function saveCode() {
    store(`code:${problem.key}`, { lang: langPicked ? langSelect.value : null, source: editor.getValue() });
  }

  function fillLanguages(langs, preferred) {
    langSelect.replaceChildren(...langs.map(({ id, name }) => el("option", { value: id, textContent: name })));
    const ids = new Set(langs.map((l) => l.id));
    const pick = [langPicked ? saved?.lang : null, load("lang", null), bestCpp(langs), preferred, langs[0]?.id].find((id) => id && ids.has(id));
    if (pick) langSelect.value = pick;
    setMode(langSelect.selectedOptions[0]?.textContent);
  }

  function bestCpp(langs) {
    const score = ({ name }) => {
      const m = name.match(/G\+\+\s*(\d+)/);
      return m ? Number(m[1]) * 10 + (/64/.test(name) ? 1 : 0) : -1;
    };
    const best = langs.reduce((a, b) => (score(b) > score(a) ? b : a), langs[0]);
    return best && score(best) >= 0 ? best.id : null;
  }

  const readSelect = (select) => ({
    langs: [...select.options].filter((o) => o.value).map((o) => ({ id: o.value, name: o.textContent.trim() })),
    preferred: select.value,
  });

  async function loadLanguages() {
    const own = sidebar?.querySelector("select[name='programTypeId']");
    if (own) return readSelect(own);
    if (!loggedIn()) return null;
    try {
      const html = await fetch("/problemset/customtest", { credentials: "same-origin" }).then((r) => r.text());
      const select = new DOMParser().parseFromString(html, "text/html").querySelector("select[name='programTypeId']");
      return select ? readSelect(select) : null;
    } catch {
      return null;
    }
  }

  const cached = load("langs", null);
  if (cached?.length) fillLanguages(cached, null);
  else langSelect.append(el("option", { value: "", textContent: "GNU G++" }));
  loadLanguages().then((found) => {
    if (!found?.langs.length) return;
    store("langs", found.langs);
    fillLanguages(found.langs, found.preferred);
  });

  editor.setValue(saved?.source ?? TEMPLATES[mode] ?? "", -1);
  if (!saved) {
    const row = editor.session.getLength() > 6 ? 6 : 0;
    editor.moveCursorTo(row, 4);
  }

  langSelect.addEventListener("change", () => {
    const before = mode;
    langPicked = true;
    store("lang", langSelect.value);
    setMode(langSelect.selectedOptions[0]?.textContent);
    const current = editor.getValue();
    if (mode !== before && (!current.trim() || current === TEMPLATES[before])) editor.setValue(TEMPLATES[mode] ?? "", -1);
    saveCode();
  });

  const fileInput = $('input[type="file"]');
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (file) editor.setValue(await file.text(), -1);
    fileInput.value = "";
  });

  let busy = false;
  const buttons = () => ws.querySelectorAll('[data-act="run"], [data-act="tests"]');
  function setBusy(on, text = "") {
    busy = on;
    ws.classList.toggle("is-busy", on);
    for (const b of buttons()) b.disabled = on;
    status.textContent = text;
  }

  const pre = (text, cls = "") => el("pre", { className: `cfb-pre ${cls}`, textContent: text });

  function verdictLabel(r) {
    if (isCompileError(r)) return "Compilation error";
    if (isOk(r.verdict)) return "Finished";
    return r.verdict.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
  }

  async function run() {
    if (busy) return;
    saveCode();
    show("output");
    setBusy(true, "Running…");
    views.output.replaceChildren(el("div", { className: "cfb-empty cfb-loading", textContent: "Compiling and running on Codeforces…" }));
    try {
      const r = await invoke(editor.getValue(), langSelect.value, inputArea.value);
      const good = isOk(r.verdict);
      const head = el("div", { className: `cfb-result-head ${good ? "is-ok" : "is-bad"}` });
      head.append(el("strong", { textContent: verdictLabel(r) }), el("span", { textContent: r.stat }));
      views.output.replaceChildren(head, pre(r.output || " "));
      setBusy(false);
    } catch (error) {
      views.output.replaceChildren(el("div", { className: "cfb-result-head is-bad" }, `<strong></strong>`));
      views.output.querySelector("strong").textContent = error.message;
      setBusy(false);
    }
  }

  async function runTests() {
    if (busy) return;
    saveCode();
    const list = samples();
    show("tests");
    if (!list.length) {
      views.tests.replaceChildren(el("div", { className: "cfb-empty", textContent: "This problem has no samples." }));
      return;
    }
    const summary = el("div", { className: "cfb-tests-summary" });
    const cards = list.map((sample, i) => {
      const card = el("details", { className: "cfb-test is-pending" });
      card.innerHTML = `<summary><span class="cfb-test-dot"></span><strong>Sample ${i + 1}</strong><span class="cfb-test-verdict">Waiting</span><span class="cfb-test-stat"></span></summary><div class="cfb-test-body"></div>`;
      return card;
    });
    views.tests.replaceChildren(summary, ...cards);
    setBusy(true, "Testing…");
    let passed = 0;
    try {
      for (let i = 0; i < list.length; i++) {
        const card = cards[i];
        card.className = "cfb-test is-running";
        card.querySelector(".cfb-test-verdict").textContent = "Running…";
        summary.textContent = `Running sample ${i + 1} of ${list.length}…`;
        const r = await invoke(editor.getValue(), langSelect.value, list[i].input);
        const body = card.querySelector(".cfb-test-body");
        if (isCompileError(r)) {
          card.className = "cfb-test is-bad";
          card.open = true;
          card.querySelector(".cfb-test-verdict").textContent = "Compilation error";
          body.append(pre(r.output));
          cards.slice(i + 1).forEach((c) => c.remove());
          break;
        }
        const ok = isOk(r.verdict) && sameOutput(list[i].output, r.output);
        if (ok) passed++;
        card.className = `cfb-test ${ok ? "is-ok" : "is-bad"}`;
        card.open = !ok;
        card.querySelector(".cfb-test-verdict").textContent = ok ? "Passed" : isOk(r.verdict) ? "Wrong answer" : verdictLabel(r);
        card.querySelector(".cfb-test-stat").textContent = r.stat;
        const grid = el("div", { className: "cfb-test-grid" });
        for (const [title, text] of [["Input", list[i].input], ["Expected", list[i].output], ["Output", r.output]]) {
          const col = el("div");
          col.append(el("span", { className: "cfb-test-label", textContent: title }), pre(text || " "));
          grid.append(col);
        }
        body.append(grid);
      }
      summary.textContent = `${passed} of ${list.length} samples passed`;
      summary.classList.toggle("is-ok", passed === list.length);
      setBusy(false, `${passed}/${list.length} passed`);
    } catch (error) {
      summary.textContent = error.message;
      summary.classList.add("is-bad");
      cards.filter((c) => !/is-(ok|bad)/.test(c.className)).forEach((c) => c.remove());
      setBusy(false);
    }
  }

  function submit() {
    saveCode();
    const source = editor.getValue();
    if (!source.trim()) return;
    const lang = langSelect.value;
    const form = sidebar?.querySelector("form:has(input[type='file'][name='sourceFile'])");
    const token = form?.querySelector("[name='cf-turnstile-response']")?.value;
    const guarded = form?.querySelector(".cf-turnstile, .turnstile-container");
    if (form && (token || !guarded)) {
      const select = form.querySelector("select[name='programTypeId']");
      if (select && lang) select.value = lang;
      const [, , ext] = modeOf(langSelect.selectedOptions[0]?.textContent);
      const files = new DataTransfer();
      files.items.add(new File([source], `solution${ext}`, { type: "text/plain" }));
      form.querySelector("input[name='sourceFile']").files = files.files;
      form.requestSubmit(form.querySelector("input[type='submit']") ?? undefined);
      return;
    }
    try {
      localStorage.setItem(HANDOFF_KEY, JSON.stringify({ time: Date.now(), source, lang, index: problem.index, code: problem.code }));
    } catch {}
    location.href = problem.submit;
  }

  ws.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "run") run();
    else if (act === "tests") runTests();
    else if (act === "submit") submit();
    else if (act === "open") fileInput.click();
    else if (act === "reset" && confirmReset()) editor.setValue(TEMPLATES[mode] ?? "", -1);
  });

  let resetArmed = 0;
  function confirmReset() {
    const button = $('[data-act="reset"]');
    if (Date.now() - resetArmed < 2500) {
      button.classList.remove("is-armed");
      resetArmed = 0;
      return true;
    }
    resetArmed = Date.now();
    button.classList.add("is-armed");
    button.title = "Click again to reset";
    setTimeout(() => {
      button.classList.remove("is-armed");
      button.title = "Reset to template";
    }, 2500);
    return false;
  }

  editor.commands.addCommands([
    { name: "cfbRun", bindKey: { win: "Ctrl-Enter", mac: "Cmd-Enter" }, exec: run },
    { name: "cfbTests", bindKey: { win: "Ctrl-Shift-Enter", mac: "Cmd-Shift-Enter" }, exec: runTests },
    { name: "cfbSave", bindKey: { win: "Ctrl-S", mac: "Cmd-S" }, exec: saveCode },
  ]);
  inputArea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.shiftKey ? runTests() : run();
    }
  });

  const split = el("div", { className: "cfb-split" });
  const main = el("div", { className: "cfb-split-main" });
  const handle = el("div", { className: "cfb-handle cfb-handle--col", title: "Drag to resize" });
  split.append(main, handle, ws);
  const anchor = el("div", { hidden: true });

  function mount() {
    if (split.isConnected && main.contains(content)) return;
    (sidebar && sidebar.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING ? sidebar : content).before(anchor);
    anchor.after(split);
    const menu = content.querySelector(":scope > .second-level-menu");
    if (menu) split.before(menu);
    main.append(content);
    if (sidebar) main.append(sidebar);
    requestAnimationFrame(() => editor.resize());
  }

  function unmount() {
    if (!split.isConnected) return;
    if (sidebar) anchor.before(sidebar);
    anchor.before(content);
    const menu = split.previousElementSibling;
    if (menu?.classList.contains("second-level-menu")) content.prepend(menu);
    split.remove();
  }

  const width = load("split", 0.5);
  split.style.setProperty("--cfb-left", `${Math.round(width * 1000) / 10}%`);
  ws.style.setProperty("--cfb-io-h", `${load("ioHeight", 240)}px`);

  function drag(handleEl, onMove, onEnd) {
    handleEl.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      handleEl.setPointerCapture(e.pointerId);
      root.classList.add("cfb-dragging");
      const move = (ev) => {
        onMove(ev);
        editor.resize();
      };
      const up = () => {
        handleEl.removeEventListener("pointermove", move);
        root.classList.remove("cfb-dragging");
        onEnd();
      };
      handleEl.addEventListener("pointermove", move);
      handleEl.addEventListener("pointerup", up, { once: true });
      handleEl.addEventListener("pointercancel", up, { once: true });
    });
  }

  let ratio = width;
  drag(
    handle,
    (e) => {
      const box = split.getBoundingClientRect();
      ratio = Math.min(0.72, Math.max(0.28, (e.clientX - box.left) / box.width));
      split.style.setProperty("--cfb-left", `${Math.round(ratio * 1000) / 10}%`);
    },
    () => store("split", ratio),
  );

  let ioHeight = load("ioHeight", 240);
  drag(
    $(".cfb-handle--row"),
    (e) => {
      const box = ws.getBoundingClientRect();
      ioHeight = Math.min(box.height - 160, Math.max(110, box.bottom - e.clientY));
      ws.style.setProperty("--cfb-io-h", `${ioHeight}px`);
    },
    () => store("ioHeight", ioHeight),
  );

  const toggle = el("button", { type: "button", className: "cfb-editor-toggle" }, icon("code"));
  toggle.addEventListener("click", () => {
    const on = !root.hasAttribute("data-cfb-editor");
    chrome.storage.sync.set({ editor: on });
  });

  function sync() {
    const on = root.hasAttribute("data-cfb") && root.hasAttribute("data-cfb-editor");
    if (on) mount();
    else unmount();
    toggle.hidden = !root.hasAttribute("data-cfb");
    toggle.title = on ? "Hide the code editor" : "Show the code editor";
    toggle.setAttribute("aria-pressed", String(on));
    if (!toggle.isConnected) placeToggle();
    fit();
  }

  function placeToggle() {
    const host = document.querySelector("#header .lang-chooser");
    if (!host) return;
    const actions = el("div", { className: "cfb-header-actions" });
    actions.append(toggle);
    const theme = host.querySelector(".cfb-theme-toggle");
    if (theme) actions.append(theme);
    host.prepend(actions);
  }

  let fitFrame = 0;
  function fit() {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => {
      if (!split.isConnected) return;
      const top = split.getBoundingClientRect().top + window.scrollY;
      let height = Math.max(480, Math.round(window.innerHeight - top - 12));
      split.style.setProperty("--cfb-split-h", `${height}px`);
      const overflow = document.documentElement.scrollHeight - window.innerHeight;
      if (root.hasAttribute("data-cfb-no-footer") && overflow > 0 && height - overflow >= 480) {
        height -= overflow;
        split.style.setProperty("--cfb-split-h", `${height}px`);
      }
    });
  }

  sync();
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-cfb", "data-cfb-editor", "data-cfb-no-footer"] });
  window.addEventListener("resize", fit);
  new ResizeObserver(() => editor.resize()).observe($(".cfb-ace"));
})();
